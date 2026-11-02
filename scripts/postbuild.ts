/**
 * Runs after `next build`. The Markdown route handler can only emit
 * out/md/<lang>/<slug>/content.md (a route's last segment is its file name),
 * so this moves each file to its public address, <page URL>.md:
 *
 *   out/md/en/what-is-square-share/content.md -> out/en/what-is-square-share.md
 *   out/md/en/content.md                      -> out/en.md
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
console.log(`postbuild: ${moved} Markdown pages placed at <page URL>.md`);
