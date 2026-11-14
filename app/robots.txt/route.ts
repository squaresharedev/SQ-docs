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

/**
 * contentsignals.org: search results, AI answers that quote and link the docs
 * (ai-input), but no model training, matching the zone's Cloudflare policy.
 * A crawler reads only the group that names it, so every group repeats it.
 */
const CONTENT_SIGNAL = "Content-Signal: search=yes,ai-input=yes,ai-train=no";

export function GET() {
  const body = [
    "# Square Share Docs: every crawler, including AI crawlers, may read every page.",
    "# Draft pages carry <meta name=\"robots\" content=\"noindex\"> instead of a Disallow line.",
    "# AI answers may use the docs (ai-input=yes); training may not (ai-train=no).",
    "#",
    "# Cloudflare already allows AI search and agent crawlers on this zone. AI training",
    "# crawlers (GPTBot, ClaudeBot) are blocked zone-wide in Cloudflare, so their Allow",
    "# lines here have no effect unless that changes.",
    "",
    ...CRAWLERS.flatMap((agent) => [`User-agent: ${agent}`, CONTENT_SIGNAL, "Allow: /", ""]),
    "User-agent: *",
    CONTENT_SIGNAL,
    "Allow: /",
    "",
    `Sitemap: ${absoluteUrl("/sitemap.xml")}`,
    "",
  ].join("\n");
  return new Response(body, { headers: { "Content-Type": "text/plain; charset=utf-8" } });
}
