/**
 * Content and writing-style gate. Run with `pnpm content:lint`; `pnpm build`
 * runs it first. Prints `file:line: [rule] problem` and exits 1 on any finding.
 */
import { frontmatter } from "fumadocs-core/content/md/frontmatter";
import { GLOSSARY } from "../content/glossary.ts";
import { frontmatterSchema } from "../lib/frontmatter.ts";
import { compile, PRICE_PATTERNS, SLOP_CS, SLOP_EN, type CompiledRule } from "./lint-rules.ts";
import {
  ANSWER_MAX_WORDS,
  ANSWER_MIN_WORDS,
  contentFiles,
  countWords,
  EM_DASH,
  EN_DASH,
  lines,
  read,
  relPath,
  ROOT,
  stripMarkdown,
  walk,
} from "./shared.ts";

interface Finding {
  file: string;
  line: number;
  rule: string;
  message: string;
}

const findings: Finding[] = [];
function report(file: string, line: number, rule: string, message: string): void {
  findings.push({ file, line, rule, message });
}

// ---------------------------------------------------------------------------
// File sets
// ---------------------------------------------------------------------------

const SKIP_DIR_NAMES = new Set([
  "node_modules",
  ".next",
  ".source",
  ".wrangler",
  "test-results",
  "playwright-report",
  "reports",
  ".git",
]);
const SKIP_PATHS = new Set(["tests/screenshots", "out"]);
const BINARY = /\.(png|ico|jpe?g|gif|webp|woff2?|ttf|otf|eot|pdf|zip|gz|mp4|webm|tsbuildinfo)$/i;
const SKIP_FILES = new Set(["pnpm-lock.yaml"]);
const MAX_BYTES = 2_000_000;
const NUL = String.fromCharCode(0);
const BOM = String.fromCharCode(0xfeff);

function repoFiles(): string[] {
  const files: string[] = [];
  const skipDir = (absolute: string, name: string): boolean =>
    SKIP_PATHS.has(relPath(absolute)) || SKIP_DIR_NAMES.has(name);
  for (const file of walk(ROOT, skipDir)) {
    const rel = relPath(file);
    if (BINARY.test(file) || SKIP_FILES.has(rel)) continue;
    files.push(file);
  }
  return files;
}

/** These files quote the banned lists or the old dashboard wording. */
const PHRASE_EXEMPT = new Set(["scripts/lint-rules.ts", "WRITING.md", "RECON.md", "content/glossary.ts"]);

function isContentText(rel: string): boolean {
  return rel.startsWith("content/") && (rel.endsWith(".mdx") || rel.endsWith(".json"));
}

function isUiText(rel: string): boolean {
  if (/^(app|components|worker)\//.test(rel)) return /\.(tsx?|css|json|toml|mdx?)$/.test(rel);
  if (rel.startsWith("lib/")) return rel.endsWith(".ts") || rel.endsWith(".tsx");
  return false;
}

function isSlopScope(rel: string): boolean {
  return isContentText(rel) || isUiText(rel) || rel === "README.md";
}

/** Indexes of the lines inside the `cs: { ... }` block of a locale table. */
function csBlockLines(allLines: string[]): Set<number> {
  const inCs = new Set<number>();
  let open = false;
  for (let i = 0; i < allLines.length; i += 1) {
    const text = allLines[i] ?? "";
    if (!open && /^\s{2}cs:\s*\{/.test(text)) open = true;
    if (open) {
      inCs.add(i);
      if (/^\s{2}\},?\s*$/.test(text)) open = false;
    }
  }
  return inCs;
}

// ---------------------------------------------------------------------------
// Checks over every file
// ---------------------------------------------------------------------------

function scanRules(
  rel: string,
  allLines: string[],
  rules: CompiledRule[],
  rule: string,
  label: string,
  skip?: Set<number>,
  only?: Set<number>,
): void {
  allLines.forEach((text, index) => {
    if (skip?.has(index)) return;
    if (only && !only.has(index)) return;
    for (const { phrase, regex } of rules) {
      regex.lastIndex = 0;
      const match = regex.exec(text);
      if (match) report(rel, index + 1, rule, `${label} "${match[0]}" (rule: ${phrase})`);
    }
  });
}

const SLOP_EN_RULES = compile(SLOP_EN);
const SLOP_CS_RULES = compile(SLOP_CS);
const DEPRECATED_EN = compile(GLOSSARY.flatMap((entry) => entry.deprecated.en));
const DEPRECATED_CS = compile(GLOSSARY.flatMap((entry) => entry.deprecated.cs));

let scanned = 0;
for (const file of repoFiles()) {
  const rel = relPath(file);
  let text: string;
  try {
    text = read(file);
  } catch {
    continue;
  }
  if (text.length > MAX_BYTES || text.includes(NUL)) continue;
  scanned += 1;
  const all = lines(text);

  // 1. Em and en dashes anywhere.
  all.forEach((lineText, index) => {
    if (lineText.includes(EM_DASH)) report(rel, index + 1, "dash", "em dash (U+2014); use a comma, colon or full stop");
    if (lineText.includes(EN_DASH)) report(rel, index + 1, "dash", 'en dash (U+2013); use a hyphen or the word "to"');
  });

  if (PHRASE_EXEMPT.has(rel)) continue;

  const isCsContent = rel.startsWith("content/docs/cs/");
  const isEnContent = rel.startsWith("content/docs/en/");
  const isLocaleTable = rel === "lib/copy.ts" || rel === "lib/ui-translations.ts";
  const csLines = isLocaleTable ? csBlockLines(all) : undefined;

  // 2. Slop phrases.
  if (isSlopScope(rel)) {
    scanRules(rel, all, SLOP_EN_RULES, "slop", "banned phrase");
    scanRules(rel, all, SLOP_CS_RULES, "slop", "banned Czech phrase");
  }

  // 3. Deprecated glossary terms.
  if (isEnContent || isUiText(rel)) {
    scanRules(rel, all, DEPRECATED_EN, "deprecated-term", "deprecated English term", csLines);
  }
  if (isCsContent) {
    scanRules(rel, all, DEPRECATED_CS, "deprecated-term", "deprecated Czech term");
  } else if (isLocaleTable && csLines) {
    scanRules(rel, all, DEPRECATED_CS, "deprecated-term", "deprecated Czech term", undefined, csLines);
  }
}

// ---------------------------------------------------------------------------
// Content pages
// ---------------------------------------------------------------------------

/** Blanks fenced code blocks and inline code, keeping the line count. */
function blankCode(text: string): string {
  let fence: string | null = null;
  return lines(text)
    .map((lineText) => {
      const marker = /^\s*(```+|~~~+)/.exec(lineText)?.[1];
      if (fence) {
        if (marker && marker[0] === fence[0] && marker.length >= fence.length) fence = null;
        return "";
      }
      if (marker) {
        fence = marker;
        return "";
      }
      return lineText.replace(/(`+)[^`]*?\1/g, (m) => " ".repeat(m.length));
    })
    .join("\n");
}

const pages = contentFiles();
const keysByLocale: Record<"en" | "cs", Map<string, string[]>> = { en: new Map(), cs: new Map() };

const TODO_MARKER = "{/* TODO(adrian): native review */}";

/** Description openers that summarise the page ("How to...", "Jak...") instead of answering it. */
const DESCRIPTION_OPENER = /^(?:how|what|which|why|where|when|who|this page|these docs|learn|jak|co|kolik|proč|kde|kdy|kdo|které|jaké|tato stránka)(?![\p{L}\p{N}])/iu;

/**
 * The only pages allowed to state amounts: the pricing hub (what Square Share
 * charges) and the VAT page (the EU's and Czechia's official thresholds).
 */
const PRICING_PAGES = new Set([
  "content/docs/en/payments-and-payouts/index.mdx",
  "content/docs/cs/platby-a-vyplaty/index.mdx",
  "content/docs/en/payments-and-payouts/vat-and-taxes.mdx",
  "content/docs/cs/platby-a-vyplaty/dph-a-dane.mdx",
]);

for (const page of pages) {
  const { rel, raw, locale } = page;
  const text = raw.startsWith(BOM) ? raw.slice(1) : raw;
  const all = lines(text);

  // Prices, fees, percentages: everywhere except the pricing hub, the one page
  // that states what Square Share charges (WRITING.md, "Prices and fees").
  if (!PRICING_PAGES.has(rel)) lines(blankCode(text)).forEach((lineText, index) => {
    for (const { name, regex } of PRICE_PATTERNS) {
      regex.lastIndex = 0;
      const match = regex.exec(lineText);
      if (match) report(rel, index + 1, "price", `${name} "${match[0].trim()}"; docs never state prices, fees or percentages`);
    }
  });

  // Frontmatter.
  let bodyStart = 0;
  try {
    const parsed = frontmatter(text);
    bodyStart = lines(parsed.matter).length - 1;
    const result = frontmatterSchema.safeParse(parsed.data);
    if (!result.success) {
      for (const issue of result.error.issues) {
        const key = String(issue.path[0] ?? "");
        const keyLine = key ? all.findIndex((l) => l.startsWith(`${key}:`)) + 1 : 0;
        const where = issue.path.length > 0 ? issue.path.join(".") : "(frontmatter)";
        report(rel, keyLine > 0 ? keyLine : 1, "frontmatter", `${where}: ${issue.message}`);
      }
    } else {
      // A search result shows the title as its headline and the description
      // under it: the title is the question a reader types, the description
      // starts with its answer.
      const lineOf = (field: string) => all.findIndex((l) => l.startsWith(`${field}:`)) + 1 || 1;
      if (!result.data.title.endsWith("?")) {
        report(rel, lineOf("title"), "title", `title "${result.data.title}" must be the question a reader would type, ending in "?"`);
      }
      const opener = DESCRIPTION_OPENER.exec(result.data.description)?.[0];
      if (opener) {
        report(rel, lineOf("description"), "description", `description starts with "${opener.trim()}"; start with the answer to the title, not a summary of the page`);
      }
      const key = result.data.translationKey;
      const bucket = keysByLocale[locale].get(key) ?? [];
      bucket.push(rel);
      keysByLocale[locale].set(key, bucket);
    }
  } catch (error) {
    report(rel, 1, "frontmatter", `cannot parse frontmatter: ${error instanceof Error ? error.message : String(error)}`);
  }

  // Answer block.
  const bodyNoCode = blankCode(all.slice(bodyStart).join("\n"));
  const opens = [...bodyNoCode.matchAll(/<AnswerBlock(?:\s[^>]*)?>/g)];
  if (opens.length !== 1) {
    report(rel, bodyStart + 1, "answer-block", `expected exactly one <AnswerBlock>, found ${opens.length}`);
  } else {
    const first = opens[0];
    const start = first?.index ?? 0;
    const end = bodyNoCode.indexOf("</AnswerBlock>", start);
    const lineNo = bodyStart + bodyNoCode.slice(0, start).split("\n").length;
    if (end < 0) {
      report(rel, lineNo, "answer-block", "<AnswerBlock> is not closed");
    } else {
      const inner = bodyNoCode.slice(start + (first?.[0].length ?? 0), end);
      const words = countWords(stripMarkdown(inner));
      if (words < ANSWER_MIN_WORDS || words > ANSWER_MAX_WORDS) {
        report(rel, lineNo, "answer-block", `answer block has ${words} words; it must have ${ANSWER_MIN_WORDS} to ${ANSWER_MAX_WORDS}`);
      }
    }
  }

  // Czech review marker, right after the frontmatter.
  if (locale === "cs") {
    const firstLine = all.slice(bodyStart).findIndex((l) => l.trim() !== "");
    const found = firstLine < 0 ? "" : (all[bodyStart + firstLine] ?? "").trim();
    if (found !== TODO_MARKER) {
      report(rel, bodyStart + Math.max(firstLine, 0) + 1, "cs-review-marker", `the first line after the frontmatter must be ${TODO_MARKER}`);
    }
  }
}

// translationKey pairing.
const allKeys = new Set([...keysByLocale.en.keys(), ...keysByLocale.cs.keys()]);
for (const key of [...allKeys].sort()) {
  for (const locale of ["en", "cs"] as const) {
    const files = keysByLocale[locale].get(key) ?? [];
    if (files.length === 0) {
      const other = locale === "en" ? "cs" : "en";
      const where = keysByLocale[other].get(key)?.[0] ?? "content";
      report(where, 1, "translation-key", `translationKey "${key}" has no ${locale} page`);
    } else if (files.length > 1) {
      for (const file of files) {
        report(file, 1, "translation-key", `translationKey "${key}" appears ${files.length} times in ${locale}: ${files.join(", ")}`);
      }
    }
  }
}

// ---------------------------------------------------------------------------
// Output
// ---------------------------------------------------------------------------

if (findings.length > 0) {
  findings.sort((a, b) => a.file.localeCompare(b.file) || a.line - b.line);
  for (const finding of findings) {
    console.error(`${finding.file}:${finding.line}: [${finding.rule}] ${finding.message}`);
  }
  const files = new Set(findings.map((f) => f.file)).size;
  console.error(`\ncontent-lint: ${findings.length} problem(s) in ${files} file(s) (${scanned} files scanned, ${pages.length} pages)`);
  process.exit(1);
}

console.log(`content-lint: OK (${scanned} files scanned, ${pages.length} pages, ${allKeys.size} translation keys)`);
