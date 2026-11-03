"use client";

/**
 * Copy of Store/src/components/search/SearchOverlay.tsx
 * Changes:
 *   - Data source: useStaticSearch (fumadocs static index) instead of the
 *     dashboard's multi-source search (local registry + snapshot + /api/search).
 *   - Grouping: results grouped by page URL instead of by entity type.
 *   - Icons: FileText / Hash / AlignLeft for page / heading / text results.
 *   - Strings: searchCopy + interpolate (copy.ts) instead of next-intl.
 *   - Text: the static index keeps inline Markdown, so rows show plainText().
 *   - Keyboard hint on bg-background, as in SearchTrigger (contrast).
 *   - Locale: useLocaleContext() instead of useTranslations().
 *   - Navigation: useRouter from next/navigation (no navigation-blocker).
 *   - Removed: team roles, snapshot cache, "Recent" rail, local registry,
 *     remote API search, multi-retry fetch, remote status notices.
 *   - No changes to the visual layout, animation, ARIA structure, or keyboard
 *     behaviour: those are copied verbatim.
 */

import * as React from "react";
import { useRouter } from "next/navigation";
import { AlignLeft, FileText, Hash } from "lucide-react";
import { useStaticSearch } from "fumadocs-core/search/client";
import type { SearchResultRecord } from "fumadocs-core/search/client";
import { cn } from "@/lib/cn";
import { SEARCH_INDEX_PATH } from "@/lib/urls";
import { useLocaleContext } from "@/components/locale-context";
import {
  SearchBar,
  SearchGroupHeading,
  SearchOption,
  useActiveOption,
} from "@/components/search/SearchBar";
import { useIsMacPlatform } from "@/components/search/useIsMacPlatform";
import { searchCopy, interpolate } from "@/components/search/copy";

// ---------------------------------------------------------------------------
// Control-style constants (inlined from the dashboard's control-styles.ts)
// ---------------------------------------------------------------------------

const overlaySurfaceClass =
  "rounded-none border border-border bg-popover text-popover-foreground shadow-lg";

// ---------------------------------------------------------------------------
// Layout constants
// ---------------------------------------------------------------------------

/** Breathing room between the panel and viewport edges. */
const EDGE_GUTTER = 16;
/** 30rem: noticeably wider than the resting bar, no near-half-screen spread. */
const PANEL_WIDTH = 480;

// ---------------------------------------------------------------------------
// Geometry helper (exported for unit tests)
// ---------------------------------------------------------------------------

/**
 * Computes inline style for the anchored panel.
 * Copied verbatim from Store; see its extensive comments for rationale.
 */
export function anchoredPanelStyle(
  rect: DOMRect,
  expanded: boolean,
  viewportWidth: number,
): React.CSSProperties {
  const left = Math.max(rect.left, EDGE_GUTTER);
  const roomRight = viewportWidth - EDGE_GUTTER - left;
  const roomLeft = rect.right - EDGE_GUTTER;
  const growLeft = roomRight < PANEL_WIDTH && roomLeft > roomRight;
  const width = Math.min(
    PANEL_WIDTH,
    Math.max(rect.width, growLeft ? roomLeft : roomRight),
  );
  return {
    top: rect.top,
    width: expanded ? width : rect.width,
    ...(growLeft
      ? { right: Math.max(EDGE_GUTTER, viewportWidth - rect.right) }
      : { left: Math.min(left, viewportWidth - width - EDGE_GUTTER) }),
  };
}

// ---------------------------------------------------------------------------
// Docs-specific data model
// ---------------------------------------------------------------------------

type DocsResult = {
  id: string;
  url: string;
  type: "page" | "heading" | "text";
  title: string;
  subtitle: string | null;
};

type DocsGroup = {
  id: string;
  label: string;
  results: DocsResult[];
};

const TYPE_ICON: Record<DocsResult["type"], React.ComponentType<{ className?: string; "aria-hidden"?: boolean }>> = {
  page: FileText,
  heading: Hash,
  text: AlignLeft,
};

/** Drop inline Markdown (emphasis, code ticks, link targets) from an index entry. */
function plainText(content: string): string {
  return content
    .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/\*\*|__|`/g, "")
    .replace(/(^|\s)[*_]([^*_\s][^*_]*)[*_](?=\s|[.,;:!?]|$)/g, "$1$2");
}

/**
 * Group flat fumadocs search results by page.
 *
 * Each page that has at least one matching item becomes a group. The group
 * label is the page title (from a page-type result, or the first breadcrumb of
 * a child result). All matching items (page, headings, text) appear as rows.
 * When a page-type result AND heading/text results exist for the same page, the
 * page-type row is dropped: the group label already represents that page, and
 * duplicating the title wastes a row the headings and text would fill better.
 */
function buildDocsGroups(items: SearchResultRecord[]): DocsGroup[] {
  const pageTitles = new Map<string, string>();
  const pageItems = new Map<string, DocsResult[]>();
  const urlOrder: string[] = [];
  const urlSeen = new Set<string>();

  for (const item of items) {
    const baseUrl = item.url.split("#")[0] ?? item.url;

    if (!urlSeen.has(baseUrl)) {
      urlSeen.add(baseUrl);
      urlOrder.push(baseUrl);
      pageItems.set(baseUrl, []);
    }

    if (item.type === "page") {
      pageTitles.set(baseUrl, plainText(item.content));
    } else if (!pageTitles.has(baseUrl) && item.breadcrumbs?.[0]) {
      pageTitles.set(baseUrl, plainText(item.breadcrumbs[0]));
    }

    const subtitle =
      item.type !== "page" && item.breadcrumbs && item.breadcrumbs.length > 0
        ? item.breadcrumbs.join(" / ")
        : null;

    pageItems.get(baseUrl)!.push({
      id: item.id,
      url: item.url,
      type: item.type,
      title: plainText(item.content),
      subtitle,
    });
  }

  const groups: DocsGroup[] = [];

  for (const baseUrl of urlOrder) {
    const rawResults = pageItems.get(baseUrl) ?? [];
    if (rawResults.length === 0) continue;

    const hasChildren = rawResults.some((r) => r.type !== "page");
    const results = hasChildren
      ? rawResults.filter((r) => r.type !== "page")
      : rawResults;

    if (results.length === 0) continue;

    groups.push({
      id: baseUrl,
      label: pageTitles.get(baseUrl) ?? baseUrl,
      results,
    });
  }

  return groups;
}

// ---------------------------------------------------------------------------
// Main overlay component
// ---------------------------------------------------------------------------

export function SearchOverlay({
  open,
  onClose,
  anchorRect = null,
  anchorsRef,
}: {
  open: boolean;
  onClose: () => void;
  anchorRect?: DOMRect | null;
  anchorsRef?: React.RefObject<Set<HTMLElement>>;
}) {
  const { locale } = useLocaleContext();
  const copy = searchCopy[locale];
  const router = useRouter();
  const isMac = useIsMacPlatform();

  // The search hook owns the query string. It is called unconditionally so
  // that the index stays in memory across open/close cycles.
  const { search, onSearchChange, isLoading, data } = useStaticSearch({
    from: SEARCH_INDEX_PATH,
    locale,
  });

  const inputRef = React.useRef<HTMLInputElement>(null);
  const listboxId = React.useId();
  const optionId = React.useCallback(
    (id: string) => `${listboxId}-${id}`,
    [listboxId],
  );

  // Build grouped results from whatever the hook last returned.
  const groups = React.useMemo<DocsGroup[]>(() => {
    if (!data) return [];
    const records = data.items.filter(
      (item): item is SearchResultRecord => item.type !== "table",
    );
    return buildDocsGroups(records);
  }, [data]);

  const flat = React.useMemo(
    () => groups.flatMap((g) => g.results),
    [groups],
  );
  const ids = React.useMemo(() => flat.map((r) => r.id), [flat]);

  const {
    activeId,
    choose: setChosenId,
    move: moveActive,
  } = useActiveOption(ids, optionId);

  // ---- animation / resize state ------------------------------------------

  // Tri-state: undefined = "trust the provider's rect"; null = "a resize
  // happened and there is no anchor" (distinct from the initial undefined).
  const [resizedRect, setResizedRect] = React.useState<
    DOMRect | null | undefined
  >(undefined);

  // THE MORPH. First paint at trigger size; one frame later width/max-height
  // transition to full values. Reset on every open so each opening morphs.
  const [expanded, setExpanded] = React.useState(false);

  // Detect open/close transitions during render (React's documented pattern).
  const [wasOpen, setWasOpen] = React.useState(open);
  if (open !== wasOpen) {
    setWasOpen(open);
    setResizedRect(undefined);
    setExpanded(false);
    if (!open) {
      onSearchChange("");
      setChosenId(null);
    }
  }

  // Morph trigger: one rAF after open so the browser paints the start state
  // first and the CSS transition has two keyframes to interpolate between.
  React.useEffect(() => {
    if (!open) return;
    const frame = requestAnimationFrame(() => setExpanded(true));
    return () => cancelAnimationFrame(frame);
  }, [open]);

  // Track the trigger through window resize while open.
  React.useEffect(() => {
    if (!open || !anchorsRef) return;
    function update() {
      const visible = [...(anchorsRef?.current ?? [])].find(
        (el) => el.offsetParent !== null && el.getBoundingClientRect().width > 0,
      );
      setResizedRect(
        window.matchMedia("(min-width: 640px)").matches
          ? (visible?.getBoundingClientRect() ?? null)
          : null,
      );
    }
    window.addEventListener("resize", update, { passive: true });
    return () => window.removeEventListener("resize", update);
  }, [open, anchorsRef]);

  const effectiveAnchorRect = resizedRect === undefined ? anchorRect : resizedRect;

  // ---- focus / scroll lock ------------------------------------------------

  const panelRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (!open) return;
    const previouslyFocused = document.activeElement as HTMLElement | null;
    const anchored = anchorRect !== null;
    const previousOverflow = document.body.style.overflow;
    if (!anchored) document.body.style.overflow = "hidden";
    inputRef.current?.focus();
    return () => {
      if (!anchored) document.body.style.overflow = previousOverflow;
      previouslyFocused?.focus?.();
    };
  }, [open, anchorRect]);

  // Outside-click: capture phase like Popover so stopPropagation never wedges
  // the panel open. Click still REACHES the target (wrapper is pointer-none).
  React.useEffect(() => {
    if (!open) return;
    function onPointerDown(event: PointerEvent) {
      if (!panelRef.current?.contains(event.target as Node)) onClose();
    }
    document.addEventListener("pointerdown", onPointerDown, true);
    return () => document.removeEventListener("pointerdown", onPointerDown, true);
  }, [open, onClose]);

  // ---- navigation ---------------------------------------------------------

  const activate = React.useCallback(
    (result: DocsResult) => {
      onClose();
      router.push(result.url);
    },
    [router, onClose],
  );

  // ---- early return (all hooks above this line) ---------------------------

  if (!open) return null;

  // ---- keyboard handler ---------------------------------------------------

  function onKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    switch (event.key) {
      case "ArrowDown":
        event.preventDefault();
        moveActive(1);
        break;
      case "ArrowUp":
        event.preventDefault();
        moveActive(-1);
        break;
      case "Enter": {
        const result = flat.find((item) => item.id === activeId);
        if (!result) break;
        event.preventDefault();
        activate(result);
        break;
      }
      case "Escape":
        event.preventDefault();
        if (search) onSearchChange("");
        else onClose();
        break;
    }
  }

  // ---- aria-live status ---------------------------------------------------

  const trimmed = search.trim();
  const count = flat.length;
  const status = !trimmed
    ? ""
    : isLoading
      ? copy.searching
      : count > 0
        ? interpolate(copy.resultCount, { count, query: trimmed })
        : "";

  const anchored = effectiveAnchorRect !== null;

  // ---- render -------------------------------------------------------------

  return (
    <div className="pointer-events-none fixed inset-0 z-[60]">
      <div
        ref={panelRef}
        role="dialog"
        aria-modal={anchored ? undefined : "true"}
        aria-label={copy.overlayLabel}
        style={
          effectiveAnchorRect
            ? anchoredPanelStyle(effectiveAnchorRect, expanded, window.innerWidth)
            : undefined
        }
        className={cn(
          "pointer-events-auto absolute flex flex-col",
          anchored
            ? "transition-[width] duration-slow ease-entrance motion-reduce:transition-none"
            : cn(
                overlaySurfaceClass,
                "inset-0 overflow-hidden max-sm:border-0 max-sm:bg-background max-sm:shadow-none",
                "sm:inset-x-0 sm:bottom-auto sm:top-[10vh] sm:mx-auto sm:h-auto sm:max-h-[70vh] sm:w-[calc(100%-2rem)] sm:max-w-xl",
              ),
        )}
      >
        {/* The input bar */}
        <SearchBar
          variant={anchored ? "bar" : "sheet"}
          inputRef={inputRef}
          value={search}
          onValueChange={onSearchChange}
          onKeyDown={onKeyDown}
          label={copy.overlayLabel}
          placeholder={copy.placeholder}
          listboxId={listboxId}
          expanded={count > 0}
          activeDescendant={activeId ? optionId(activeId) : undefined}
          clear={{
            label: search ? copy.clear : copy.close,
            onPress: () => {
              if (search) {
                onSearchChange("");
                inputRef.current?.focus();
              } else {
                onClose();
              }
            },
            className: search ? "flex" : "flex sm:hidden",
          }}
          trailing={
            !search && isMac !== null ? (
              <kbd
                aria-hidden
                className="hidden shrink-0 rounded-none border border-border bg-background px-1.5 py-0.5 font-inter text-[0.6875rem] leading-none text-muted-foreground sm:flex"
              >
                {isMac ? "⌘K" : "Ctrl K"}
              </kbd>
            ) : null
          }
        />

        {/* Results body */}
        {(() => {
          const body = (
            <>
              {count > 0 ? (
                <div
                  id={listboxId}
                  role="listbox"
                  aria-label={copy.results}
                  tabIndex={-1}
                  className="min-h-0 flex-1 overflow-y-auto overscroll-contain pb-4 focus:outline-none"
                >
                  {groups.map((group) => (
                    <SearchResultGroup
                      key={group.id}
                      group={group}
                      activeId={activeId}
                      optionId={optionId}
                      onActivate={activate}
                      onHover={setChosenId}
                    />
                  ))}
                </div>
              ) : (
                <p className="flex-1 px-4 py-8 text-center font-inter text-sm text-muted-foreground">
                  {trimmed
                    ? interpolate(copy.nothingMatches, { query: trimmed })
                    : copy.startTyping}
                </p>
              )}
            </>
          );

          if (!effectiveAnchorRect) return body;

          const below = effectiveAnchorRect.top + effectiveAnchorRect.height + 8;
          return (
            <div
              style={{
                maxHeight: expanded
                  ? Math.max(160, Math.min(window.innerHeight - below - 16, 540))
                  : 0,
                opacity: expanded ? 1 : 0,
              }}
              className={cn(
                overlaySurfaceClass,
                "mt-2 flex min-h-0 flex-col overflow-hidden",
                "transition-[max-height,opacity] duration-slow ease-entrance motion-reduce:transition-none",
              )}
            >
              {body}
            </div>
          );
        })()}

        {/* Result count, announced politely. Permanently mounted so the first
            update after opening is not swallowed by the region appearing. */}
        <div aria-live="polite" aria-atomic="true" className="sr-only">
          {status}
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Result group renderer
// ---------------------------------------------------------------------------

function SearchResultGroup({
  group,
  activeId,
  optionId,
  onActivate,
  onHover,
}: {
  group: DocsGroup;
  activeId: string | null;
  optionId: (id: string) => string;
  onActivate: (result: DocsResult) => void;
  onHover: (id: string) => void;
}) {
  const headingId = React.useId();
  return (
    <div role="group" aria-labelledby={headingId}>
      <SearchGroupHeading id={headingId} label={group.label} />
      {group.results.map((result) => (
        <SearchOption
          key={result.id}
          id={optionId(result.id)}
          active={result.id === activeId}
          icon={TYPE_ICON[result.type]}
          title={result.title}
          subtitle={result.subtitle}
          onPick={() => onActivate(result)}
          onHover={() => onHover(result.id)}
        />
      ))}
    </div>
  );
}
