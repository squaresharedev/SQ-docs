"use client";

/**
 * Copy of Store/src/components/search/SearchTrigger.tsx
 * Changes:
 *   - Imports: cn from @/lib/cn; focusRingClass and transitionClass from
 *     @squaresharedev/tokens (the package's copy of control-styles); no
 *     next-intl (useLocaleContext + searchCopy).
 *   - Removed: the -ml-[13.5px] margin that compensated for the dashboard's
 *     header padding. The docs header handles its own spacing.
 *   - Keyboard hint on bg-background, not bg-muted: muted text on the muted
 *     grey is 4.34:1 at 11px, under the 4.5:1 the axe check requires.
 *   - Everything else (shape, h-9, max-w-xs, ARIA) is copied verbatim.
 */

import * as React from "react";
import { Search } from "lucide-react";
import { cn } from "@/lib/cn";
import { useLocaleContext } from "@/components/locale-context";
import { focusRingClass, transitionClass } from "@squaresharedev/tokens";
import { ShortcutHint } from "@/components/search/SearchBar";
import { useSearch } from "@/components/search/SearchProvider";
import { searchCopy } from "@/components/search/copy";

/**
 * The minimized state of docs search, desktop: a quiet field-shaped button
 * filling the header's search slot. It looks like an input and is a button,
 * because clicking it opens the palette whose input is the real one.
 */
export function SearchTrigger({ className }: { className?: string }) {
  const { locale } = useLocaleContext();
  const copy = searchCopy[locale];
  const search = useSearch();

  const buttonRef = React.useRef<HTMLButtonElement>(null);
  const registerAnchor = search?.registerAnchor;
  React.useEffect(
    () => registerAnchor?.(buttonRef.current),
    [registerAnchor],
  );

  if (!search) return null;

  return (
    <button
      ref={buttonRef}
      type="button"
      onClick={search.open}
      aria-haspopup="dialog"
      aria-expanded={search.isOpen}
      aria-keyshortcuts="Meta+K Control+K"
      className={cn(
        "group/search flex h-9 w-full max-w-xs items-center gap-2 rounded-none border border-input",
        "bg-background px-3 text-left text-sm text-muted-foreground",
        "hover:border-border hover:bg-accent hover:text-foreground",
        transitionClass,
        focusRingClass,
        className,
      )}
    >
      <Search className="size-4 shrink-0" aria-hidden />
      <span className="min-w-0 flex-1 truncate">{copy.triggerLabel}</span>
      <ShortcutHint />
    </button>
  );
}
