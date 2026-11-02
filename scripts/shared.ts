/**
 * Helpers shared by the quality scripts (content-lint, link-check, seo-check,
 * draft-path-check, lighthouse). Erasable TypeScript only: Node strips types.
 */
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative, sep } from "node:path";

export const EM_DASH = String.fromCharCode(0x2014);
export const EN_DASH = String.fromCharCode(0x2013);

/** Repo root: the folder above scripts/. */
export const ROOT = join(import.meta.dirname, "..");

export function toPosix(path: string): string {
  return path.split(sep).join("/");
}

export function relPath(absolute: string): string {
  return toPosix(relative(ROOT, absolute));
}

export function read(path: string): string {
  return readFileSync(path, "utf8");
}

export function* walk(dir: string, skipDir: (absolute: string, name: string) => boolean = () => false): Generator<string> {
  if (!existsSync(dir)) return;
  for (const name of readdirSync(dir)) {
    const path = join(dir, name);
    let stat;
    try {
      stat = statSync(path);
    } catch {
      continue;
    }
    if (stat.isDirectory()) {
      if (skipDir(path, name)) continue;
      yield* walk(path, skipDir);
    } else {
      yield path;
    }
  }
}

/** Splits text into lines on LF or CRLF. */
export function lines(text: string): string[] {
  return text.split(/\r?\n/);
}

/** Strips Markdown and JSX syntax down to plain words. */
export function stripMarkdown(input: string): string {
  return input
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/\{\/\*[\s\S]*?\*\/\}/g, " ")
    .replace(/!\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/<[^>]+>/g, " ")
    .replace(/`([^`]*)`/g, "$1")
    .replace(/^\s{0,3}#{1,6}\s+/gm, "")
    .replace(/^\s*(?:[-*+]|\d+\.)\s+/gm, "")
    .replace(/(\*\*|__|\*|_|~~)/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/** Words in a piece of plain text: tokens that contain a letter or a digit. */
export function countWords(plain: string): number {
  return plain.split(/\s+/).filter((token) => /[\p{L}\p{N}]/u.test(token)).length;
}

export const ANSWER_MIN_WORDS = 40;
export const ANSWER_MAX_WORDS = 60;

const ENTITIES: Record<string, string> = {
  "&amp;": "&",
  "&lt;": "<",
  "&gt;": ">",
  "&quot;": '"',
  "&#x27;": "'",
  "&#39;": "'",
  "&nbsp;": " ",
  "&apos;": "'",
};

export function decodeEntities(input: string): string {
  return input
    .replace(/&(?:amp|lt|gt|quot|apos|nbsp|#x27|#39);/g, (entity) => ENTITIES[entity] ?? entity)
    .replace(/&#(\d+);/g, (_, code: string) => String.fromCodePoint(Number(code)))
    .replace(/&#x([0-9a-f]+);/gi, (_, code: string) => String.fromCodePoint(parseInt(code, 16)));
}

/** Visible text of an HTML fragment. */
export function htmlToText(html: string): string {
  return decodeEntities(
    html
      .replace(/<!--[\s\S]*?-->/g, "")
      .replace(/<script[\s\S]*?<\/script>/gi, " ")
      .replace(/<style[\s\S]*?<\/style>/gi, " ")
      // Inline tags join their text ("<a>x</a>." reads "x."); every other tag separates words.
      .replace(/<\/?(?:a|strong|em|b|i|code|span|kbd|abbr|time|small|sup|sub)\b[^>]*>/gi, "")
      .replace(/<[^>]+>/g, " "),
  )
    .replace(/\s+/g, " ")
    .trim();
}

/** Attribute value from a tag's source, or undefined. */
export function attr(tag: string, name: string): string | undefined {
  const match = new RegExp(String.raw`\s${name}\s*=\s*(?:"([^"]*)"|'([^']*)')`, "i").exec(tag);
  if (!match) return undefined;
  return decodeEntities(match[1] ?? match[2] ?? "");
}

/** All opening tags `<name ...>` of one element name. */
export function tagsOf(html: string, name: string): string[] {
  return [...html.matchAll(new RegExp(String.raw`<${name}(?:\s[^>]*)?>`, "gi"))].map((m) => m[0]);
}

/**
 * Inner HTML of the first element carrying an attribute (for example
 * `data-answer-block`), balancing same-name nested tags. Undefined if absent.
 */
export function innerHtmlByAttr(html: string, attribute: string): string | undefined {
  const open = new RegExp(String.raw`<([a-z][a-z0-9]*)(?:\s[^>]*)?\s${attribute}(?:=[^>\s]*)?(?:\s[^>]*)?>`, "i").exec(html);
  if (!open) return undefined;
  const name = open[1] ?? "div";
  const start = open.index + open[0].length;
  const tag = new RegExp(String.raw`<(/?)${name}(?:\s[^>]*)?>`, "gi");
  tag.lastIndex = start;
  let depth = 1;
  for (let m = tag.exec(html); m; m = tag.exec(html)) {
    depth += m[1] ? -1 : 1;
    if (depth === 0) return html.slice(start, m.index);
  }
  return undefined;
}

export interface ContentPage {
  file: string;
  rel: string;
  locale: "en" | "cs";
  raw: string;
}

/** Every content/docs/<locale>/**.mdx file. */
export function contentFiles(): ContentPage[] {
  const pages: ContentPage[] = [];
  for (const locale of ["en", "cs"] as const) {
    for (const file of walk(join(ROOT, "content", "docs", locale))) {
      if (!file.endsWith(".mdx")) continue;
      pages.push({ file, rel: relPath(file), locale, raw: read(file) });
    }
  }
  return pages;
}

/** Page URL (`/en/what-is-square-share`) for a content file, using Fumadocs' folder rules. */
export function urlOfContent(page: ContentPage): string {
  const inner = relPath(page.file)
    .replace(/^content\/docs\//, "")
    .replace(/\.mdx$/, "")
    .split("/")
    .filter((segment) => !/^\(.*\)$/.test(segment));
  const [locale, ...rest] = inner;
  if (rest[rest.length - 1] === "index") rest.pop();
  return "/" + [locale, ...rest].join("/");
}

export function parseArgs(argv: string[]): Map<string, string | true> {
  const options = new Map<string, string | true>();
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (!arg || !arg.startsWith("--")) continue;
    const [name, inline] = arg.slice(2).split("=", 2);
    if (!name) continue;
    if (inline !== undefined) {
      options.set(name, inline);
    } else {
      const next = argv[i + 1];
      if (next && !next.startsWith("--")) {
        options.set(name, next);
        i += 1;
      } else {
        options.set(name, true);
      }
    }
  }
  return options;
}
