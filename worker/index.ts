import { Hono } from "hono";

/**
 * Serves the static export (out/) and adds Markdown content negotiation:
 * a page requested with `Accept: text/markdown` gets its `.md` version from
 * the same URL. Every page response says `Vary: Accept`, so caches keep the
 * two representations apart.
 */
type Env = { ASSETS: Fetcher; NOINDEX?: string };

const app = new Hono<{ Bindings: Env }>();

// Preview deploys (wrangler.toml [env.preview]) keep every response out of
// search indexes, so a public preview never competes with the real site.
app.use("*", async (c, next) => {
  await next();
  if (c.env.NOINDEX) c.res.headers.set("X-Robots-Tag", "noindex");
});

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

  // The site root is English: x-default in every hreflang set is the English page.
  if (url.pathname === "/" || url.pathname === "/index.html") {
    return withHeaders(new Response(null, { status: 301 }), { Location: `/en${url.search}`, "Cache-Control": CACHE.other });
  }

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

  // The assets layer sends /page/ to /page with a temporary 307. Make it a
  // permanent 308, so search engines settle on the address without the slash.
  const location = response.headers.get("Location");
  if (response.status === 307 && location && url.pathname.length > 1 && url.pathname.endsWith("/")) {
    return withHeaders(new Response(null, { status: 308 }), { Location: location, "Cache-Control": CACHE.other });
  }

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
