import type { Metadata } from "next";
import { COPY } from "./copy.ts";
import { DEFAULT_LOCALE, LANGUAGE_TAG, LOCALES, OG_LOCALE, type Locale } from "./i18n.ts";
import { publishedPages } from "./llms.ts";
import { localeOf, publishedAlternates } from "./pairing.ts";
import { absoluteUrl, SITE_URL } from "./site.ts";
import type { DocsPage } from "./source.ts";
import { markdownPath, ogImagePath } from "./urls.ts";

export function pageTitle(title: string, locale: Locale): string {
  return `${title} | ${COPY[locale].titleSuffix}`;
}

/**
 * hreflang map for a page, or undefined when any version is missing or a draft.
 *
 * x-default is the version a reader gets when their language has none: the
 * English page. Only the docs homes point it at the language chooser (/),
 * because only the homes are listed back in the chooser's own hreflang, and
 * Google ignores a link the other page does not return.
 */
export function hreflangFor(page: DocsPage): Record<string, string> | undefined {
  const versions = publishedAlternates(page);
  if (!versions) return undefined;
  const languages: Record<string, string> = {};
  for (const locale of LOCALES) languages[LANGUAGE_TAG[locale]] = absoluteUrl(versions[locale].url);
  languages["x-default"] = page.slugs.length === 0 ? absoluteUrl("/") : absoluteUrl(versions[DEFAULT_LOCALE].url);
  return languages;
}

/** The language chooser's hreflang: both docs homes once they are published, else none. */
export function chooserAlternates(): Record<string, string> | undefined {
  const homes: Record<string, string> = {};
  for (const locale of LOCALES) {
    const home = publishedPages(locale).find((page) => page.url === `/${locale}`);
    if (!home) return undefined;
    homes[LANGUAGE_TAG[locale]] = absoluteUrl(home.url);
  }
  return { ...homes, "x-default": absoluteUrl("/") };
}

export function pageMetadata(page: DocsPage): Metadata {
  const locale = localeOf(page);
  const title = pageTitle(page.data.title, locale);
  const url = absoluteUrl(page.url);
  const image = absoluteUrl(ogImagePath(page));
  const otherLocales = LOCALES.filter((code) => code !== locale).map((code) => OG_LOCALE[code]);

  return {
    metadataBase: new URL(SITE_URL),
    title: { absolute: title },
    description: page.data.description,
    alternates: {
      canonical: url,
      languages: hreflangFor(page),
      types: { "text/markdown": absoluteUrl(markdownPath(page)) },
    },
    // A published page also lets search results and AI answers quote it at any
    // length and show its card image large.
    robots: page.data.draft
      ? { index: false }
      : { index: true, follow: true, "max-snippet": -1, "max-image-preview": "large" },
    openGraph: {
      type: "article",
      title,
      description: page.data.description,
      url,
      siteName: COPY[locale].siteName,
      locale: OG_LOCALE[locale],
      alternateLocale: otherLocales,
      // No separate publication date exists, so both carry lastUpdated (as in the JSON-LD).
      publishedTime: page.data.lastUpdated,
      modifiedTime: page.data.lastUpdated,
      images: [{ url: image, width: 1200, height: 630, alt: page.data.title }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description: page.data.description,
      images: [{ url: image, alt: page.data.title }],
    },
  };
}
