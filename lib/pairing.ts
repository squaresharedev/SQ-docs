import { LOCALES, type Locale } from "./i18n.ts";
import { source, type DocsPage } from "./source.ts";

/**
 * Translations are paired by the `translationKey` frontmatter field, because
 * Czech pages have Czech slugs (`/cs/co-je-square-share`), so Fumadocs' own
 * same-path pairing never matches them.
 */
export function pagesOf(locale: Locale): DocsPage[] {
  return source.getPages(locale);
}

export function allPages(): DocsPage[] {
  return LOCALES.flatMap((locale) => pagesOf(locale));
}

export function localeOf(page: DocsPage): Locale {
  const locale = LOCALES.find((code) => code === page.locale);
  if (!locale) throw new Error(`Page ${page.path} has no known locale`);
  return locale;
}

export function translationOf(page: DocsPage, target: Locale): DocsPage | undefined {
  if (localeOf(page) === target) return page;
  return pagesOf(target).find((candidate) => candidate.data.translationKey === page.data.translationKey);
}

export function isPublished(page: DocsPage): boolean {
  return !page.data.draft;
}

/**
 * The hreflang set for a page: every locale's version, but only when all of
 * them exist and none is a draft. Anything less returns null and the page
 * gets no alternates at all, so a draft never leaks into hreflang.
 */
export function publishedAlternates(page: DocsPage): Record<Locale, DocsPage> | null {
  const versions: Partial<Record<Locale, DocsPage>> = {};
  for (const locale of LOCALES) {
    const version = translationOf(page, locale);
    if (!version || !isPublished(version)) return null;
    versions[locale] = version;
  }
  return versions as Record<Locale, DocsPage>;
}

/** Where the language switcher sends each page: its pair, or the other locale's home. */
export type SwitchTargets = Record<string, Record<Locale, string>>;

export function switchTargets(): SwitchTargets {
  const targets: SwitchTargets = {};
  for (const page of allPages()) {
    const row = {} as Record<Locale, string>;
    for (const locale of LOCALES) {
      row[locale] = translationOf(page, locale)?.url ?? `/${locale}`;
    }
    targets[page.url] = row;
  }
  return targets;
}
