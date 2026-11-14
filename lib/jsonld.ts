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
  SITE_URL,
} from "./site.ts";
import { source, type DocsPage } from "./source.ts";
import { ogImagePath } from "./urls.ts";

/** The FAQ page: its H2s are the questions, the text under each the answer. */
export const FAQ_PAGE_KEY = "faq";

/** The page that also describes the company, so it carries Organization data. */
export const ORGANIZATION_PAGE_KEY = "what-is-square-share";

type JsonLdNode = Record<string, unknown>;

/**
 * Square Share's own profiles, so search engines tie the company to them.
 * TODO(adrian): add the LinkedIn company page URL once it is confirmed.
 */
export const SAME_AS = ["https://www.instagram.com/_squareshare/", "https://github.com/squaresharedev"];

export function organization(): JsonLdNode {
  return {
    "@type": "Organization",
    "@id": `${HOME_URL}/#organization`,
    name: BRAND_NAME,
    alternateName: BRAND_ALTERNATE_NAME,
    url: HOME_URL,
    logo: absoluteUrl(LOGO_PATH),
    email: CONTACT_EMAIL,
    sameAs: SAME_AS,
  };
}

const WEBSITE_ID = `${SITE_URL}/#website`;

/**
 * The docs site itself. Google reads the site name in results from WebSite
 * data on the site's home page (the docs homes; / redirects to /en); every
 * article points back at it with isPartOf.
 */
export function website(): JsonLdNode {
  return {
    "@type": "WebSite",
    "@id": WEBSITE_ID,
    name: COPY.en.siteName,
    alternateName: [COPY.cs.siteName, `${BRAND_NAME} documentation`],
    url: absoluteUrl("/"),
    inLanguage: Object.values(LANGUAGE_TAG),
    publisher: { "@id": `${HOME_URL}/#organization` },
  };
}

/** Docs home, then the page's sections from the page tree (a section has a URL only when it has an index page). */
export function sectionTrail(page: DocsPage): { name: string; url?: string }[] {
  const locale = localeOf(page);
  const home = { name: COPY[locale].breadcrumbHome, url: `/${locale}` };
  if (page.url === home.url) return [home];
  const sections = getBreadcrumbItems(page.url, source.getPageTree(locale), { includePage: false })
    .filter((item) => typeof item.name === "string" && item.url !== page.url)
    .map((item) => ({ name: item.name as string, url: item.url }));
  return [home, ...sections];
}

/**
 * The JSON-LD trail: every item needs a URL, and it ends with the page, named
 * by its short sidebar label (search results print the trail; the question is
 * already the headline).
 */
export function breadcrumbTrail(page: DocsPage): { name: string; url: string }[] {
  if (page.url === `/${localeOf(page)}`) return sectionTrail(page) as { name: string; url: string }[];
  const linked = sectionTrail(page).filter((item): item is { name: string; url: string } => Boolean(item.url));
  return [...linked, { name: page.data.navTitle ?? page.data.title, url: page.url }];
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
    isPartOf: { "@id": WEBSITE_ID },
    author: publisher,
    publisher,
  };
}

type StructuredData = { headings: { id: string; content: string }[]; contents: { heading?: string; content: string }[] };

/**
 * FAQPage data built from the FAQ page's own content, so the questions in the
 * JSON-LD can never drift from the questions on the page: each H2 is a
 * Question, and the paragraphs under it are its Answer.
 */
export function faqPage(page: DocsPage): JsonLdNode | undefined {
  const data = (page.data as { structuredData?: StructuredData }).structuredData;
  if (!data) return undefined;
  const questions = data.headings
    .filter((heading) => heading.content.trim().endsWith("?"))
    .map((heading) => ({
      question: heading.content.trim(),
      answer: data.contents
        .filter((block) => block.heading === heading.id)
        .map((block) => block.content.trim())
        .join(" "),
    }))
    .filter((item) => item.answer !== "");
  if (questions.length === 0) return undefined;
  return {
    "@type": "FAQPage",
    url: absoluteUrl(page.url),
    inLanguage: LANGUAGE_TAG[localeOf(page)],
    mainEntity: questions.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: { "@type": "Answer", text: item.answer },
    })),
  };
}

/** Everything one page emits, as a single @graph. */
export function pageGraph(page: DocsPage): JsonLdNode {
  const graph: JsonLdNode[] = [techArticle(page), breadcrumbList(page)];
  // The docs homes describe the site and the company behind it.
  if (page.slugs.length === 0) graph.push(website(), organization());
  else if (page.data.translationKey === ORGANIZATION_PAGE_KEY) graph.push(organization());
  if (page.data.translationKey === FAQ_PAGE_KEY) {
    const faq = faqPage(page);
    if (faq) graph.push(faq);
  }
  return { "@context": "https://schema.org", "@graph": graph };
}
