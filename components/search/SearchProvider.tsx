"use client";

/**
 * Copy of Store/src/components/search/SearchProvider.tsx
 * Changes:
 *   - Lazy loading: SearchOverlay is loaded via next/dynamic (ssr:false) and
 *     mounted only after the palette is first opened, so its chunk and the
 *     search index are not in the initial page bundle.
 *   - Removed: snapshot warm-up, entity snapshot state, team role, the
 *     usePendingRouter / useNavigationBlocker-based navigate prop, navigate
 *     override mechanism. The overlay navigates via next/navigation's router.
 *   - Nested-provider no-op pattern: retained. Two mount points (docs shell
 *     and any future page-level usage) can safely both include SearchProvider
 *     and only the outermost one will actually register the keyboard shortcut.
 *   - Ctrl/Cmd+K global listener: retained verbatim (capture phase,
 *     preventDefault to beat the browser's address-bar shortcut).
 */

import * as React from "react";
import dynamic from "next/dynamic";

// Lazy: the overlay chunk downloads only when the palette first opens.
// ssr:false because the overlay mounts only after a client-side interaction.
const SearchOverlayLazy = dynamic(
  () =>
    import("@/components/search/SearchOverlay").then((m) => ({
      default: m.SearchOverlay,
    })),
  { ssr: false },
);

type SearchContextValue = {
  isOpen: boolean;
  open: () => void;
  close: () => void;
  /** A trigger announces the element the panel should attach under. Returns
   *  the unregister cleanup. Several triggers may register; whichever is
   *  visible when the palette opens becomes the anchor. */
  registerAnchor: (el: HTMLElement | null) => () => void;
};

const SearchContext = React.createContext<SearchContextValue | null>(null);

/**
 * Read the search controls. Returns null outside a provider, so a trigger on a
 * page without search renders inert rather than crashing the page around it.
 */
export function useSearch(): SearchContextValue | null {
  return React.useContext(SearchContext);
}

export function SearchProvider({ children }: { children: React.ReactNode }) {
  const existing = React.useContext(SearchContext);
  const [isOpen, setIsOpen] = React.useState(false);
  // Tracks whether the overlay has ever been opened so we can lazily mount
  // the overlay component (and therefore lazily download its chunk and the
  // search index).
  const [everOpened, setEverOpened] = React.useState(false);

  // Anchor registry. A Set because multiple triggers exist (desktop bar,
  // mobile header) and mount order is not knowable; visibility at open time
  // decides which one anchors the panel.
  const anchorsRef = React.useRef<Set<HTMLElement>>(new Set());
  const [anchorRect, setAnchorRect] = React.useState<DOMRect | null>(null);

  const registerAnchor = React.useCallback((el: HTMLElement | null) => {
    if (!el) return () => {};
    const anchors = anchorsRef.current;
    anchors.add(el);
    return () => {
      anchors.delete(el);
    };
  }, []);

  // Capture the anchor rect in the opening event handler where the DOM is
  // settled. Anchoring is a desktop-only concept: below sm the palette is a
  // full-screen sheet, so no rect is taken.
  const captureAnchorRect = React.useCallback(() => {
    if (!window.matchMedia("(min-width: 640px)").matches) {
      setAnchorRect(null);
      return;
    }
    const visible = [...anchorsRef.current].find(
      (el) => el.offsetParent !== null && el.getBoundingClientRect().width > 0,
    );
    setAnchorRect(visible?.getBoundingClientRect() ?? null);
  }, []);

  const open = React.useCallback(() => {
    captureAnchorRect();
    setIsOpen(true);
    setEverOpened(true);
  }, [captureAnchorRect]);

  const close = React.useCallback(() => setIsOpen(false), []);

  // Global Ctrl/Cmd+K. Nested providers no-op: only the outermost one
  // registers the listener so there is never more than one.
  const nested = existing !== null;
  React.useEffect(() => {
    if (nested) return;
    function onKeyDown(event: KeyboardEvent) {
      if (!(event.metaKey || event.ctrlKey) || event.altKey) return;
      if (event.key.toLowerCase() !== "k") return;
      event.preventDefault();
      captureAnchorRect();
      setIsOpen((current) => !current);
      setEverOpened(true);
    }
    document.addEventListener("keydown", onKeyDown, { capture: true });
    return () =>
      document.removeEventListener("keydown", onKeyDown, { capture: true });
  }, [nested, captureAnchorRect]);

  const value = React.useMemo(
    () => ({ isOpen, open, close, registerAnchor }),
    [isOpen, open, close, registerAnchor],
  );

  // Nested provider: pass children through and share the outer palette.
  if (existing !== null) return <>{children}</>;

  return (
    <SearchContext.Provider value={value}>
      {children}
      {/* Only mount the overlay once it has been opened for the first time
          so its dynamic import fires lazily rather than at page load. */}
      {everOpened && (
        <SearchOverlayLazy
          open={isOpen}
          onClose={close}
          anchorRect={anchorRect}
          anchorsRef={anchorsRef}
        />
      )}
    </SearchContext.Provider>
  );
}
