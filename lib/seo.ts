import type { Metadata } from "next";
import { COPY } from "./copy.ts";
import { DEFAULT_LOCALE, LANGUAGE_TAG, LOCALES, OG_LOCALE, type Locale } from "./i18n.ts";
import { localeOf, publishedAlternates } from "./pairing.ts";
import { absoluteUrl, INDEXABLE, SITE_URL } from "./site.ts";
import type { DocsPage } from "./source.ts";
import { markdownPath, ogImagePath } from "./urls.ts";

export function pageTitle(title: string, locale: Locale): string {
  return `${title} | ${COPY[locale].titleSuffix}`;
}

/**
 * hreflang map for a page, or undefined when any version is missing or a draft.
 * Every page lists itself and its pair (paired by translationKey, see
 * lib/pairing.ts); x-default is the English version, the one a reader gets
 * when their language has none. The site root redirects to /en for the same
 * reason (worker/index.ts).
 */
export function hreflangFor(page: DocsPage): Record<string, string> | undefined {
  const versions = publishedAlternates(page);
  if (!versions) return undefined;
  const languages: Record<string, string> = {};
  for (const locale of LOCALES) languages[LANGUAGE_TAG[locale]] = absoluteUrl(versions[locale].url);
  languages["x-default"] = absoluteUrl(versions[DEFAULT_LOCALE].url);
  return languages;
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
    // Drafts, and every page of a non-production build, stay out of indexes.
    robots: page.data.draft || !INDEXABLE
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
