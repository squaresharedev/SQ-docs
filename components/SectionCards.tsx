import type { ReactNode } from "react";

/**
 * Wraps a plain Markdown list of links and lays it out as cards. The content
 * stays a Markdown list, so the `.md` version and llms-full.txt get the same
 * links and descriptions.
 */
export function SectionCards({ children }: { children: ReactNode }) {
  return <div className="section-cards">{children}</div>;
}
