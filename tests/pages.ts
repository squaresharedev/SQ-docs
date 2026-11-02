/**
 * The page list the tests run over, built from out/ so a new page is picked up
 * automatically. A page is any built HTML under out/en or out/cs that has a
 * matching .md file (404 pages have none). The draft flag comes from the
 * content frontmatter, falling back to the draft banner in the built HTML.
 */
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { frontmatter } from "fumadocs-core/content/md/frontmatter";
import { contentFiles, toPosix, urlOfContent, walk } from "../scripts/shared.ts";

export type Locale = "en" | "cs";

export interface DocPage {
  url: string;
  locale: Locale;
  /** File-name-safe slug: "home" for the locale home, else the path joined by "-". */
  slug: string;
  draft: boolean;
  markdownUrl: string;
}

const OUT = join(process.cwd(), "out");

function draftsFromContent(): Map<string, boolean> {
  const drafts = new Map<string, boolean>();
  for (const page of contentFiles()) {
    drafts.set(urlOfContent(page), (frontmatter(page.raw).data as Record<string, unknown>).draft === true);
  }
  return drafts;
}

export function docPages(): DocPage[] {
  const drafts = draftsFromContent();
  const pages: DocPage[] = [];
  for (const locale of ["en", "cs"] as const) {
    const files = [...walk(join(OUT, locale), (_abs, name) => name.startsWith("__next") || name === "404")]
      .filter((file) => file.endsWith(".html"))
      .concat(join(OUT, `${locale}.html`));
    for (const file of files) {
      const stem = file.slice(0, -".html".length);
      if (!existsSync(file) || !existsSync(`${stem}.md`) || file.endsWith("404.html")) continue;
      const url = `/${toPosix(stem.slice(OUT.length + 1))}`;
      const rest = url.split("/").slice(2);
      pages.push({
        url,
        locale,
        slug: rest.length === 0 ? "home" : rest.join("-"),
        draft: drafts.get(url) ?? readFileSync(file, "utf8").includes("data-draft-banner"),
        markdownUrl: `${url}.md`,
      });
    }
  }
  return pages.sort((a, b) => a.url.localeCompare(b.url));
}

export const PAGES = docPages();

export function pageByUrl(url: string): DocPage {
  const page = PAGES.find((candidate) => candidate.url === url);
  if (!page) throw new Error(`${url} is not in out/. Run pnpm build first.`);
  return page;
}
