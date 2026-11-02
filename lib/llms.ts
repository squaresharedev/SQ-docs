import { COPY } from "./copy.ts";
import { LANGUAGE_NAME, LOCALES, type Locale } from "./i18n.ts";
import { isPublished, localeOf, pagesOf } from "./pairing.ts";
import { absoluteUrl, BRAND_NAME, CONTACT_EMAIL, HOME_URL } from "./site.ts";
import type { DocsPage } from "./source.ts";
import { markdownPath } from "./urls.ts";

/**
 * The Markdown version of one page: the page title, its description, its URL
 * and date, then the body as Fumadocs' processed Markdown (MDX components and
 * writer comments already resolved, see lib/source.ts).
 */
export async function pageMarkdown(page: DocsPage): Promise<string> {
  const copy = COPY[localeOf(page)];
  const status = page.data.draft ? ` ${copy.draftTitle}.` : "";
  const body = (await page.data.getText("processed")).trim();
  return [
    `# ${page.data.title}`,
    `> ${page.data.description}`,
    `${copy.lastUpdated}: ${page.data.lastUpdated}.${status} URL: ${absoluteUrl(page.url)}`,
    body,
  ].join("\n\n") + "\n";
}

/** Pages AI crawlers may read: published ones only, in sidebar order. */
export function publishedPages(locale: Locale): DocsPage[] {
  return pagesOf(locale).filter(isPublished);
}

const LOCALE_SUMMARY: Record<Locale, string> = {
  en: "Documentation for Square Share: add a storefront or a purchase button to the website you already have. Buyers pay the seller directly.",
  cs: "Dokumentace Square Share: přidejte výlohu nebo tlačítko pro nákup na web, který už máte. Zákazníci platí přímo prodejci.",
};

const EMPTY_NOTE: Record<Locale, string> = {
  en: "No pages are published yet.",
  cs: "Zatím nejsou zveřejněné žádné stránky.",
};

/** `/<locale>/llms.txt`: one line per published page, linking its `.md` version. */
export function localeLlmsIndex(locale: Locale): string {
  const pages = publishedPages(locale);
  const lines = pages.map(
    (page) => `- [${page.data.title}](${absoluteUrl(markdownPath(page))}): ${page.data.description}`,
  );
  return [
    `# ${COPY[locale].siteName}`,
    `> ${LOCALE_SUMMARY[locale]}`,
    `Full text: ${absoluteUrl(`/${locale}/llms-full.txt`)}`,
    `## ${locale === "cs" ? "Stránky" : "Pages"}`,
    lines.length > 0 ? lines.join("\n") : EMPTY_NOTE[locale],
  ].join("\n\n") + "\n";
}

/** `/<locale>/llms-full.txt`: every published page in full. */
export async function localeLlmsFull(locale: Locale): Promise<string> {
  const pages = publishedPages(locale);
  if (pages.length === 0) return `# ${COPY[locale].siteName}\n\n${EMPTY_NOTE[locale]}\n`;
  const rendered = await Promise.all(pages.map(pageMarkdown));
  return rendered.join("\n---\n\n");
}

/** Root `/llms.txt`: what the site is, and where each language's index lives. */
export function rootLlms(): string {
  const locales = LOCALES.map(
    (locale) =>
      `- [${LANGUAGE_NAME[locale]}](${absoluteUrl(`/${locale}/llms.txt`)}): ${LOCALE_SUMMARY[locale]} Full text: ${absoluteUrl(`/${locale}/llms-full.txt`)}`,
  );
  return [
    `# ${BRAND_NAME} Docs`,
    `> ${BRAND_NAME} is storefront infrastructure for people who already have a website. Sellers add a storefront or a purchase button to their own site, and buyers pay the seller directly. Operated by Root Labs in Brno, Czech Republic.`,
    `Every page is also available as Markdown at its URL plus \`.md\`, or by requesting it with \`Accept: text/markdown\`. Website: ${HOME_URL}. Contact: ${CONTACT_EMAIL}.`,
    "## Languages",
    locales.join("\n"),
  ].join("\n\n") + "\n";
}
