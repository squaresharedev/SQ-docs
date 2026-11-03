"use client";

/**
 * Copy of Store/src/components/search/SearchBar.tsx
 * Changes:
 *   - Imports: cn from @/lib/cn, no @/lib/search/types (MAX_QUERY_LENGTH inlined).
 *   - Control style strings inlined (no @/components/ui/control-styles import).
 *   - No next-intl (strings passed as plain props).
 *   - The selected row's text uses accent-foreground: in the dark palette the
 *     accent is the brand purple, and white on it is 3.95:1 (black is about 5:1).
 */

import * as React from "react";
import { Search as SearchIcon, X } from "lucide-react";
import { cn } from "@/lib/cn";

/** 200 characters is the server-side limit; mirrors Store's MAX_QUERY_LENGTH. */
const MAX_QUERY_LENGTH = 200;

const focusRingInsetClass =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset";
const transitionClass =
  "transition-colors duration-base ease-standard motion-reduce:transition-none";
const overlayCloseButtonClass = cn(
  "flex size-9 shrink-0 items-center justify-center rounded-none",
  "text-muted-foreground hover:bg-accent hover:text-foreground",
  transitionClass,
  focusRingInsetClass,
);

/**
 * WHICH ROW IS HIGHLIGHTED, derived rather than stored.
 *
 * State holds only what the user chose with the arrows or the pointer; the row
 * actually highlighted is that choice while it is still in the list, else the
 * first row. Storing the highlight directly and reconciling it in an effect
 * leaves a frame, on every keystroke, where aria-activedescendant names a row
 * that is no longer rendered. Deriving it makes that unrepresentable.
 */
export function useActiveOption(
  ids: readonly string[],
  optionId: (id: string) => string,
) {
  const [chosenId, setChosenId] = React.useState<string | null>(null);
  const activeId =
    chosenId !== null && ids.includes(chosenId) ? chosenId : (ids[0] ?? null);

  const move = React.useCallback(
    (delta: 1 | -1) => {
      if (ids.length === 0) return;
      const index = activeId !== null ? ids.indexOf(activeId) : -1;
      const next = ids[(index + delta + ids.length) % ids.length];
      if (!next) return;
      setChosenId(next);
      document
        .getElementById(optionId(next))
        ?.scrollIntoView?.({ block: "nearest" });
    },
    [activeId, ids, optionId],
  );

  return { activeId, choose: setChosenId, move };
}

export type SearchBarClear = {
  label: string;
  onPress: () => void;
  className?: string;
};

/**
 * The input row: magnifier, field, and ONE clear control drawn as an icon.
 *
 * `bar` is the h-9 bordered field (the palette's desktop trigger and the
 * docs panel field); `sheet` is the roomier full-width row of the mobile palette.
 *
 * type="text", never type="search": the native search input paints its own
 * cancel glyph, which cannot be styled consistently and would sit beside the X
 * this bar already draws.
 */
export function SearchBar({
  variant,
  inputRef,
  value,
  onValueChange,
  onKeyDown,
  label,
  placeholder,
  listboxId,
  expanded,
  activeDescendant,
  clear,
  trailing,
  className,
}: {
  variant: "bar" | "sheet";
  inputRef?: React.Ref<HTMLInputElement>;
  value: string;
  onValueChange: (value: string) => void;
  onKeyDown?: (event: React.KeyboardEvent<HTMLInputElement>) => void;
  label: string;
  placeholder: string;
  listboxId: string;
  expanded: boolean;
  activeDescendant?: string;
  clear?: SearchBarClear | null;
  trailing?: React.ReactNode;
  className?: string;
}) {
  const bar = variant === "bar";
  return (
    <div
      className={cn(
        bar
          ? "flex h-9 shrink-0 items-center gap-2 rounded-none border border-input bg-background px-3"
          : "flex shrink-0 items-center gap-2 border-b border-border px-4 py-3",
        className,
      )}
    >
      <SearchIcon className="size-4 shrink-0 text-muted-foreground" aria-hidden />
      <input
        ref={inputRef}
        type="text"
        role="combobox"
        aria-label={label}
        aria-autocomplete="list"
        aria-expanded={expanded}
        aria-controls={expanded ? listboxId : undefined}
        aria-activedescendant={activeDescendant}
        autoComplete="off"
        autoCorrect="off"
        autoCapitalize="off"
        spellCheck={false}
        placeholder={placeholder}
        maxLength={MAX_QUERY_LENGTH}
        value={value}
        onChange={(event) =>
          onValueChange(event.target.value.slice(0, MAX_QUERY_LENGTH))
        }
        onKeyDown={onKeyDown}
        className={cn(
          "min-w-0 flex-1 bg-transparent text-foreground outline-none placeholder:text-muted-foreground",
          bar ? "text-base sm:text-sm" : "text-base",
        )}
      />
      {clear && (
        <button
          type="button"
          aria-label={clear.label}
          onMouseDown={(event) => event.preventDefault()}
          onClick={clear.onPress}
          className={cn(
            overlayCloseButtonClass,
            bar && "-mr-2 size-7",
            clear.className,
          )}
        >
          <X className={bar ? "size-4" : "size-5"} strokeWidth={2} aria-hidden />
        </button>
      )}
      {trailing}
    </div>
  );
}

export function SearchGroupHeading({ id, label }: { id: string; label: string }) {
  return (
    <p
      id={id}
      className="pb-1 pt-3 px-4 font-inter text-xs font-medium uppercase tracking-wide text-muted-foreground"
    >
      {label}
    </p>
  );
}

/**
 * One result row. A div with role="option", never a button: inside a listbox
 * the only legal child is an option, and an option must not also be a control.
 * Focus stays in the input throughout; this row is reached through
 * aria-activedescendant.
 */
export function SearchOption({
  id,
  active,
  icon: Icon,
  title,
  subtitle,
  onPick,
  onHover,
}: {
  id: string;
  active: boolean;
  icon: React.ComponentType<{ className?: string; "aria-hidden"?: boolean }>;
  title: string;
  subtitle?: string | null;
  onPick: () => void;
  onHover: () => void;
}) {
  return (
    <div
      id={id}
      role="option"
      aria-selected={active}
      onPointerDown={(event) => {
        if (event.pointerType === "mouse") event.preventDefault();
      }}
      onClick={onPick}
      onMouseMove={onHover}
      className={cn(
        "flex min-h-11 cursor-pointer items-center gap-3 px-4 py-2",
        transitionClass,
        active ? "bg-accent" : "hover:bg-accent/50",
      )}
    >
      <Icon
        aria-hidden
        className={cn(
          "size-4 shrink-0",
          active ? "text-accent-foreground" : "text-muted-foreground",
        )}
      />
      <span className="min-w-0 flex-1">
        <span className={cn("block truncate text-sm", active ? "text-accent-foreground" : "text-foreground")}>{title}</span>
        {subtitle && (
          <span className={cn("block truncate font-inter text-xs", active ? "text-accent-foreground" : "text-muted-foreground")}>
            {subtitle}
          </span>
        )}
      </span>
    </div>
  );
}
