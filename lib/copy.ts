import type { Locale } from "./i18n.ts";

/**
 * Every UI string the docs chrome shows, per locale. Fumadocs' own UI strings
 * (search, table of contents, pagination) are in lib/ui-translations.ts.
 * TODO(adrian): native review of the Czech strings.
 */
export const COPY = {
  en: {
    siteName: "Square Share Docs",
    titleSuffix: "Square Share Docs",
    docsLabel: "Docs",
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
    shortAnswer: "Short answer",
    markdownLead: "This is the page as AI tools read it: plain Markdown, the same text the .md file serves.",
    backToPage: "Back to the page",
    openRaw: "Open the raw .md",
    explorer: "Explorer",
    aiReadable: "AI-readable",
    lines: "lines",
    heroPrimary: "Add a storefront",
    heroSecondary: "What is Square Share?",
    footerTagline: "Add a storefront or a purchase button to the website you already have.",
    footerDocs: "Docs",
    footerProduct: "Square Share",
    footerDashboard: "Dashboard",
    footerGlossary: "Glossary",
    footerContact: "Contact",
    footerOperator: "Square Share is run by Root Labs in Brno, Czech Republic.",
  },
  cs: {
    siteName: "Square Share dokumentace",
    titleSuffix: "Square Share dokumentace",
    docsLabel: "Dokumentace",
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
    shortAnswer: "Stručně",
    markdownLead: "Takhle stránku čtou AI nástroje: čistý Markdown, stejný text, jaký vrací soubor .md.",
    backToPage: "Zpět na stránku",
    openRaw: "Otevřít surový .md",
    explorer: "Průzkumník",
    aiReadable: "Čitelné pro AI",
    lines: "řádků",
    heroPrimary: "Přidat výlohu",
    heroSecondary: "Co je Square Share?",
    footerTagline: "Přidejte výlohu nebo tlačítko pro nákup na web, který už máte.",
    footerDocs: "Dokumentace",
    footerProduct: "Square Share",
    footerDashboard: "Panel",
    footerGlossary: "Slovník pojmů",
    footerContact: "Kontakt",
    footerOperator: "Square Share provozuje Root Labs z Brna.",
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
