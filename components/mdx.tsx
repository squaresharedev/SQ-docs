import defaultMdxComponents from "fumadocs-ui/mdx";
import type { MDXComponents } from "mdx/types";
import { AnswerBlock } from "./AnswerBlock";
import { SectionCards } from "./SectionCards";

export function getMDXComponents(components?: MDXComponents) {
  return {
    ...defaultMdxComponents,
    AnswerBlock,
    SectionCards,
    ...components,
  } satisfies MDXComponents;
}

export const useMDXComponents = getMDXComponents;

declare global {
  type MDXProvidedComponents = ReturnType<typeof getMDXComponents>;
}
