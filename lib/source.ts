import { loader } from "fumadocs-core/source";
import { metaSchema } from "fumadocs-core/source/schema";
import { applyMdxPreset } from "fumadocs-mdx/config";
import { defineDocs } from "fumadocs-mdx/macro";
import { frontmatterSchema } from "./frontmatter.ts";
import { i18n } from "./i18n.ts";
import { pageIconsPlugin } from "./icons.tsx";
import { remarkGlossary } from "./mdx/remark-glossary.ts";

/** MDX components that only wrap content: their children go to Markdown as is. */
const WRAPPER_COMPONENTS = new Set(["AnswerBlock", "SectionCards", "Steps", "Snippet", "Buttons"]);

/**
 * MDX components that only show something the Markdown already has (the
 * editor view of another page's Markdown): left out of the Markdown version.
 */
const PICTURE_COMPONENTS = new Set(["MarkdownPreview"]);

const docs = defineDocs({
  dir: "content/docs",
  docs: {
    schema: frontmatterSchema,
    mdxOptions: applyMdxPreset({
      remarkPlugins: (plugins) => [remarkGlossary, ...plugins],
    }),
    postprocess: {
      includeProcessedMarkdown: {
        // Plain `## Heading` lines, without Fumadocs' `[#id]` suffix.
        headingIds: false,
        filterElement(node) {
          // MDX comments ({/* TODO(adrian): ... */}) are notes for writers.
          if (node.type === "mdxFlowExpression" || node.type === "mdxTextExpression") return false;
          if (node.type === "mdxJsxFlowElement" && WRAPPER_COMPONENTS.has(node.name ?? "")) {
            return "children-only";
          }
          if (node.type === "mdxJsxFlowElement" && PICTURE_COMPONENTS.has(node.name ?? "")) return false;
          return true;
        },
      },
    },
  },
  meta: {
    schema: metaSchema,
  },
});

export const source = loader({
  baseUrl: "/",
  source: docs.toFumadocsSource(),
  i18n,
  plugins: [pageIconsPlugin()],
});

export type DocsPage = NonNullable<ReturnType<typeof source.getPage>>;
