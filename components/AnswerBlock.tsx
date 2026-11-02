import type { ReactNode } from "react";

/**
 * The direct answer under a page's title: 40 to 60 words, no heading. Plain
 * server-rendered HTML, so crawlers that never run JavaScript still get it.
 * The small label is chrome outside the answer itself; the Markdown version
 * keeps only the answer.
 */
export function AnswerBlock({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="answer-block">
      <p className="answer-block-label" aria-hidden="true">
        {label}
      </p>
      <div data-answer-block="">{children}</div>
    </div>
  );
}
