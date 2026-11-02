import type { ReactNode } from "react";
import { cn } from "@/lib/cn";
import { DocsLink } from "./DocsLink";

/**
 * The homepage's call-to-action shape: a flat, sharp rectangle with a heavy
 * label and an arrow that moves the way it points on hover. "solid" is the
 * text colour (black on white, white on black), "outline" its quiet partner.
 */
export function ButtonLink({
  href,
  variant = "solid",
  children,
  className,
}: {
  href: string;
  variant?: "solid" | "outline";
  children: ReactNode;
  className?: string;
}) {
  const external = /^https?:/.test(href);
  const classes = cn("docs-button", variant === "outline" && "docs-button-outline", className);
  return external ? (
    <a href={href} className={classes} data-external="">
      {children}
    </a>
  ) : (
    <DocsLink href={href} className={classes}>
      {children}
    </DocsLink>
  );
}
