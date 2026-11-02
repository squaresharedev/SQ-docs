"use client";

import NextLink from "next/link";
import { useState, type ComponentProps } from "react";

/**
 * Every Fumadocs link (sidebar, breadcrumbs, prev/next, MDX links) renders
 * through this. Prefetching everything in the viewport fetched a dozen route
 * payloads while the page was still loading, so links prefetch on hover or
 * focus instead (the pattern from Next's linking guide).
 */
export function DocsLink({
  href = "#",
  prefetch,
  onMouseEnter,
  onFocus,
  ...props
}: ComponentProps<"a"> & { prefetch?: boolean }) {
  const [active, setActive] = useState(false);
  return (
    <NextLink
      href={href}
      prefetch={prefetch === false ? false : active ? null : false}
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
