/**
 * Lighthouse (mobile, default config) for the home and one article page per
 * language, against the Worker on http://localhost:8787.
 *
 *   node scripts/lighthouse.ts [--base http://localhost:8787] [--allow-noindex]
 *
 * Reports go to reports/lighthouse/. Fails when any category is below 95.
 * Draft pages carry noindex, which fails Lighthouse's is-crawlable audit, so
 * `--allow-noindex` reports SEO both raw and without that audit and gates on
 * the second number. The real gate is `pnpm check:draft-path`, which runs this
 * with the pages published.
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { chromium } from "@playwright/test";
import { launch } from "chrome-launcher";
import lighthouse from "lighthouse";
import { parseArgs, ROOT } from "./shared.ts";

const options = parseArgs(process.argv.slice(2));
const BASE = String(options.get("base") ?? "http://localhost:8787").replace(/\/+$/, "");
const ALLOW_NOINDEX = options.get("allow-noindex") === true;
const THRESHOLD = 95;
const CATEGORIES = ["performance", "accessibility", "best-practices", "seo"] as const;
type CategoryId = (typeof CATEGORIES)[number];

const PATHS = ["/en", "/cs", "/en/what-is-square-share", "/cs/co-je-square-share"];
const REPORT_DIR = join(ROOT, "reports", "lighthouse");

interface AuditRef {
  id: string;
  weight: number;
}
interface Category {
  score: number | null;
  auditRefs: AuditRef[];
}
interface Lhr {
  categories: Record<string, Category | undefined>;
  audits: Record<string, { score: number | null } | undefined>;
}

function percent(score: number | null | undefined): number {
  return Math.round((score ?? 0) * 100);
}

/** Category score recomputed without the named audits (weighted mean of the rest). */
function scoreWithout(lhr: Lhr, id: CategoryId, excluded: string[]): number {
  const category = lhr.categories[id];
  if (!category) return 0;
  let weighted = 0;
  let total = 0;
  for (const ref of category.auditRefs) {
    if (excluded.includes(ref.id) || ref.weight <= 0) continue;
    const score = lhr.audits[ref.id]?.score;
    if (score === null || score === undefined) continue;
    weighted += score * ref.weight;
    total += ref.weight;
  }
  return total === 0 ? 100 : Math.round((weighted / total) * 100);
}

async function reachable(): Promise<boolean> {
  try {
    const response = await fetch(`${BASE}/en`);
    return response.status < 500;
  } catch {
    return false;
  }
}

if (!(await reachable())) {
  console.error(`lighthouse: ${BASE} is not reachable. Start it with \`pnpm worker:dev\`.`);
  process.exit(1);
}

mkdirSync(REPORT_DIR, { recursive: true });

const chrome = await launch({
  chromePath: chromium.executablePath(),
  chromeFlags: ["--headless=new", "--no-sandbox", "--disable-gpu"],
  logLevel: "silent",
});

interface Result {
  path: string;
  scores: Record<CategoryId, number>;
  seoRaw: number;
  failures: string[];
}
const results: Result[] = [];

try {
  for (const path of PATHS) {
    const run = await lighthouse(`${BASE}${path}`, {
      port: chrome.port,
      output: ["json", "html"],
      logLevel: "silent",
      onlyCategories: [...CATEGORIES],
    });
    if (!run) throw new Error(`Lighthouse returned no result for ${path}`);
    const lhr = run.lhr as unknown as Lhr;
    const reports = Array.isArray(run.report) ? run.report : [run.report];
    const slug = path.slice(1).replace(/\//g, "-") || "home";
    writeFileSync(join(REPORT_DIR, `${slug}.json`), reports[0] ?? "");
    writeFileSync(join(REPORT_DIR, `${slug}.html`), reports[1] ?? "");

    const scores = {} as Record<CategoryId, number>;
    for (const id of CATEGORIES) scores[id] = percent(lhr.categories[id]?.score);
    const seoRaw = scores.seo;
    if (ALLOW_NOINDEX) scores.seo = scoreWithout(lhr, "seo", ["is-crawlable"]);

    const failures: string[] = [];
    for (const id of CATEGORIES) {
      if (scores[id] < THRESHOLD) failures.push(`${id} ${scores[id]} < ${THRESHOLD}`);
    }
    results.push({ path, scores, seoRaw, failures });
  }
} finally {
  await chrome.kill();
}

const header = ["URL", "perf", "a11y", "best", ALLOW_NOINDEX ? "seo(no crawl)" : "seo", ...(ALLOW_NOINDEX ? ["seo(raw)"] : []), "result"];
console.log(`lighthouse: mobile, ${BASE}${ALLOW_NOINDEX ? ", --allow-noindex (is-crawlable excluded from the SEO gate)" : ""}`);
console.log(header.map((cell, index) => (index === 0 ? cell.padEnd(26) : cell.padEnd(14))).join(""));
for (const result of results) {
  const cells = [
    result.path.padEnd(26),
    String(result.scores.performance).padEnd(14),
    String(result.scores.accessibility).padEnd(14),
    String(result.scores["best-practices"]).padEnd(14),
    String(result.scores.seo).padEnd(14),
    ...(ALLOW_NOINDEX ? [String(result.seoRaw).padEnd(14)] : []),
    result.failures.length > 0 ? "FAIL" : "PASS",
  ];
  console.log(cells.join(""));
  for (const failure of result.failures) console.log(`    - ${failure}`);
}
console.log(`\nReports: ${REPORT_DIR}`);

const failed = results.filter((result) => result.failures.length > 0).length;
console.log(`lighthouse: ${results.length - failed} passed, ${failed} failed (threshold ${THRESHOLD})`);
process.exit(failed > 0 ? 1 : 0);
