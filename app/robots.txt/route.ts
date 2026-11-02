import { absoluteUrl } from "@/lib/site";

export const revalidate = false;

/** Search and AI crawlers named explicitly, so a reader can see they are allowed on purpose. */
const CRAWLERS = [
  "Googlebot",
  "Bingbot",
  "OAI-SearchBot",
  "ChatGPT-User",
  "GPTBot",
  "Claude-SearchBot",
  "Claude-User",
  "ClaudeBot",
  "PerplexityBot",
  "Perplexity-User",
];

export function GET() {
  const body = [
    "# Square Share Docs: every crawler, including AI crawlers, may read every page.",
    "# Draft pages carry <meta name=\"robots\" content=\"noindex\"> instead of a Disallow line.",
    "#",
    "# Deploy note: Cloudflare can block AI crawlers before they ever read this file.",
    "# In the Cloudflare dashboard (Security > Bots, and AI Crawl Control) the AI bot",
    "# setting for docs.squareshare.eu must also allow the crawlers listed below.",
    "",
    ...CRAWLERS.flatMap((agent) => [`User-agent: ${agent}`, "Allow: /", ""]),
    "User-agent: *",
    "Allow: /",
    "",
    `Sitemap: ${absoluteUrl("/sitemap.xml")}`,
    "",
  ].join("\n");
  return new Response(body, { headers: { "Content-Type": "text/plain; charset=utf-8" } });
}
