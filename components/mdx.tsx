import { Children, cloneElement, isValidElement, type ComponentProps, type ReactElement, type ReactNode } from "react";
import defaultMdxComponents from "fumadocs-ui/mdx";
import { CodeBlock, Pre } from "fumadocs-ui/components/codeblock";
import type { MDXComponents } from "mdx/types";
import { COPY } from "@/lib/copy";
import type { Locale } from "@/lib/i18n";
import { AnswerBlock } from "./AnswerBlock";
import { Buttons, Snippet, Steps } from "./ContentBlocks";
import { SetupMap } from "./SetupMap";
import { SectionCards } from "./SectionCards";

type Element = ReactElement<{ children?: ReactNode }>;

function elementsOf(node: ReactNode): Element[] {
  return Children.toArray(node).filter((child): child is Element => isValidElement(child));
}

function isBlank(node: ReactNode): boolean {
  return Children.toArray(node).every((child) => typeof child === "string" && child.trim() === "");
}

/**
 * A comparison table written with an empty top-left cell (`| | Passkey | App |`)
 * has row labels down its first column. Markdown cannot say so, so here the
 * empty corner becomes a plain cell (a header with no text names nothing) and
 * each row's first cell a row header, which a screen reader reads with every
 * cell of its row. Other tables are left as they are.
 */
function withRowHeaders(children: ReactNode): ReactNode {
  const sections = elementsOf(children);
  const head = sections.find((section) => section.type === "thead");
  const corner = head && elementsOf(elementsOf(head.props.children)[0]?.props.children)[0];
  if (!corner || !isBlank(corner.props.children)) return children;
  return sections.map((section) =>
    cloneElement(
      section,
      undefined,
      elementsOf(section.props.children).map((row) =>
        cloneElement(
          row,
          undefined,
          elementsOf(row.props.children).map((cell, index) => {
            if (index > 0) return cell;
            return section === head ? <td key={cell.key} {...cell.props} /> : <th key={cell.key} scope="row" {...cell.props} />;
          }),
        ),
      ),
    ),
  );
}

/** The MDX components, with the ones that print words bound to the page's locale. */
export function getMDXComponents(locale: Locale, components?: MDXComponents) {
  const copy = COPY[locale];
  const Table = defaultMdxComponents.table;
  // Code blocks are named "Code example 1", "Code example 2: title" in page order, so
  // each scrollable, focusable block is a region a screen reader can tell apart.
  let codeBlocks = 0;
  return {
    ...defaultMdxComponents,
    pre: (props: ComponentProps<typeof CodeBlock>) => {
      codeBlocks += 1;
      const name = `${copy.codeExample} ${codeBlocks}${typeof props.title === "string" && props.title ? `: ${props.title}` : ""}`;
      return (
        <CodeBlock {...props} viewportProps={{ "aria-label": name }}>
          <Pre>{props.children}</Pre>
        </CodeBlock>
      );
    },
    table: (props: ComponentProps<"table">) => <Table {...props}>{withRowHeaders(props.children)}</Table>,
    AnswerBlock: ({ children }: { children: ReactNode }) => <AnswerBlock label={copy.shortAnswer}>{children}</AnswerBlock>,
    SectionCards,
    Steps,
    Snippet,
    Buttons,
    SetupMap,
    ...components,
  } satisfies MDXComponents;
}
