import { getBreadcrumbItems } from "fumadocs-core/breadcrumb";
import { COPY } from "./copy.ts";
import { LANGUAGE_TAG } from "./i18n.ts";
import { localeOf } from "./pairing.ts";
import {
  absoluteUrl,
  BRAND_ALTERNATE_NAME,
  BRAND_NAME,
  CONTACT_EMAIL,
  HOME_URL,
  LOGO_PATH,
} from "./site.ts";
import { source, type DocsPage } from "./source.ts";
import { ogImagePath } from "./urls.ts";

/** The page that also describes the company, so it carries Organization data. */
export const ORGANIZATION_PAGE_KEY = "what-is-square-share";

type JsonLdNode = Record<string, unknown>;

export function organization(): JsonLdNode {
  return {
    "@type": "Organization",
    "@id": `${HOME_URL}/#organization`,
    name: BRAND_NAME,
    alternateName: BRAND_ALTERNATE_NAME,
    url: HOME_URL,
    logo: absoluteUrl(LOGO_PATH),
    email: CONTACT_EMAIL,
  };
}

/** Breadcrumb trail from the locale's docs home to the page, matching the page tree. */
export function breadcrumbTrail(page: DocsPage): { name: string; url: string }[] {
  const locale = localeOf(page);
  const home = { name: COPY[locale].breadcrumbHome, url: `/${locale}` };
  if (page.url === home.url) return [home];

  const items = getBreadcrumbItems(page.url, source.getPageTree(locale), { includePage: false })
    .filter((item): item is { name: string; url: string } => typeof item.name === "string" && Boolean(item.url));
  return [home, ...items, { name: page.data.title, url: page.url }];
}

export function breadcrumbList(page: DocsPage): JsonLdNode {
  return {
    "@type": "BreadcrumbList",
    itemListElement: breadcrumbTrail(page).map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: absoluteUrl(item.url),
    })),
  };
}

export function techArticle(page: DocsPage): JsonLdNode {
  const publisher = { "@type": "Organization", "@id": `${HOME_URL}/#organization`, name: BRAND_NAME, url: HOME_URL };
  return {
    "@type": "TechArticle",
    headline: page.data.title,
    description: page.data.description,
    inLanguage: LANGUAGE_TAG[localeOf(page)],
    datePublished: page.data.lastUpdated,
    dateModified: page.data.lastUpdated,
    url: absoluteUrl(page.url),
    mainEntityOfPage: absoluteUrl(page.url),
    image: absoluteUrl(ogImagePath(page)),
    author: publisher,
    publisher,
  };
}

/** Everything one page emits, as a single @graph. */
export function pageGraph(page: DocsPage): JsonLdNode {
  const graph: JsonLdNode[] = [techArticle(page), breadcrumbList(page)];
  if (page.data.translationKey === ORGANIZATION_PAGE_KEY) graph.push(organization());
  return { "@context": "https://schema.org", "@graph": graph };
}
