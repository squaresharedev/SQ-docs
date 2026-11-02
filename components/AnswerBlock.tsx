import type { ReactNode } from "react";

/**
 * The direct answer under a page's title: 40 to 60 words, no heading. Plain
 * server-rendered HTML, so crawlers that never run JavaScript still get it.
 */
export function AnswerBlock({ children }: { children: ReactNode }) {
  return (
    <div data-answer-block="" className="answer-block">
      {children}
    </div>
  );
}
