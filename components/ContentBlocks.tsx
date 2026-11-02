import type { CSSProperties, ReactNode } from "react";

/**
 * Wrappers that only change how authored Markdown looks. Their content is
 * ordinary Markdown (an ordered list, a code block, a paragraph of links, a
 * list), so the `.md` version keeps it unchanged (see lib/source.ts).
 */

/** An ordered list drawn as numbered steps on a line. */
export function Steps({ children }: { children: ReactNode }) {
  return <div className="docs-steps">{children}</div>;
}

/** A code block the reader copies into their own site: the dashboard's flowing green border. */
export function Snippet({ children }: { children: ReactNode }) {
  return <div className="code-surface">{children}</div>;
}

/** A paragraph of links drawn as buttons: the first solid, the rest outlined. */
export function Buttons({ children }: { children: ReactNode }) {
  return <div className="docs-buttons not-prose">{children}</div>;
}

/** A list of future features drawn as the homepage's dark "What's next" cards. */
export function ComingNext({ label, children }: { label: string; children: ReactNode }) {
  // The cards' small "Later" tag reads this string (a CSS string, hence the quotes).
  const style = { "--coming-label": JSON.stringify(label) } as CSSProperties;
  return (
    <div className="dark coming-next" style={style}>
      {children}
    </div>
  );
}
