/**
 * Derived URLs of a page. Pure string helpers (no content imports) so the
 * route handlers, metadata, JSON-LD and scripts/postbuild.ts agree on them.
 */
interface PageRef {
  slugs: string[];
  locale?: string | undefined;
  url: string;
}

/**
 * Subpath the export is served from (`/SQ-docs` on GitHub Pages, empty on the
 * Workers). next/link and the router add it themselves; plain `<a>` hrefs and
 * `fetch()` calls go through withBasePath().
 */
export const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

export function withBasePath(path: string): string {
  return `${BASE_PATH}${path}`;
}

/** `/en/what-is-square-share` -> `/en/what-is-square-share.md`, `/en` -> `/en.md`. */
export function markdownPath(page: Pick<PageRef, "url">): string {
  return `${page.url}.md`;
}

/**
 * Where a browser opens a page's Markdown, given its `.md` URL. The build
 * serves `<page URL>.md` (postbuild moves the file there, worker/ serves it).
 * `next dev` has neither, and it cannot rewrite a URL onto a static export
 * route, so there the link goes to the Markdown route itself.
 */
export function markdownHref(markdownUrl: string): string {
  if (process.env.NODE_ENV !== "development") return withBasePath(markdownUrl);
  const [, locale = "", ...slugs] = markdownUrl.replace(/\.md$/, "").split("/");
  return withBasePath([MARKDOWN_ROUTE, locale, ...markdownRouteSegments({ slugs })].join("/"));
}

/** Route segments of the Markdown route handler, which postbuild moves to markdownPath(). */
export function markdownRouteSegments(page: Pick<PageRef, "slugs">): string[] {
  return [...page.slugs, "content.md"];
}

export const MARKDOWN_ROUTE = "/md";

/** The prebuilt static search index, downloaded by the search dialog. */
export const SEARCH_INDEX_PATH = withBasePath("/api/search.json");

export function ogImageSegments(page: Pick<PageRef, "slugs">): string[] {
  return [...page.slugs, "image.png"];
}

export function ogImagePath(page: PageRef): string {
  return ["/og", page.locale ?? "", ...ogImageSegments(page)].filter(Boolean).join("/");
}
