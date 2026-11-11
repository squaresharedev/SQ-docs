"use client";

/*
 * Copied from Fumadocs UI: layouts/shared/slots/theme-switch.tsx, its
 * light-dark mode (the one the docs use). Changes: the original is one button
 * called "Toggle Theme" whose state only the icons show; this one is named
 * for the theme it turns on, "Dark theme", and aria-pressed says whether that
 * is on, so a screen reader hears the state too (WCAG 4.1.2). It is a
 * type="button" and takes its words from the docs' copy. Same classes, same
 * view transition. useThemeToggle is that logic on its own, for HeaderActions.
 */
import { useSyncExternalStore } from "react";
import { flushSync } from "react-dom";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { cn } from "@/lib/cn";
import { useLocaleContext } from "./locale-context";

const NEVER_CHANGES = () => () => {};

export type ThemeName = "light" | "dark";

/**
 * The resolved theme (null until the browser knows it: no state is claimed
 * before then) and a toggle that runs the view transition. `shown` overrides
 * the state drawn, for previews that force a theme on a box.
 */
export function useThemeToggle(shown?: ThemeName) {
  const { setTheme, resolvedTheme } = useTheme();
  const mounted = useSyncExternalStore(NEVER_CHANGES, () => true, () => false);
  const theme: ThemeName | null = shown ?? (mounted && (resolvedTheme === "light" || resolvedTheme === "dark") ? resolvedTheme : null);

  function toggle() {
    const next = theme === "light" ? "dark" : "light";
    if (document.startViewTransition) document.startViewTransition(() => flushSync(() => setTheme(next)));
    else setTheme(next);
  }

  return { theme, toggle };
}

const ITEM_CLASS = "size-6.5 p-1.5";
const ACTIVE_CLASS = "bg-fd-accent text-fd-accent-foreground";
const INACTIVE_CLASS = "text-fd-muted-foreground";

export function ThemeSwitch({ className, shown }: { className?: string; shown?: ThemeName }) {
  const { copy } = useLocaleContext();
  const { theme, toggle } = useThemeToggle(shown);

  return (
    <button
      type="button"
      aria-label={copy.darkTheme}
      aria-pressed={theme ? theme === "dark" : undefined}
      onClick={toggle}
      data-theme-toggle=""
      className={cn("inline-flex items-center overflow-hidden rounded-full border p-1 *:rounded-full", className)}
    >
      <Sun fill="currentColor" className={cn(ITEM_CLASS, theme === "light" ? ACTIVE_CLASS : INACTIVE_CLASS)} />
      <Moon fill="currentColor" className={cn(ITEM_CLASS, theme === "dark" ? ACTIVE_CLASS : INACTIVE_CLASS)} />
    </button>
  );
}
