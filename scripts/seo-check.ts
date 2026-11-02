/**
 * SEO, structured data and Markdown-twin checks for the static export.
 *
 *   node scripts/seo-check.ts [--base http://localhost:8787] [--expect-published key1,key2]
 *
 * Reads out/ (after a build), the content frontmatter (for the draft flag and
 * dates) and, over HTTP from --base without JavaScript, each page's HTML to
 * prove the answer block is in the raw response. Exits 1 on any failure.
 */
import { existsSync } from "node:fs";
import { join } from "node:path";
import { frontmatter } from "fumadocs-core/content/md/frontmatter";
import {
  ANSWER_MAX_WORDS,
  ANSWER_MIN_WORDS,
  attr,
  contentFiles,
  countWords,
  decodeEntities,
  htmlToText,
  innerHtmlByAttr,
  parseArgs,
  read,
  ROOT,
  tagsOf,
  toPosix,
  urlOfContent,
  walk,
} from "./shared.ts";

const options = parseArgs(process.argv.slice(2));
const BASE = String(options.get("base") ?? "http://localhost:8787").replace(/\/+$/, "");
const EXPECT_PUBLISHED = String(options.get("expect-published") ?? "")
  .split(",")
  .map((key) => key.trim())
  .filter(Boolean);
const SITE_URL = (process.env.SITE_URL ?? "http://localhost:3100").replace(/\/+$/, "");
const OUT = join(ROOT, "out");

const TITLE_SUFFIX = { en: " | Square Share Docs", cs: " | Square Share dokumentace" } as const;
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

// ---------------------------------------------------------------------------
// Result bookkeeping
// ---------------------------------------------------------------------------

interface Row {
  label: string;
  failures: string[];
  checks: number;
}

function newRow(label: string): { row: Row; check: (ok: boolean, message: string) => void } {
  const row: Row = { label, failures: [], checks: 0 };
  return {
    row,
    check(ok, message) {
      row.checks += 1;
      if (!ok) row.failures.push(message);
    },
  };
}

// ---------------------------------------------------------------------------
// Content model
// ---------------------------------------------------------------------------

interface PageInfo {
  locale: "en" | "cs";
  url: string;
  absolute: string;
  title: string;
  description: string;
  translationKey: string;
  lastUpdated: string;
  draft: boolean;
  file: string;
}

function loadPages(): PageInfo[] {
  const pages: PageInfo[] = [];
  for (const page of contentFiles()) {
    const data = frontmatter(page.raw).data as Record<string, unknown>;
    const url = urlOfContent(page);
    const lastUpdated = data.lastUpdated instanceof Date ? data.lastUpdated.toISOString().slice(0, 10) : String(data.lastUpdated ?? "");
    pages.push({
      locale: page.locale,
      url,
      absolute: SITE_URL + url,
      title: String(data.title ?? ""),
      description: String(data.description ?? ""),
      translationKey: String(data.translationKey ?? ""),
      lastUpdated,
      draft: data.draft === true,
      file: page.rel,
    });
  }
  return pages.sort((a, b) => a.url.localeCompare(b.url));
}

function htmlFileOf(url: string): string {
  return join(OUT, `${url.slice(1)}.html`);
}

function mdFileOf(url: string): string {
  return join(OUT, `${url.slice(1)}.md`);
}

function outPathOfAbsolute(absoluteUrl: string): string | undefined {
  if (!absoluteUrl.startsWith(`${SITE_URL}/`)) return undefined;
  return join(OUT, absoluteUrl.slice(SITE_URL.length + 1));
}

function readIfExists(path: string): string | undefined {
  return existsSync(path) ? read(path) : undefined;
}

// ---------------------------------------------------------------------------
// HTML helpers
// ---------------------------------------------------------------------------

function count(html: string, tagName: string): number {
  return (html.match(new RegExp(`<${tagName}(?=[\\s>/])`, "gi")) ?? []).length;
}

function metaContent(html: string, key: "name" | "property", value: string): string | undefined {
  for (const tag of tagsOf(html, "meta")) {
    if (attr(tag, key)?.toLowerCase() === value) return attr(tag, "content");
  }
  return undefined;
}

function hreflangLinks(html: string): Record<string, string> {
  const result: Record<string, string> = {};
  for (const tag of tagsOf(html, "link")) {
    if (attr(tag, "rel")?.toLowerCase() === "alternate" && attr(tag, "hreflang")) {
      result[attr(tag, "hreflang") ?? ""] = attr(tag, "href") ?? "";
    }
  }
  return result;
}

function jsonLdNodes(html: string, problems: string[]): Record<string, unknown>[] {
  const nodes: Record<string, unknown>[] = [];
  for (const match of html.matchAll(/<script[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/gi)) {
    try {
      const parsed: unknown = JSON.parse(decodeEntities(match[1] ?? ""));
      const root = parsed as Record<string, unknown>;
      const graph = root["@graph"];
      if (Array.isArray(graph)) nodes.push(...(graph as Record<string, unknown>[]));
      else nodes.push(root);
    } catch (error) {
      problems.push(`JSON-LD does not parse: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
  return nodes;
}

function normalize(text: string): string {
  const BS = String.fromCharCode(92);
  let result = "";
  for (let i = 0; i < text.length; i += 1) {
    const ch = text[i] ?? "";
    // Markdown escapes: a backslash before punctuation is dropped.
    if (ch === BS && /[!-/:-@[-`{-~]/.test(text[i + 1] ?? "")) continue;
    result += ch;
  }
  return result
    .replace(/!\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/[*_`~]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function h2Texts(html: string): string[] {
  return [...html.matchAll(/<h2(?:\s[^>]*)?>([\s\S]*?)<\/h2>/gi)].map((m) => htmlToText((m[1] ?? "").replace(/<button[\s\S]*?<\/button>/gi, " "))).filter(Boolean);
}

/** True when `text` contains `url` as a whole URL, not as the start of a longer one. */
function mentions(text: string, url: string): boolean {
  let from = 0;
  for (;;) {
    const at = text.indexOf(url, from);
    if (at < 0) return false;
    const next = text.slice(at + url.length, at + url.length + 2);
    if (!/^[A-Za-z0-9_/-]/.test(next) && !/^\.[A-Za-z0-9]/.test(next)) return true;
    from = at + 1;
  }
}

function sitemapEntries(xml: string): Map<string, { lastmod?: string; alternates: Record<string, string> }> {
  const entries = new Map<string, { lastmod?: string; alternates: Record<string, string> }>();
  for (const block of xml.matchAll(/<url>([\s\S]*?)<\/url>/g)) {
    const body = block[1] ?? "";
    const loc = /<loc>([^<]*)<\/loc>/.exec(body)?.[1];
    if (!loc) continue;
    const lastmod = /<lastmod>([^<]*)<\/lastmod>/.exec(body)?.[1];
    const alternates: Record<string, string> = {};
    for (const link of body.matchAll(/<xhtml:link\b[^>]*>/g)) {
      const hreflang = attr(link[0], "hreflang");
      const href = attr(link[0], "href");
      if (hreflang && href) alternates[hreflang] = decodeEntities(href);
    }
    entries.set(decodeEntities(loc), { ...(lastmod ? { lastmod } : {}), alternates });
  }
  return entries;
}

// ---------------------------------------------------------------------------
// Run
// ---------------------------------------------------------------------------

async function fetchText(path: string): Promise<{ ok: boolean; status: number; text: string }> {
  const response = await fetch(`${BASE}${path}`, { redirect: "follow" });
  return { ok: response.ok, status: response.status, text: await response.text() };
}

const pages = loadPages();
const byUrl = new Map(pages.map((page) => [page.url, page]));
const rows: Row[] = [];

function pairOf(page: PageInfo): PageInfo | undefined {
  const other = page.locale === "en" ? "cs" : "en";
  return pages.find((candidate) => candidate.locale === other && candidate.translationKey === page.translationKey);
}

/**
 * Next writes the site root in <link hreflang> without its trailing slash, the
 * sitemap keeps it: the same URL either way, so compare them without it.
 */
function sameUrls(map: Record<string, string>): string {
  const normalized: Record<string, string> = {};
  for (const [key, url] of Object.entries(map)) normalized[key] = url.replace(/^(https?:\/\/[^/]+)\/$/, "$1");
  return JSON.stringify(sortKeys(normalized));
}

/** The hreflang set a page must carry, or undefined when it must carry none. */
function expectedAlternates(page: PageInfo): Record<string, string> | undefined {
  const pair = pairOf(page);
  if (page.draft || !pair || pair.draft) return undefined;
  const en = page.locale === "en" ? page : pair;
  const cs = page.locale === "cs" ? page : pair;
  return { en: en.absolute, cs: cs.absolute, "x-default": `${SITE_URL}/` };
}

// Global files.
const globalCheck = newRow("site files");
rows.push(globalCheck.row);
for (const file of ["robots.txt", "sitemap.xml", "llms.txt", "en/llms.txt", "cs/llms.txt", "en/llms-full.txt", "cs/llms-full.txt"]) {
  globalCheck.check(existsSync(join(OUT, file)), `out/${file} is missing`);
}
const robots = readIfExists(join(OUT, "robots.txt")) ?? "";
globalCheck.check(/^User-agent:\s*\*\s*$/im.test(robots), 'robots.txt has no "User-agent: *"');
globalCheck.check(/^Allow:\s*\/\s*$/im.test(robots), 'robots.txt has no "Allow: /"');
globalCheck.check(/^Sitemap:\s*\S+/im.test(robots), "robots.txt has no Sitemap line");
for (const agent of CRAWLERS) {
  const group = new RegExp(`^User-agent:\\s*${agent}\\s*$`, "im");
  globalCheck.check(group.test(robots), `robots.txt has no explicit group for ${agent}`);
}
const sitemapXml = readIfExists(join(OUT, "sitemap.xml")) ?? "";
const sitemap = sitemapEntries(sitemapXml);
for (const loc of sitemap.keys()) {
  const page = byUrl.get(loc.startsWith(SITE_URL) ? loc.slice(SITE_URL.length) : "");
  globalCheck.check(Boolean(page), `sitemap.xml lists ${loc}, which is not a content page`);
  if (page) globalCheck.check(!page.draft, `sitemap.xml lists draft page ${loc}`);
}
globalCheck.check(pages.length > 0, "no content pages found under content/docs");

// --expect-published.
if (EXPECT_PUBLISHED.length > 0) {
  const expectCheck = newRow(`expect-published ${EXPECT_PUBLISHED.join(",")}`);
  rows.push(expectCheck.row);
  for (const key of EXPECT_PUBLISHED) {
    const keyed = pages.filter((page) => page.translationKey === key);
    expectCheck.check(keyed.length > 0, `no page has translationKey "${key}"`);
    for (const page of keyed) expectCheck.check(!page.draft, `${page.url} (${key}) is still a draft`);
  }
}

// Pages.
let baseReachable = true;
for (const page of pages) {
  const { row, check } = newRow(page.url);
  rows.push(row);

  const htmlPath = htmlFileOf(page.url);
  const html = readIfExists(htmlPath);
  if (html === undefined) {
    check(false, `out/${page.url.slice(1)}.html is missing (build out of date?)`);
    continue;
  }

  // Structure.
  check(count(html, "h1") === 1, `expected exactly one <h1>, found ${count(html, "h1")}`);
  const title = decodeEntities(/<title[^>]*>([\s\S]*?)<\/title>/i.exec(html)?.[1] ?? "");
  check(title.endsWith(TITLE_SUFFIX[page.locale]), `<title> "${title}" does not end with "${TITLE_SUFFIX[page.locale]}"`);
  check(title === page.title + TITLE_SUFFIX[page.locale], `<title> "${title}" is not frontmatter title + suffix`);
  check(Boolean(metaContent(html, "name", "description")?.trim()), "meta description is missing");
  const canonical = tagsOf(html, "link")
    .filter((tag) => attr(tag, "rel")?.toLowerCase() === "canonical")
    .map((tag) => attr(tag, "href"));
  check(canonical.length === 1 && canonical[0] === page.absolute, `canonical is ${JSON.stringify(canonical)}, expected ${page.absolute}`);
  const htmlLang = attr(/<html[^>]*>/i.exec(html)?.[0] ?? "", "lang");
  check(htmlLang === page.locale, `<html lang> is "${htmlLang}", expected "${page.locale}"`);
  check(count(html, "main") === 1, `expected exactly one <main>, found ${count(html, "main")}`);
  check(count(html, "nav") >= 1, "no <nav> found");
  check(count(html, "article") === 1, `expected exactly one <article>, found ${count(html, "article")}`);

  // JSON-LD.
  const problems: string[] = [];
  const nodes = jsonLdNodes(html, problems);
  for (const problem of problems) check(false, problem);
  check(nodes.length > 0 || problems.length > 0, "no JSON-LD found");
  const article = nodes.find((node) => node["@type"] === "TechArticle");
  check(Boolean(article), "JSON-LD has no TechArticle");
  if (article) {
    for (const field of ["headline", "description", "inLanguage", "datePublished", "dateModified", "author", "publisher", "url"]) {
      check(article[field] !== undefined && article[field] !== "", `TechArticle.${field} is missing`);
    }
    check(article.inLanguage === page.locale, `TechArticle.inLanguage is ${JSON.stringify(article.inLanguage)}, expected "${page.locale}"`);
    check(article.headline === page.title, `TechArticle.headline is ${JSON.stringify(article.headline)}, expected the page title`);
    check(article.dateModified === page.lastUpdated, `TechArticle.dateModified is ${JSON.stringify(article.dateModified)}, expected ${page.lastUpdated}`);
    check(article.url === page.absolute, `TechArticle.url is ${JSON.stringify(article.url)}, expected ${page.absolute}`);
  }
  const crumbs = nodes.find((node) => node["@type"] === "BreadcrumbList");
  check(Boolean(crumbs), "JSON-LD has no BreadcrumbList");
  if (crumbs) {
    const items = Array.isArray(crumbs.itemListElement) ? (crumbs.itemListElement as Record<string, unknown>[]) : [];
    check(items.length > 0, "BreadcrumbList has no items");
    items.forEach((item, index) => {
      check(item.position === index + 1, `BreadcrumbList item ${index + 1} has position ${JSON.stringify(item.position)}`);
      check(typeof item.name === "string" && item.name !== "", `BreadcrumbList item ${index + 1} has no name`);
      check(typeof item.item === "string" && item.item !== "", `BreadcrumbList item ${index + 1} has no item URL`);
    });
  }
  if (page.translationKey === "what-is-square-share") {
    const org = nodes.find((node) => node["@type"] === "Organization" && node.email !== undefined);
    check(Boolean(org), "what-is-square-share has no Organization in JSON-LD");
    if (org) {
      check(org.name === "Square Share", `Organization.name is ${JSON.stringify(org.name)}`);
      check(org.alternateName === "SquareShare", `Organization.alternateName is ${JSON.stringify(org.alternateName)}`);
      check(typeof org.url === "string" && org.url !== "", "Organization.url is missing");
      check(typeof org.logo === "string" && org.logo !== "", "Organization.logo is missing");
      check(org.email === "office@squareshare.eu", `Organization.email is ${JSON.stringify(org.email)}`);
    }
  }

  // Markdown twin.
  const mdLinks = tagsOf(html, "link").filter((tag) => attr(tag, "rel")?.toLowerCase() === "alternate" && attr(tag, "type") === "text/markdown");
  check(mdLinks.length === 1, `expected one <link rel="alternate" type="text/markdown">, found ${mdLinks.length}`);
  const mdHref = mdLinks[0] ? attr(mdLinks[0], "href") : undefined;
  const mdPath = mdHref ? outPathOfAbsolute(mdHref) : undefined;
  check(mdPath !== undefined && existsSync(mdPath), `markdown alternate ${mdHref ?? "(none)"} does not point at an existing .md file`);
  check(mdHref === `${page.absolute}.md`, `markdown alternate is ${mdHref}, expected ${page.absolute}.md`);
  const markdown = readIfExists(mdFileOf(page.url));
  check(markdown !== undefined, `out/${page.url.slice(1)}.md is missing`);
  const answerHtml = innerHtmlByAttr(html, "data-answer-block");
  const answerText = answerHtml === undefined ? undefined : htmlToText(answerHtml);
  if (markdown !== undefined) {
    const firstLine = markdown.split(/\r?\n/).find((line) => line.trim() !== "") ?? "";
    check(firstLine === `# ${page.title}`, `.md first heading is "${firstLine}", expected "# ${page.title}"`);
    const flat = normalize(markdown);
    if (answerText !== undefined) check(flat.includes(normalize(answerText)), ".md does not contain the answer block text");
    for (const heading of h2Texts(html)) check(flat.includes(normalize(heading)), `.md does not contain the h2 "${heading}"`);
  }
  check(answerText !== undefined, "no data-answer-block in out/ HTML");

  // Raw HTML over HTTP, no JavaScript.
  if (baseReachable) {
    try {
      const response = await fetchText(page.url);
      check(response.ok, `GET ${BASE}${page.url} returned ${response.status}`);
      if (response.ok) {
        const fetched = innerHtmlByAttr(response.text, "data-answer-block");
        check(fetched !== undefined, `data-answer-block is not in the raw HTML from ${BASE}`);
        if (fetched !== undefined) {
          const words = countWords(htmlToText(fetched));
          check(words >= ANSWER_MIN_WORDS && words <= ANSWER_MAX_WORDS, `answer block has ${words} words; it must have ${ANSWER_MIN_WORDS} to ${ANSWER_MAX_WORDS}`);
        }
      }
    } catch (error) {
      baseReachable = false;
      check(false, `cannot fetch ${BASE}${page.url}: ${error instanceof Error ? error.message : String(error)}. Start it with \`pnpm worker:dev\`.`);
    }
  } else {
    check(false, `${BASE} is not reachable`);
  }

  // Draft state, indexing, sitemap, llms, hreflang.
  const robotsMeta = metaContent(html, "name", "robots") ?? "";
  const noindex = /noindex/i.test(robotsMeta);
  const banner = html.includes("data-draft-banner");
  const hreflang = hreflangLinks(html);
  const llmsIndex = readIfExists(join(OUT, page.locale, "llms.txt")) ?? "";
  const llmsFull = readIfExists(join(OUT, page.locale, "llms-full.txt")) ?? "";
  const llmsRoot = readIfExists(join(OUT, "llms.txt")) ?? "";
  const mdAbsolute = `${page.absolute}.md`;
  const entry = sitemap.get(page.absolute);

  if (page.draft) {
    check(banner, "draft page has no data-draft-banner");
    check(noindex, `draft page has no noindex (robots meta: "${robotsMeta}")`);
    check(!entry, "draft page is in sitemap.xml");
    check(!mentions(sitemapXml, page.absolute), "draft page URL appears in sitemap.xml");
    check(!mentions(llmsRoot, page.absolute) && !mentions(llmsRoot, mdAbsolute), "draft page is in /llms.txt");
    check(!mentions(llmsIndex, page.absolute) && !mentions(llmsIndex, mdAbsolute), `draft page is in /${page.locale}/llms.txt`);
    check(!mentions(llmsFull, page.absolute), `draft page is in /${page.locale}/llms-full.txt`);
    check(Object.keys(hreflang).length === 0, `draft page has hreflang links: ${Object.keys(hreflang).join(", ")}`);
  } else {
    check(!banner, "published page still shows data-draft-banner");
    check(!noindex, `published page has noindex (robots meta: "${robotsMeta}")`);
    check(Boolean(entry), "published page is missing from sitemap.xml");
    if (entry) check(entry.lastmod === page.lastUpdated, `sitemap <lastmod> is ${entry.lastmod}, expected ${page.lastUpdated}`);
    check(llmsIndex.includes(mdAbsolute), `published page is not in /${page.locale}/llms.txt`);
    check(mentions(llmsFull, page.absolute), `published page is not in /${page.locale}/llms-full.txt`);
    check(markdown === undefined || llmsFull.includes(page.title), `/${page.locale}/llms-full.txt does not include the page title`);
  }

  const expected = expectedAlternates(page);
  if (expected) {
    check(sameUrls(hreflang) === sameUrls(expected), `hreflang links are ${JSON.stringify(hreflang)}, expected ${JSON.stringify(expected)}`);
    if (entry) {
      check(
        sameUrls(entry.alternates) === sameUrls(expected),
        `sitemap xhtml:link alternates are ${JSON.stringify(entry.alternates)}, expected ${JSON.stringify(expected)}`,
      );
    }
    // Reciprocity: the pair's page lists the same set.
    const pair = pairOf(page);
    const pairHtml = pair ? readIfExists(htmlFileOf(pair.url)) : undefined;
    if (pairHtml !== undefined) {
      const theirs = hreflangLinks(pairHtml);
      check(sameUrls(theirs) === sameUrls(hreflang), `hreflang is not reciprocal with ${pair?.url}`);
    } else {
      check(false, `paired page ${pair?.url ?? "(none)"} has no HTML to compare hreflang with`);
    }
  } else if (!page.draft) {
    check(Object.keys(hreflang).length === 0, `page has hreflang links although its pair is missing or a draft: ${Object.keys(hreflang).join(", ")}`);
    if (entry) check(Object.keys(entry.alternates).length === 0, "sitemap lists xhtml:link alternates although the pair is missing or a draft");
  }
}

function sortKeys(record: Record<string, string>): [string, string][] {
  return Object.entries(record).sort(([a], [b]) => a.localeCompare(b));
}

// Pages built into out/ that the content does not know about (stale build).
for (const locale of ["en", "cs"]) {
  const htmlFiles = [...walk(join(OUT, locale), (_abs, name) => name.startsWith("__next") || name === "404")].filter((file) => file.endsWith(".html"));
  htmlFiles.push(join(OUT, `${locale}.html`));
  for (const file of htmlFiles) {
    if (!existsSync(file) || file.endsWith("404.html") || !existsSync(file.replace(/\.html$/, ".md"))) continue;
    const url = "/" + toPosix(file.slice(OUT.length + 1)).replace(/\.html$/, "");
    globalCheck.check(byUrl.has(url), `out/ has a built page for ${url} that content/docs does not (stale build?)`);
  }
}

// ---------------------------------------------------------------------------
// Output
// ---------------------------------------------------------------------------

const width = Math.max(...rows.map((row) => row.label.length), 10);
console.log(`seo-check: SITE_URL=${SITE_URL} base=${BASE}`);
console.log(`${"RESULT".padEnd(7)}${"TARGET".padEnd(width + 2)}CHECKS`);
let failedRows = 0;
let failedChecks = 0;
let totalChecks = 0;
for (const row of rows) {
  const failed = row.failures.length;
  totalChecks += row.checks;
  failedChecks += failed;
  if (failed > 0) failedRows += 1;
  console.log(`${(failed > 0 ? "FAIL" : "PASS").padEnd(7)}${row.label.padEnd(width + 2)}${row.checks - failed}/${row.checks}`);
  for (const message of row.failures) console.log(`        - ${message}`);
}
console.log(`\nseo-check: ${rows.length - failedRows} passed, ${failedRows} failed (${totalChecks - failedChecks}/${totalChecks} checks)`);
process.exit(failedRows > 0 ? 1 : 0);
