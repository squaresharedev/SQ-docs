import { loader, type LoaderPlugin } from "fumadocs-core/source";
import { metaSchema } from "fumadocs-core/source/schema";
import { applyMdxPreset } from "fumadocs-mdx/config";
import { defineDocs } from "fumadocs-mdx/macro";
import { frontmatterSchema } from "./frontmatter.ts";
import { i18n } from "./i18n.ts";
import { pageIconsPlugin } from "./icons.tsx";
import { remarkGlossary } from "./mdx/remark-glossary.ts";

/** MDX components that only wrap content: their children go to Markdown as is. */
const WRAPPER_COMPONENTS = new Set(["AnswerBlock", "SectionCards", "Steps", "Snippet", "Buttons", "SetupMap"]);

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
          return true;
        },
      },
    },
  },
  meta: {
    schema: metaSchema,
  },
});

/** Labels each sidebar item with its page's short `navTitle`, when it has one. */
function navTitlesPlugin(): LoaderPlugin {
  return {
    name: "square-share:nav-titles",
    transformPageTree: {
      file(node, filePath) {
        const file = filePath ? this.storage.read(filePath) : undefined;
        const navTitle = file?.format === "page" ? (file.data as { navTitle?: string }).navTitle : undefined;
        return navTitle ? { ...node, name: navTitle } : node;
      },
    },
  };
}

export const source = loader({
  baseUrl: "/",
  source: docs.toFumadocsSource(),
  i18n,
  plugins: [pageIconsPlugin(), navTitlesPlugin()],
});

export type DocsPage = NonNullable<ReturnType<typeof source.getPage>>;
