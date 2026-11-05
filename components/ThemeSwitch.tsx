"use client";

/*
 * Copied from Fumadocs UI: layouts/shared/slots/theme-switch.tsx, its
 * light-dark mode (the one the docs use). Changes: the original is one button
 * called "Toggle Theme" whose state only the icons show; this one is named
 * for the theme it turns on, "Dark theme", and aria-pressed says whether that
 * is on, so a screen reader hears the state too (WCAG 4.1.2). It is a
 * type="button" and takes its words from the docs' copy. Same classes, same
 * view transition.
 */
import { useSyncExternalStore } from "react";
import { flushSync } from "react-dom";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { cn } from "@/lib/cn";
import { useLocaleContext } from "./locale-context";

const NEVER_CHANGES = () => () => {};

const ITEM_CLASS = "size-6.5 p-1.5";
const ACTIVE_CLASS = "bg-fd-accent text-fd-accent-foreground";
const INACTIVE_CLASS = "text-fd-muted-foreground";

export function ThemeSwitch({ className }: { className?: string }) {
  const { setTheme, resolvedTheme } = useTheme();
  const { copy } = useLocaleContext();
  // The theme is only known in the browser: no state is claimed before then.
  const mounted = useSyncExternalStore(NEVER_CHANGES, () => true, () => false);
  const theme = mounted ? resolvedTheme : null;

  function switchTo(next: "light" | "dark") {
    if (document.startViewTransition) document.startViewTransition(() => flushSync(() => setTheme(next)));
    else setTheme(next);
  }

  return (
    <button
      type="button"
      aria-label={copy.darkTheme}
      aria-pressed={theme ? theme === "dark" : undefined}
      onClick={() => switchTo(theme === "light" ? "dark" : "light")}
      data-theme-toggle=""
      className={cn("inline-flex items-center overflow-hidden rounded-full border p-1 *:rounded-full", className)}
    >
      <Sun fill="currentColor" className={cn(ITEM_CLASS, theme === "light" ? ACTIVE_CLASS : INACTIVE_CLASS)} />
      <Moon fill="currentColor" className={cn(ITEM_CLASS, theme === "dark" ? ACTIVE_CLASS : INACTIVE_CLASS)} />
    </button>
  );
}
