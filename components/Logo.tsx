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
 * Mark, wordmark and a small mono tag, like the homepage header's brand row.
 * The wordmark hides on the narrowest screens; the mark and tag stay.
 */
export function Logo({ label }: { label: string }) {
  return (
    <span className="inline-flex items-center gap-2.5">
      <LogoMark className="size-6 shrink-0" />
      <span className="text-lg font-semibold tracking-tight max-sm:sr-only">Square Share</span>
      <span className="border border-current/30 px-1.5 py-0.5 font-mono text-[10px] uppercase tracking-widest opacity-70">
        {label}
      </span>
    </span>
  );
}
