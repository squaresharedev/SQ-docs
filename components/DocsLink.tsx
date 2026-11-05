"use client";

import NextLink from "next/link";
import { useState, type ComponentProps } from "react";

/**
 * Every Fumadocs link (sidebar, breadcrumbs, prev/next, MDX links) renders
 * through this. Prefetching everything in the viewport fetched a dozen route
 * payloads while the page was still loading, so links prefetch on hover or
 * focus instead (the pattern from Next's linking guide).
 *
 * Fumadocs marks the sidebar's link to the open page with data-active alone,
 * which only shows; aria-current says it to screen readers too.
 */
export function DocsLink({
  href = "#",
  prefetch,
  onMouseEnter,
  onFocus,
  ...props
}: ComponentProps<"a"> & { prefetch?: boolean; "data-active"?: boolean }) {
  const [active, setActive] = useState(false);
  return (
    <NextLink
      href={href}
      prefetch={prefetch === false ? false : active ? null : false}
      aria-current={props["data-active"] === true ? "page" : undefined}
      onMouseEnter={(event) => {
        setActive(true);
        onMouseEnter?.(event);
      }}
      onFocus={(event) => {
        setActive(true);
        onFocus?.(event);
      }}
      {...props}
    />
  );
}
