import type { ReactNode } from "react";
import defaultMdxComponents from "fumadocs-ui/mdx";
import type { MDXComponents } from "mdx/types";
import { COPY, VISUAL_COPY } from "@/lib/copy";
import type { Locale } from "@/lib/i18n";
import { AnswerBlock } from "./AnswerBlock";
import { Buttons, ComingNext, Snippet, Steps } from "./ContentBlocks";
import { SectionCards } from "./SectionCards";
import { VisualCards } from "./VisualCards";
import { Illustration, isVisualKind } from "./visuals/Illustration";

/** The MDX components, with the visual ones bound to the page's locale. */
export function getMDXComponents(locale: Locale, components?: MDXComponents) {
  const copy = COPY[locale];
  const visualCopy = VISUAL_COPY[locale];
  return {
    ...defaultMdxComponents,
    AnswerBlock: ({ children }: { children: ReactNode }) => <AnswerBlock label={copy.shortAnswer}>{children}</AnswerBlock>,
    SectionCards,
    Steps,
    Snippet,
    Buttons,
    ComingNext: ({ children }: { children: ReactNode }) => <ComingNext label={copy.later}>{children}</ComingNext>,
    Illustration: ({ kind }: { kind: string }) =>
      isVisualKind(kind) ? <Illustration kind={kind} copy={visualCopy} className="my-8" /> : null,
    GuideCards: ({ visuals, children }: { visuals: string; children: ReactNode }) => (
      <VisualCards visuals={visuals} variant="guides" copy={visualCopy}>
        {children}
      </VisualCards>
    ),
    FeatureCards: ({ visuals, children }: { visuals: string; children: ReactNode }) => (
      <VisualCards visuals={visuals} variant="features" copy={visualCopy}>
        {children}
      </VisualCards>
    ),
    ...components,
  } satisfies MDXComponents;
}
