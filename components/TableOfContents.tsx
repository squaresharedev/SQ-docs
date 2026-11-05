"use client";

import { TOC, TOCPopover, type TOCPopoverProps, type TOCProps } from "fumadocs-ui/layouts/notebook/page/slots/toc";
import { useLocaleContext } from "./locale-context";

/**
 * Fumadocs' "On this page" lists with the semantics a screen reader needs,
 * through the props Fumadocs passes to their containers: both are navigation
 * landmarks, the narrow-screen bar's own <header> is a plain box rather than a
 * second banner, and the bar's button is named by its text, without the
 * reading-progress ring that otherwise reads out as "0.14285714285714285".
 */
export function DocsTOC(props: TOCProps) {
  return <TOC {...props} container={{ ...props.container, role: "navigation", "aria-labelledby": "toc-title" }} />;
}

export function DocsTOCPopover(props: TOCPopoverProps) {
  const { copy } = useLocaleContext();
  return (
    <TOCPopover
      {...props}
      container={{ ...props.container, role: "navigation", "aria-label": copy.onThisPage }}
      trigger={{ ...props.trigger, ref: quietenBar }}
    />
  );
}

/**
 * Fumadocs renders the ring and the <header> without a way to pass them
 * attributes, so they get them once the button is in the page. The ring is a
 * drawing of how far down the page you are; its value is noise in the
 * button's name. The header is the bar's box, not the page's banner.
 */
function quietenBar(button: HTMLButtonElement | null) {
  button?.querySelector('svg[role="progressbar"]')?.setAttribute("aria-hidden", "true");
  button?.closest("header")?.setAttribute("role", "none");
}
