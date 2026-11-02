import type { Locale } from "./i18n.ts";

/**
 * Every UI string the docs chrome shows, per locale. Fumadocs' own UI strings
 * (search, table of contents, pagination) are in lib/ui-translations.ts.
 */
export const COPY = {
  en: {
    siteName: "Square Share Docs",
    titleSuffix: "Square Share Docs",
    docsLabel: "Docs",
    homeLinkLabel: "Square Share Docs home",
    mainSiteLink: "squareshare.eu",
    getStarted: "Get started",
    languageNav: "Language",
    lastUpdated: "Last updated",
    viewMarkdown: "View as Markdown",
    copyMarkdown: "Copy page as Markdown",
    copiedMarkdown: "Copied",
    copyFailed: "Copy failed",
    draftTitle: "Draft",
    draftBody: "This page is a draft. Search engines and AI crawlers are told not to index it.",
    notFoundTitle: "Page not found",
    notFoundBody: "There is no page at this address. It may have moved.",
    notFoundHome: "Go to the docs home",
    breadcrumbHome: "Docs",
  },
  cs: {
    siteName: "Square Share dokumentace",
    titleSuffix: "Square Share dokumentace",
    docsLabel: "Dokumentace",
    homeLinkLabel: "Domů, dokumentace Square Share",
    mainSiteLink: "squareshare.eu",
    getStarted: "Začít",
    languageNav: "Jazyk",
    lastUpdated: "Naposledy upraveno",
    viewMarkdown: "Zobrazit jako Markdown",
    copyMarkdown: "Kopírovat stránku jako Markdown",
    copiedMarkdown: "Zkopírováno",
    copyFailed: "Kopírování se nezdařilo",
    draftTitle: "Koncept",
    draftBody: "Tato stránka je koncept. Vyhledávače a AI roboti ji nemají indexovat.",
    notFoundTitle: "Stránka nenalezena",
    notFoundBody: "Na této adrese žádná stránka není. Možná se přesunula.",
    notFoundHome: "Přejít na úvod dokumentace",
    breadcrumbHome: "Dokumentace",
  },
} as const satisfies Record<Locale, Record<string, string>>;

export type Copy = (typeof COPY)[Locale];

const DATE_FORMAT: Record<Locale, Intl.DateTimeFormat> = {
  en: new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" }),
  cs: new Intl.DateTimeFormat("cs-CZ", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" }),
};

export function formatDate(isoDate: string, locale: Locale): string {
  return DATE_FORMAT[locale].format(new Date(`${isoDate}T00:00:00Z`));
}
