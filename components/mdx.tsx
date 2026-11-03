import type { ReactNode } from "react";
import defaultMdxComponents from "fumadocs-ui/mdx";
import type { MDXComponents } from "mdx/types";
import { COPY } from "@/lib/copy";
import type { Locale } from "@/lib/i18n";
import { AnswerBlock } from "./AnswerBlock";
import { Buttons, Snippet, Steps } from "./ContentBlocks";
import { MarkdownPreview } from "./ide/MarkdownPreview";
import { SectionCards } from "./SectionCards";

/** The MDX components, with the ones that print words bound to the page's locale. */
export function getMDXComponents(locale: Locale, components?: MDXComponents) {
  const copy = COPY[locale];
  return {
    ...defaultMdxComponents,
    AnswerBlock: ({ children }: { children: ReactNode }) => <AnswerBlock label={copy.shortAnswer}>{children}</AnswerBlock>,
    SectionCards,
    Steps,
    Snippet,
    Buttons,
    MarkdownPreview: ({ page }: { page: string }) => <MarkdownPreview locale={locale} translationKey={page} />,
    ...components,
  } satisfies MDXComponents;
}
