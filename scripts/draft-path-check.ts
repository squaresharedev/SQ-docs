/**
 * Proves the published path works. Every page in the repo is a draft, so the
 * hreflang, sitemap and llms.txt code paths for non-draft pages never run in a
 * normal build. This script publishes the four fixture pages, rebuilds, runs
 * the SEO check (and optionally Lighthouse) against them, then puts the
 * original bytes back and rebuilds again so out/ returns to the draft state.
 *
 *   node scripts/draft-path-check.ts [--all] [--lighthouse] [--skip-build]
 *
 * --all publishes every page instead of the four fixtures: the whole site as
 * it will be at launch. Run it with SITE_URL=https://docs.squareshare.eu to
 * check the production URLs too. Because new pages are often not committed
 * yet, it copies every file to a backup folder first instead of relying on
 * git, and prints where.
 *
 * --snapshot <dir> copies the published build's out/ to <dir> before the
 * restore, for reading the production HTML afterwards.
 *
 * --skip-build only edits and restores the files (used to test the revert
 * logic); it runs no build, server, check or Lighthouse.
 */
import { spawn, spawnSync, type ChildProcess } from "node:child_process";
import { cpSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { frontmatter } from "fumadocs-core/content/md/frontmatter";
import { contentFiles, parseArgs, ROOT } from "./shared.ts";

const options = parseArgs(process.argv.slice(2));
const WITH_LIGHTHOUSE = options.get("lighthouse") === true;
const SKIP_BUILD = options.get("skip-build") === true;
const PUBLISH_ALL = options.get("all") === true;
const SNAPSHOT = typeof options.get("snapshot") === "string" ? String(options.get("snapshot")) : undefined;
// Published pages are indexable only in a build for the production address
// (lib/site.ts INDEXABLE), so that is the build this check proves by default.
process.env.SITE_URL ??= "https://docs.squareshare.eu";
// A Worker of its own, started after the build: `wrangler dev` does not notice
// files that postbuild renames, so a server that was already running would
// serve a stale file list.
const PORT = "8788";
const BASE = `http://localhost:${PORT}`;
const ALL_PAGES = PUBLISH_ALL ? contentFiles() : [];

const FIXTURES = PUBLISH_ALL
  ? ALL_PAGES.map((page) => page.rel)
  : [
      "content/docs/en/index.mdx",
      "content/docs/en/(getting-started)/what-is-square-share.mdx",
      "content/docs/cs/index.mdx",
      "content/docs/cs/(zaciname)/co-je-square-share.mdx",
    ];

const EXPECT = PUBLISH_ALL
  ? [...new Set(ALL_PAGES.map((page) => String((frontmatter(page.raw).data as Record<string, unknown>).translationKey)))].join(",")
  : "docs-home,what-is-square-share";

const failures: string[] = [];
const isWindows = process.platform === "win32";

function phase(name: string): void {
  console.log(`\n=== [draft-path-check] ${name} ===`);
}

// ---------------------------------------------------------------------------
// Process helpers
// ---------------------------------------------------------------------------

let activeChild: ChildProcess | undefined;
let startedServer: ChildProcess | undefined;

function killTree(child: ChildProcess | undefined): void {
  if (!child || child.pid === undefined || child.exitCode !== null) return;
  if (isWindows) spawnSync("taskkill", ["/pid", String(child.pid), "/T", "/F"], { stdio: "ignore" });
  else child.kill("SIGTERM");
}

/** Runs a command, streaming its output. Resolves with its exit code. */
function run(label: string, command: string, args: string[], useShell = false): Promise<number> {
  console.log(`> ${label}`);
  return new Promise((resolve) => {
    const child = spawn(command, args, { cwd: ROOT, stdio: "inherit", shell: useShell, env: process.env });
    activeChild = child;
    child.on("error", (error) => {
      console.error(`${label}: ${error.message}`);
      resolve(1);
    });
    child.on("exit", (code, signal) => {
      activeChild = undefined;
      resolve(code ?? (signal ? 1 : 0));
    });
  });
}

function runSync(label: string, command: string, args: string[], useShell = false): number {
  console.log(`> ${label}`);
  const result = spawnSync(command, args, { cwd: ROOT, stdio: "inherit", shell: useShell, env: process.env });
  return result.status ?? 1;
}

async function serverUp(): Promise<boolean> {
  try {
    const response = await fetch(`${BASE}/en`, { signal: AbortSignal.timeout(3000) });
    return response.status < 500;
  } catch {
    return false;
  }
}

async function waitFor(check: () => Promise<boolean>, seconds: number): Promise<boolean> {
  const deadline = Date.now() + seconds * 1000;
  while (Date.now() < deadline) {
    if (await check()) return true;
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }
  return false;
}

// ---------------------------------------------------------------------------
// Fixture files: edit, and always restore
// ---------------------------------------------------------------------------

const originals = new Map<string, Buffer>();
let touched = false;
let restored = false;

function absolute(relative: string): string {
  return join(ROOT, ...relative.split("/"));
}

/** `draft: true` to `draft: false` inside the frontmatter block only. */
function publish(input: string): string | undefined {
  const bom = input.charCodeAt(0) === 0xfeff ? input.slice(0, 1) : "";
  const text = input.slice(bom.length);
  const match = /^(---\r?\n)([\s\S]*?)(\r?\n---)/.exec(text);
  if (!match) return undefined;
  const block = match[2] ?? "";
  const draftLine = /^(draft:[ \t]*)(?:true|false)([ \t]*)$/m;
  if (!draftLine.test(block)) return undefined;
  const edited = block.replace(draftLine, "$1false$2");
  return bom + (match[1] ?? "") + edited + (match[3] ?? "") + text.slice(match[0].length);
}

function restoreFiles(): boolean {
  if (restored || !touched) return true;
  let ok = true;
  for (const [relative, bytes] of originals) {
    try {
      writeFileSync(absolute(relative), bytes);
      if (!readFileSync(absolute(relative)).equals(bytes)) throw new Error("bytes differ after restore");
    } catch (error) {
      ok = false;
      console.error(`RESTORE FAILED for ${relative}: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
  if (ok) {
    restored = true;
    console.log(`restored ${originals.size} fixture file(s) to their original bytes`);
  }
  return ok;
}

async function rebuild(sync: boolean): Promise<boolean> {
  if (SKIP_BUILD) return true;
  const steps: [string, string, string[], boolean][] = [
    ["pnpm exec next build", "pnpm", ["exec", "next", "build"], true],
    ["node scripts/postbuild.ts", process.execPath, ["scripts/postbuild.ts"], false],
  ];
  for (const [label, command, args, shell] of steps) {
    const code = sync ? runSync(label, command, args, shell) : await run(label, command, args, shell);
    if (code !== 0) return false;
  }
  return true;
}

let cleaning = false;

/** Signal path: stop children, restore the files, rebuild, exit. */
function onSignal(signal: string): void {
  if (cleaning) return;
  cleaning = true;
  console.error(`\n[draft-path-check] ${signal} received: restoring fixture files and rebuilding`);
  killTree(activeChild);
  killTree(startedServer);
  const restoredOk = restoreFiles();
  let rebuilt = true;
  if (touched) {
    const wasBuilt = !SKIP_BUILD;
    if (wasBuilt) {
      rebuilt =
        runSync("pnpm exec next build", "pnpm", ["exec", "next", "build"], true) === 0 &&
        runSync("node scripts/postbuild.ts", process.execPath, ["scripts/postbuild.ts"]) === 0;
    }
  }
  process.exit(restoredOk && rebuilt ? 130 : 1);
}
process.on("SIGINT", () => onSignal("SIGINT"));
process.on("SIGTERM", () => onSignal("SIGTERM"));

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main(): Promise<void> {
  if (PUBLISH_ALL) {
    phase(`1/7 preflight: back up all ${FIXTURES.length} pages`);
    const backup = join(tmpdir(), `sq-docs-draft-path-${Date.now()}`);
    for (const relative of FIXTURES) {
      const target = join(backup, ...relative.split("/"));
      mkdirSync(dirname(target), { recursive: true });
      writeFileSync(target, readFileSync(absolute(relative)));
    }
    console.log(`backup of every page: ${backup}`);
  }
  phase("1/7 preflight: the fixture files must be clean in git");
  const status = spawnSync("git", ["status", "--porcelain", "--", "content/"], { cwd: ROOT, encoding: "utf8" });
  if (status.status !== 0) {
    console.error(`git status failed: ${status.stderr || status.error?.message || "unknown error"}`);
    process.exit(2);
  }
  const dirty = status.stdout
    .split(/\r?\n/)
    .filter(Boolean)
    .map((line) => line.slice(3).replace(/^"|"$/g, "").replace(/ -> .*$/, ""))
    .filter((path) => FIXTURES.includes(path));
  if (dirty.length > 0 && !PUBLISH_ALL) {
    console.error("Refusing to start: these fixture files have uncommitted changes, and the revert would not be exact:");
    for (const path of dirty) console.error(`  ${path}`);
    console.error("Commit or stash them, then run again.");
    process.exit(2);
  }

  phase(`2/7 publish ${PUBLISH_ALL ? `all ${FIXTURES.length} pages` : "the four fixture pages"} (draft: false)`);
  const edits = new Map<string, string>();
  for (const relative of FIXTURES) {
    const bytes = readFileSync(absolute(relative));
    originals.set(relative, bytes);
    const edited = publish(bytes.toString("utf8"));
    if (edited === undefined) {
      console.error(`${relative}: no "draft: true|false" line in the frontmatter. Nothing was changed.`);
      process.exit(2);
    }
    edits.set(relative, edited);
  }
  touched = true;
  for (const [relative, text] of edits) {
    writeFileSync(absolute(relative), text);
    console.log(`published ${relative}`);
  }

  if (SKIP_BUILD) {
    console.log("--skip-build: no build, server or checks");
    return;
  }

  phase("3/7 build the published site");
  if (!(await rebuild(false))) {
    failures.push("build with published fixtures failed");
    return;
  }

  phase("4/7 worker on " + BASE);
  if (await serverUp()) {
    failures.push(`${BASE} is already in use; stop that server and run again`);
    return;
  }
  console.log(`starting wrangler dev on ${PORT}`);
  startedServer = spawn(
    "pnpm",
    ["exec", "wrangler", "dev", "--config", "worker/wrangler.toml", "--port", PORT],
    { cwd: ROOT, stdio: "ignore", shell: true, env: process.env },
  );
  if (!(await waitFor(serverUp, 120))) {
    failures.push(`worker did not come up on ${BASE}`);
    return;
  }
  // The Worker may still hold the old draft pages for a moment after the rebuild.
  const fresh = await waitFor(async () => {
    try {
      const html = await (await fetch(`${BASE}/en/what-is-square-share`)).text();
      return !html.includes("data-draft-banner");
    } catch {
      return false;
    }
  }, 30);
  if (!fresh) failures.push(`${BASE}/en/what-is-square-share still serves the draft page after the rebuild`);

  phase("5/7 SEO check with the published pages");
  const seo = await run("node scripts/seo-check.ts", process.execPath, ["scripts/seo-check.ts", "--base", BASE, "--expect-published", EXPECT]);
  if (seo !== 0) failures.push("seo-check failed on the published pages");
  if (SNAPSHOT) {
    cpSync(join(ROOT, "out"), SNAPSHOT, { recursive: true });
    console.log(`snapshot of the published out/: ${SNAPSHOT}`);
  }

  phase("6/7 Lighthouse" + (WITH_LIGHTHOUSE ? "" : " (skipped, pass --lighthouse)"));
  if (WITH_LIGHTHOUSE) {
    const code = await run("node scripts/lighthouse.ts", process.execPath, ["scripts/lighthouse.ts", "--base", BASE]);
    if (code !== 0) failures.push("lighthouse scores are below 95 on the published pages");
  }
}

try {
  await main();
} catch (error) {
  failures.push(`unexpected error: ${error instanceof Error ? error.message : String(error)}`);
} finally {
  if (!cleaning) {
    cleaning = true;
    phase("7/7 restore the fixture files and rebuild the draft site");
    if (!restoreFiles()) failures.push("could not restore the fixture files; run `git checkout -- content/` for them");
    if (touched && !SKIP_BUILD) {
      if (!(await rebuild(false))) failures.push("rebuild after restore failed; out/ may still hold the published pages");
    }
    killTree(startedServer);
  }
}

console.log("");
if (failures.length > 0) {
  console.error("draft-path-check: FAILED");
  for (const failure of failures) console.error(`  - ${failure}`);
  process.exit(1);
}
console.log(SKIP_BUILD ? "draft-path-check: edit and restore OK (--skip-build)" : "draft-path-check: OK (published path verified, draft state restored)");
