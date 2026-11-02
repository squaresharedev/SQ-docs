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
    shortAnswer: "Short answer",
    heroPrimary: "Add a storefront",
    heroSecondary: "What is Square Share?",
    footerTagline: "Add a storefront or a purchase button to the website you already have.",
    footerDocs: "Docs",
    footerProduct: "Square Share",
    footerDashboard: "Dashboard",
    footerGlossary: "Glossary",
    footerContact: "Contact",
    footerOperator: "Square Share is run by Root Labs in Brno, Czech Republic.",
    later: "Later",
  },
  cs: {
    siteName: "Square Share dokumentace",
    titleSuffix: "Square Share dokumentace",
    docsLabel: "Dokumentace",
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
    shortAnswer: "Stručně",
    heroPrimary: "Přidat výlohu",
    heroSecondary: "Co je Square Share?",
    footerTagline: "Přidejte výlohu nebo tlačítko pro nákup na web, který už máte.",
    footerDocs: "Dokumentace",
    footerProduct: "Square Share",
    footerDashboard: "Panel",
    footerGlossary: "Slovník pojmů",
    footerContact: "Kontakt",
    footerOperator: "Square Share provozuje Root Labs z Brna.",
    later: "Později",
  },
} as const satisfies Record<Locale, Record<string, string>>;

export type Copy = (typeof COPY)[Locale];

/** Words drawn inside the illustrations. Decorative, but in the page's language. */
export const VISUAL_COPY = {
  en: {
    domain: "yourdomain.com",
    store: "Paksi",
    nav: ["Shop", "About", "Journal"],
    customer: "customer",
    buyNow: "Buy now",
    pay: "Pay",
    yourSite: "Your site",
    productPage: "Product page",
    checkout: "Checkout",
    product: "Field camera",
    agent: "AI coding tool",
    prompt: "Add a Square Share storefront to this site.",
    agentReply: "Added the snippet to index.html.",
    buyer: "Buyer",
    seller: "You",
    paysYou: "pays you directly",
    noHold: "Square Share never holds the money",
    spacing: "Spacing",
    corners: "Corners",
    rotation: "Rotation",
  },
  cs: {
    domain: "vasweb.cz",
    store: "Paksi",
    nav: ["Obchod", "O nás", "Blog"],
    customer: "zákazník",
    buyNow: "Koupit",
    pay: "Zaplatit",
    yourSite: "Váš web",
    productPage: "Stránka produktu",
    checkout: "Pokladna",
    product: "Fotoaparát",
    agent: "AI nástroj",
    prompt: "Přidej na můj web výlohu Square Share.",
    agentReply: "Kód je vložený do index.html.",
    buyer: "Zákazník",
    seller: "Vy",
    paysYou: "platí přímo vám",
    noHold: "Square Share peníze nedrží",
    spacing: "Mezery",
    corners: "Rohy",
    rotation: "Otočení",
  },
} as const;

export type VisualCopy = (typeof VISUAL_COPY)[Locale];

const DATE_FORMAT: Record<Locale, Intl.DateTimeFormat> = {
  en: new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" }),
  cs: new Intl.DateTimeFormat("cs-CZ", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" }),
};

export function formatDate(isoDate: string, locale: Locale): string {
  return DATE_FORMAT[locale].format(new Date(`${isoDate}T00:00:00Z`));
}
