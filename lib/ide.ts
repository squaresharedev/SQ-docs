import type { IdeFile } from "@/components/ide/MarkdownIde";
import type { Locale } from "./i18n.ts";
import { pagesOf } from "./pairing.ts";
import type { DocsPage } from "./source.ts";
import { markdownViewPath } from "./urls.ts";

/** The workspace name the editor view shows in its title bar and explorer. */
export const WORKSPACE = "square-share-docs";

/** A page's file name in the editor view: its last slug, or index for a docs home. */
export function markdownFileName(page: Pick<DocsPage, "slugs">): string {
  return `${page.slugs.at(-1) ?? "index"}.md`;
}

/** The locale's pages as files for the explorer, in folders by their URL. */
export function ideFiles(locale: Locale): IdeFile[] {
  return pagesOf(locale).map((page) => ({
    path: [locale, ...page.slugs.slice(0, -1), markdownFileName(page)],
    href: markdownViewPath(page),
  }));
}
