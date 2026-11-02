import { Hono } from "hono";

/**
 * Serves the static export (out/) and adds Markdown content negotiation:
 * a page requested with `Accept: text/markdown` gets its `.md` version from
 * the same URL. Every page response says `Vary: Accept`, so caches keep the
 * two representations apart.
 */
type Env = { ASSETS: Fetcher };

const app = new Hono<{ Bindings: Env }>();

/** Doc pages: /en, /cs and anything under them without a file extension. */
const PAGE_PATH = /^\/(en|cs)(\/[^.]*)?$/;

const CACHE = {
  // Pages and their Markdown change on every deploy: always revalidate.
  document: "public, max-age=0, must-revalidate",
  // Hashed build assets never change under the same name.
  immutable: "public, max-age=31536000, immutable",
  // Icons, OG images, robots.txt, sitemap.xml, llms*.txt, search index.
  other: "public, max-age=3600",
};

function wantsMarkdown(accept: string | undefined): boolean {
  return /(^|,)\s*text\/markdown\b/i.test(accept ?? "");
}

function markdownPath(pathname: string): string {
  return `${pathname.replace(/\/+$/, "")}.md`;
}

function withHeaders(response: Response, headers: Record<string, string>): Response {
  const result = new Response(response.body, response);
  for (const [name, value] of Object.entries(headers)) result.headers.set(name, value);
  return result;
}

app.get("*", async (c) => {
  const url = new URL(c.req.url);
  const isPage = PAGE_PATH.test(url.pathname);

  if (isPage && wantsMarkdown(c.req.header("Accept"))) {
    const markdown = await c.env.ASSETS.fetch(new URL(markdownPath(url.pathname), url));
    if (markdown.ok) {
      return withHeaders(markdown, {
        "Content-Type": "text/markdown; charset=utf-8",
        "Cache-Control": CACHE.document,
        Vary: "Accept",
      });
    }
  }

  const response = await c.env.ASSETS.fetch(c.req.raw);

  if (isPage) {
    return withHeaders(response, { "Cache-Control": CACHE.document, Vary: "Accept" });
  }
  if (url.pathname.endsWith(".md")) {
    return withHeaders(response, { "Content-Type": "text/markdown; charset=utf-8", "Cache-Control": CACHE.document });
  }
  if (url.pathname.startsWith("/_next/static/")) {
    return withHeaders(response, { "Cache-Control": CACHE.immutable });
  }
  const type = response.headers.get("Content-Type") ?? "";
  return withHeaders(response, { "Cache-Control": type.startsWith("text/html") ? CACHE.document : CACHE.other });
});

export default app;
