"use client";

import { useEffect } from "react";
import { useSidebar } from "fumadocs-ui/layouts/notebook/slots/sidebar";

const DRAWER_ID = "nd-sidebar-mobile";
const FOCUSABLE = 'a[href], button:not([disabled]), input:not([disabled]), [tabindex]:not([tabindex="-1"])';

/**
 * The sidebar below md is a drawer over the page, and Fumadocs leaves focus
 * where it was: Tab walks on into the page hidden behind it, and Escape does
 * nothing. While it is open this keeps it a modal's: focus moves into it, Tab
 * and Shift+Tab stay inside it (WCAG 2.4.3, 2.4.11), Escape closes it, and
 * focus goes back to the button that opened it.
 */
export function useDrawerFocus() {
  const { open, setOpen, mode } = useSidebar();

  useEffect(() => {
    if (!open || mode !== "drawer") return;
    const opener = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const drawer = () => document.getElementById(DRAWER_ID);
    const focusables = () =>
      [...(drawer()?.querySelectorAll<HTMLElement>(FOCUSABLE) ?? [])].filter((element) => element.getClientRects().length > 0);

    const frame = requestAnimationFrame(() => focusables()[0]?.focus());

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        event.preventDefault();
        setOpen(false);
        return;
      }
      if (event.key !== "Tab") return;
      const items = focusables();
      const first = items[0];
      const last = items.at(-1);
      if (!first || !last) return;
      const current = document.activeElement;
      if (!drawer()?.contains(current)) {
        event.preventDefault();
        first.focus();
      } else if (event.shiftKey && current === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && current === last) {
        event.preventDefault();
        first.focus();
      }
    }

    document.addEventListener("keydown", onKeyDown);
    return () => {
      cancelAnimationFrame(frame);
      document.removeEventListener("keydown", onKeyDown);
      // Back to the opener, unless the reader has already moved on outside the drawer.
      const current = document.activeElement;
      if (!current || current === document.body || drawer()?.contains(current)) opener?.focus();
    };
  }, [open, mode, setOpen]);
}
