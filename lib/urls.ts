/**
 * Derived URLs of a page. Pure string helpers (no content imports) so the
 * route handlers, metadata, JSON-LD and scripts/postbuild.ts agree on them.
 */
interface PageRef {
  slugs: string[];
  locale?: string | undefined;
  url: string;
}

/** `/en/what-is-square-share` -> `/en/what-is-square-share.md`, `/en` -> `/en.md`. */
export function markdownPath(page: Pick<PageRef, "url">): string {
  return `${page.url}.md`;
}

/** The page's Markdown shown in an editor: `/en/markdown/what-is-square-share`, `/en/markdown`. */
export function markdownViewPath(page: Pick<PageRef, "slugs" | "locale">): string {
  return ["", page.locale ?? "", "markdown", ...page.slugs].join("/");
}

/** Route segments of the Markdown route handler, which postbuild moves to markdownPath(). */
export function markdownRouteSegments(page: Pick<PageRef, "slugs">): string[] {
  return [...page.slugs, "content.md"];
}

export const MARKDOWN_ROUTE = "/md";

/** The prebuilt static search index, downloaded by the search dialog. */
export const SEARCH_INDEX_PATH = "/api/search.json";

export function ogImageSegments(page: Pick<PageRef, "slugs">): string[] {
  return [...page.slugs, "image.png"];
}

export function ogImagePath(page: PageRef): string {
  return ["/og", page.locale ?? "", ...ogImageSegments(page)].filter(Boolean).join("/");
}
