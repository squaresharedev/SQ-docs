/**
 * Runs after `next build`. Two fixes to the static export in out/:
 *
 * 1. Markdown pages. The Markdown route handler can only emit
 *    out/md/<lang>/<slug>/content.md (a route's last segment is its file
 *    name), so each file moves to its public address, <page URL>.md:
 *      out/md/en/what-is-square-share/content.md -> out/en/what-is-square-share.md
 *      out/md/en/content.md                      -> out/en.md
 *
 * 2. Router prefetch files on Windows. Next names them by replacing "/" with
 *    "." in the segment path (convertSegmentPathToStaticExportFilename), but on
 *    Windows the path arrives with "\", so the export writes nested folders
 *    (__next.$d$lang/$oc$slug/__PAGE__.txt) where the browser asks for the flat
 *    name (__next.$d$lang.$oc$slug.__PAGE__.txt) and gets a 404. Flattening
 *    them gives the layout a Linux build produces. On Linux nothing matches.
 *
 * Usage: node scripts/postbuild.ts [outDir]
 */
import { existsSync, mkdirSync, readdirSync, renameSync, rmSync, statSync } from "node:fs";
import { dirname, join, relative, sep } from "node:path";

const outDir = process.argv[2] ?? "out";
const markdownRoot = join(outDir, "md");

if (!existsSync(markdownRoot)) {
  console.error(`postbuild: ${markdownRoot} is missing. Did next build run?`);
  process.exit(1);
}

function* walk(dir: string): Generator<string> {
  for (const name of readdirSync(dir)) {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) yield* walk(path);
    else yield path;
  }
}

let moved = 0;
for (const file of walk(markdownRoot)) {
  if (!file.endsWith(`${sep}content.md`)) continue;
  const pageDir = dirname(relative(markdownRoot, file));
  const target = join(outDir, `${pageDir}.md`);
  mkdirSync(dirname(target), { recursive: true });
  renameSync(file, target);
  moved += 1;
}
rmSync(markdownRoot, { recursive: true, force: true });

/** Folders named __next.* hold prefetch files that belong flat in their parent. */
function* nestedPrefetchDirs(dir: string): Generator<string> {
  for (const name of readdirSync(dir)) {
    const path = join(dir, name);
    if (!statSync(path).isDirectory() || name === "_next") continue;
    if (name.startsWith("__next.")) yield path;
    else yield* nestedPrefetchDirs(path);
  }
}

let flattened = 0;
for (const nested of [...nestedPrefetchDirs(outDir)]) {
  const parent = dirname(nested);
  for (const file of walk(nested)) {
    const flatName = relative(parent, file).split(sep).join(".");
    renameSync(file, join(parent, flatName));
    flattened += 1;
  }
  rmSync(nested, { recursive: true, force: true });
}

console.log(`postbuild: ${moved} Markdown pages placed at <page URL>.md, ${flattened} prefetch files flattened`);
