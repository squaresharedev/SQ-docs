import type { SVGProps } from "react";

/**
 * The Square Share mark, from BRAND_MARK in the dashboard (Store/src/lib/brand.ts).
 * The one place to swap when the mark changes. It draws in currentColor, so it
 * follows light and dark mode.
 */
export function LogoMark({ className, ...props }: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 630 624"
      fill="currentColor"
      aria-hidden="true"
      focusable="false"
      className={className}
      {...props}
    >
      <path d="M0 84H270V354H540V624H0Z M360 0H630V270H547V83H360Z" />
    </svg>
  );
}

/**
 * Mark and wordmark, like the dashboard sidebar's brand row (the mark, then
 * the product name in semibold): "Square Share Docs" on one line.
 */
export function Logo() {
  return (
    <span className="inline-flex items-center gap-2.5">
      <LogoMark className="size-5 shrink-0 sm:size-6" />
      <span className="whitespace-nowrap text-base font-semibold tracking-tight sm:text-lg">Square Share Docs</span>
    </span>
  );
}
