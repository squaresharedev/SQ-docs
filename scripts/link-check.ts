/**
 * Internal link and fragment checker for the static export. Run after a build:
 * `pnpm check:links`.
 *
 * Reads every .html and .md file under out/ (not out/_next) and the llms*.txt
 * files, collects internal links (href and src that start with "/", or with
 * SITE_URL, or with https://docs.squareshare.eu), resolves each the way
 * Cloudflare static assets do (exact file, path + ".html", path +
 * "/index.html") and checks `#fragment` targets exist as ids in the target HTML.
 */
import { existsSync, readFileSync, statSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { attr, decodeEntities, ROOT, toPosix, walk } from "./shared.ts";

const OUT = resolve(ROOT, process.argv[2] ?? "out");
const SITE_URL = (process.env.SITE_URL ?? "http://localhost:3100").replace(/\/+$/, "");
const ORIGINS = [SITE_URL, "https://docs.squareshare.eu"];

if (!existsSync(OUT)) {
  console.error("link-check: out/ does not exist. Run `pnpm build` first.");
  process.exit(1);
}

function isFile(path: string): boolean {
  try {
    return statSync(path).isFile();
  } catch {
    return false;
  }
}

/** Maps a URL path to a file in out/ like Cloudflare static assets, or undefined. */
function resolveFile(urlPath: string): string | undefined {
  let path: string;
  try {
    path = decodeURIComponent(urlPath);
  } catch {
    path = urlPath;
  }
  const trimmed = path.replace(/\/+$/, "");
  const candidates = trimmed === "" ? ["index.html"] : [trimmed.slice(1), `${trimmed.slice(1)}.html`, `${trimmed.slice(1)}/index.html`];
  for (const candidate of candidates) {
    const file = join(OUT, candidate);
    if (isFile(file)) return file;
  }
  return undefined;
}

const idCache = new Map<string, Set<string>>();
function idsOf(file: string): Set<string> {
  let ids = idCache.get(file);
  if (!ids) {
    ids = new Set();
    const html = readFileSync(file, "utf8");
    for (const match of html.matchAll(/\s(?:id|name)\s*=\s*(?:"([^"]*)"|'([^']*)')/gi)) {
      ids.add(decodeEntities(match[1] ?? match[2] ?? ""));
    }
    idCache.set(file, ids);
  }
  return ids;
}

interface Link {
  raw: string;
  line: number;
}

function lineOf(text: string, index: number): number {
  let line = 1;
  for (let i = 0; i < index; i += 1) if (text.charCodeAt(i) === 10) line += 1;
  return line;
}

function htmlLinks(html: string): Link[] {
  // Inline scripts hold Next's flight data, not links.
  const cleaned = html.replace(/<script([^>]*)>[\s\S]*?<\/script>/gi, (_m, attrs: string) => `<script${attrs}></script>`);
  const links: Link[] = [];
  for (const tag of cleaned.matchAll(/<[a-z][^>]*>/gi)) {
    const source = tag[0];
    for (const name of ["href", "src", "poster"]) {
      const value = attr(source, name);
      if (value !== undefined) links.push({ raw: value, line: lineOf(cleaned, tag.index ?? 0) });
    }
    const srcset = attr(source, "srcset");
    if (srcset) {
      for (const part of srcset.split(",")) {
        const url = part.trim().split(/\s+/)[0];
        if (url) links.push({ raw: url, line: lineOf(cleaned, tag.index ?? 0) });
      }
    }
  }
  return links;
}

function markdownLinks(text: string): Link[] {
  const links: Link[] = [];
  for (const match of text.matchAll(/\]\(([^)\s]+)(?:\s+"[^"]*")?\)/g)) {
    links.push({ raw: match[1] ?? "", line: lineOf(text, match.index ?? 0) });
  }
  for (const origin of ORIGINS) {
    const bare = new RegExp(`${origin.replace(/[.*+?^${}()|[\]\\/]/g, "\\$&")}[^\\s)>\\]"'\`]*`, "g");
    for (const match of text.matchAll(bare)) {
      links.push({ raw: match[0].replace(/[.,;]+$/, ""), line: lineOf(text, match.index ?? 0) });
    }
  }
  return links;
}

/** The URL path of a file in out/, for resolving relative links. */
function urlPathOf(file: string): string {
  const rel = toPosix(file).slice(toPosix(OUT).length);
  return rel.replace(/\/index\.html$/, "/").replace(/\.html$/, "");
}

interface Target {
  path: string;
  fragment: string;
}

/** Internal target of a raw link, or undefined when the link is external or not a page link. */
function internalTarget(raw: string, sourceFile: string): Target | undefined {
  const value = raw.trim();
  if (value === "" || /^(mailto:|tel:|data:|javascript:|blob:)/i.test(value)) return undefined;

  let rest = value;
  const origin = ORIGINS.find((candidate) => rest === candidate || rest.startsWith(`${candidate}/`) || rest.startsWith(`${candidate}?`) || rest.startsWith(`${candidate}#`));
  if (origin) rest = rest.slice(origin.length) || "/";
  else if (/^[a-z][a-z0-9+.-]*:/i.test(rest) || rest.startsWith("//")) return undefined;

  const hashAt = rest.indexOf("#");
  const fragment = hashAt >= 0 ? rest.slice(hashAt + 1) : "";
  if (hashAt >= 0) rest = rest.slice(0, hashAt);
  const queryAt = rest.indexOf("?");
  if (queryAt >= 0) rest = rest.slice(0, queryAt);

  if (rest === "") return { path: urlPathOf(sourceFile), fragment };
  if (rest.startsWith("/")) return { path: rest, fragment };
  // Relative to the source page.
  const base = urlPathOf(sourceFile);
  const baseDir = base.endsWith("/") ? base : dirname(base);
  return { path: toPosix(join(baseDir, rest)).replace(/^[A-Za-z]:/, ""), fragment };
}

const sources = [...walk(OUT, (_abs, name) => name === "_next")].filter((file) => {
  const lower = file.toLowerCase();
  if (lower.endsWith(".html") || lower.endsWith(".md")) return true;
  // The .txt files that are not llms*.txt are Next's RSC payloads, not docs text.
  return lower.endsWith(".txt") && /(^|[\\/])llms[^\\/]*\.txt$/.test(lower);
});

const broken: string[] = [];
let linkCount = 0;
const seen = new Set<string>();

for (const file of sources) {
  const text = readFileSync(file, "utf8");
  const links = file.toLowerCase().endsWith(".html") ? htmlLinks(text) : markdownLinks(text);
  const sourceName = toPosix(file).slice(toPosix(ROOT).length + 1);
  for (const link of links) {
    const target = internalTarget(link.raw, file);
    if (!target) continue;
    const key = `${sourceName}|${link.raw}`;
    if (seen.has(key)) continue;
    seen.add(key);
    linkCount += 1;

    const resolved = resolveFile(target.path);
    if (!resolved) {
      broken.push(`${sourceName}:${link.line}: ${link.raw} -> no file for ${target.path}`);
      continue;
    }
    if (target.fragment && resolved.toLowerCase().endsWith(".html")) {
      let fragment = target.fragment;
      try {
        fragment = decodeURIComponent(fragment);
      } catch {
        // keep the raw fragment
      }
      if (fragment !== "top" && !idsOf(resolved).has(fragment)) {
        broken.push(`${sourceName}:${link.line}: ${link.raw} -> #${fragment} is not an id in ${toPosix(resolved).slice(toPosix(ROOT).length + 1)}`);
      }
    }
  }
}

if (broken.length > 0) {
  for (const line of broken) console.error(line);
  console.error(`\nlink-check: ${broken.length} broken link(s) (${linkCount} internal links in ${sources.length} files)`);
  process.exit(1);
}

console.log(`link-check: OK (${linkCount} internal links in ${sources.length} files, no broken links or fragments)`);
