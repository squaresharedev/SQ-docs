import type { List, ListItem, Root, RootContent } from "mdast";
import type { VFile } from "vfile";
import { replaceSource } from "fumadocs-core/mdx-plugins/stringifier";
import { GLOSSARY, glossaryEntry, type GlossaryEntry } from "../../content/glossary.ts";
import { isLocale, type Locale } from "../i18n.ts";

/**
 * Expands `<GlossaryList />` (every term) and `<GlossaryList terms="a b" />`
 * (chosen keys) into a real Markdown list at compile time, so the HTML page,
 * the `.md` version, llms-full.txt and search all carry the same definitions
 * straight from content/glossary.ts.
 */
export function remarkGlossary() {
  return (tree: Root, file: VFile) => {
    const locale = localeOf(file.path);
    replaceIn(tree, file, locale);
  };
}

const COMPONENT = "GlossaryList";

interface JsxFlowElement {
  type: "mdxJsxFlowElement";
  name: string | null;
  attributes: { type: string; name?: string; value?: unknown }[];
}

function replaceIn(parent: { children: RootContent[] }, file: VFile, locale: Locale) {
  parent.children.forEach((child, index) => {
    const node = child as unknown as JsxFlowElement;
    if (node.type === "mdxJsxFlowElement" && node.name === COMPONENT) {
      const entries = entriesFor(node, file);
      const list = buildList(entries, locale, !hasTermsAttribute(node));
      replaceSource(file, child, toMarkdown(entries, locale));
      parent.children[index] = list;
      return;
    }
    if ("children" in child && Array.isArray(child.children)) {
      replaceIn(child as { children: RootContent[] }, file, locale);
    }
  });
}

function localeOf(path: string | undefined): Locale {
  const match = path?.match(/[\\/]docs[\\/]([a-z]{2})[\\/]/);
  const code = match?.[1];
  if (!code || !isLocale(code)) {
    throw new Error(`${COMPONENT}: cannot tell the locale of ${path ?? "an unnamed file"}`);
  }
  return code;
}

function hasTermsAttribute(node: JsxFlowElement): boolean {
  return node.attributes.some((attribute) => attribute.name === "terms");
}

function entriesFor(node: JsxFlowElement, file: VFile): readonly GlossaryEntry[] {
  const attribute = node.attributes.find((item) => item.name === "terms");
  if (!attribute) return GLOSSARY;
  if (typeof attribute.value !== "string") {
    throw new Error(`${COMPONENT} in ${file.path}: terms must be a plain string of keys`);
  }
  return attribute.value
    .split(/\s+/)
    .filter(Boolean)
    .map((key) => {
      const entry = glossaryEntry(key);
      if (!entry) throw new Error(`${COMPONENT} in ${file.path}: unknown glossary key "${key}"`);
      return entry;
    });
}

/**
 * In HTML the terms become a definition list (dl > div > dt + dd) via hName;
 * the Markdown version is the plain list from toMarkdown(). Items are "spread"
 * so their two paragraphs survive as the dt and the dd.
 */
function buildList(entries: readonly GlossaryEntry[], locale: Locale, withAnchors: boolean): List {
  return {
    type: "list",
    ordered: false,
    spread: true,
    data: { hName: "dl", hProperties: { className: ["glossary-list"] } },
    children: entries.map(
      (entry): ListItem => ({
        type: "listItem",
        spread: true,
        data: { hName: "div", hProperties: withAnchors ? { id: entry.key } : {} },
        children: [
          { type: "paragraph", data: { hName: "dt" }, children: [{ type: "text", value: entry[locale].term }] },
          { type: "paragraph", data: { hName: "dd" }, children: [{ type: "text", value: entry[locale].definition }] },
        ],
      }),
    ),
  };
}

function toMarkdown(entries: readonly GlossaryEntry[], locale: Locale): string {
  return entries.map((entry) => `- **${entry[locale].term}**: ${entry[locale].definition}`).join("\n");
}
