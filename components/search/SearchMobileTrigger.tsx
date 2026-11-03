"use client";

/**
 * Copy of Store/src/components/search/SearchMobileTrigger.tsx
 * Changes:
 *   - Imports: cn from @/lib/cn; control style strings inlined; no next-intl
 *     (useLocaleContext + searchCopy).
 *   - Removed: data-tour attribute (docs has no onboarding tour).
 *   - Everything else (size-10, rounded-sm, icon size, ARIA) is copied
 *     verbatim.
 */

import { Search } from "lucide-react";
import { cn } from "@/lib/cn";
import { useLocaleContext } from "@/components/locale-context";
import { useSearch } from "@/components/search/SearchProvider";
import { searchCopy } from "@/components/search/copy";

const focusRingClass =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background";
const transitionClass =
  "transition-colors duration-base ease-standard motion-reduce:transition-none";

/**
 * The minimized state of docs search, mobile: an icon button for the header's
 * small search slot. Sized size-10 for a 40px touch target.
 */
export function SearchMobileTrigger({ className }: { className?: string }) {
  const { locale } = useLocaleContext();
  const copy = searchCopy[locale];
  const search = useSearch();
  if (!search) return null;

  return (
    <button
      type="button"
      onClick={search.open}
      aria-label={copy.triggerLabel}
      aria-haspopup="dialog"
      aria-expanded={search.isOpen}
      className={cn(
        "flex size-10 items-center justify-center rounded-sm text-foreground",
        "hover:bg-accent",
        transitionClass,
        focusRingClass,
        className,
      )}
    >
      <Search className="size-5" strokeWidth={2} aria-hidden />
    </button>
  );
}
