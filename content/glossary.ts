/**
 * The single source of truth for Square Share terminology.
 *
 * - The Glossary pages render every entry (EN and CS).
 * - "Key terms" sections render a chosen subset by key.
 * - scripts/content-lint.ts fails the build on any `deprecated` synonym found
 *   in content, UI strings or metadata.
 *
 * Czech terms and definitions are drafts. TODO(adrian): native review.
 */

export interface GlossaryText {
  term: string;
  definition: string;
}

export interface GlossaryEntry {
  key: string;
  en: GlossaryText;
  cs: GlossaryText;
  /** Words that must not be used for this term. Matched case-insensitively. */
  deprecated: { en: readonly string[]; cs: readonly string[] };
}

export const GLOSSARY = [
  {
    key: "storefront",
    en: {
      term: "Storefront",
      definition: "A grid of your products that you design in the dashboard and show on your own website.",
    },
    cs: {
      term: "Výloha",
      definition: "Mřížka vašich produktů, kterou navrhnete v panelu a zobrazíte na vlastním webu.",
    },
    deprecated: { en: [], cs: [] },
  },
  {
    key: "embed",
    en: {
      term: "Embed",
      definition: "The snippet of code that shows your storefront inside a page of your own website.",
    },
    cs: {
      term: "Vložený kód",
      definition: "Krátký kód, který zobrazí vaši výlohu přímo na stránce vašeho webu.",
    },
    deprecated: { en: [], cs: [] },
  },
  {
    key: "purchase-button",
    en: {
      term: "Purchase button",
      definition: "A link on a button of your own website that opens one product's page, where the buyer checks out.",
    },
    cs: {
      term: "Tlačítko pro nákup",
      definition: "Odkaz na tlačítku vašeho webu, který otevře stránku jednoho produktu. Tam zákazník dokončí nákup.",
    },
    deprecated: { en: ["buy button", "buy-button"], cs: ["tlačítko koupit"] },
  },
  {
    key: "dashboard",
    en: {
      term: "Dashboard",
      definition: "The Square Share web app at dashboard.squareshare.eu where you add products, design storefronts and copy your code.",
    },
    cs: {
      term: "Panel",
      definition: "Webová aplikace Square Share na dashboard.squareshare.eu. Přidáváte v ní produkty, navrhujete výlohy a kopírujete kód.",
    },
    deprecated: { en: ["admin panel"], cs: [] },
  },
  {
    key: "product",
    en: {
      term: "Product",
      definition: "Something you sell. It needs at least a title and a price, and it is either Active or a Draft.",
    },
    cs: {
      term: "Produkt",
      definition: "Něco, co prodáváte. Potřebuje aspoň název a cenu a je buď aktivní, nebo koncept.",
    },
    deprecated: { en: [], cs: [] },
  },
  {
    key: "product-page",
    en: {
      term: "Product page",
      definition: "The page Square Share hosts for each product. Storefront tiles and purchase buttons open it.",
    },
    cs: {
      term: "Stránka produktu",
      definition: "Stránka, kterou Square Share hostuje pro každý produkt. Otevírají ji dlaždice výlohy i tlačítka pro nákup.",
    },
    deprecated: { en: [], cs: [] },
  },
  {
    key: "collection",
    // TODO(adrian): confirm this definition. The dashboard has no collections
    // today; the shared schemas package defines Collection for the future app.
    en: {
      term: "Collection",
      definition: "A group of items on a hosted Square Share page. Collections will come with hosted storefronts.",
    },
    cs: {
      term: "Kolekce",
      definition: "Skupina položek na stránce hostované Square Share. Kolekce přibudou s hostovanými výlohami.",
    },
    deprecated: { en: [], cs: [] },
  },
  {
    key: "allowed-domains",
    en: {
      term: "Allowed domains",
      definition: "The websites a storefront may show on. A storefront embedded anywhere else stays blank.",
    },
    cs: {
      term: "Povolené domény",
      definition: "Weby, na kterých se výloha smí zobrazit. Jinde zůstane vložená výloha prázdná.",
    },
    deprecated: { en: [], cs: [] },
  },
  {
    key: "seller-details",
    en: {
      term: "Seller details",
      definition: "Your name, address and contact email as a seller. Nothing publishes or sells until they are complete.",
    },
    cs: {
      term: "Údaje o prodejci",
      definition: "Vaše jméno, adresa a kontaktní e-mail jako prodejce. Dokud nejsou úplné, nic se nezveřejní ani neprodá.",
    },
    deprecated: { en: [], cs: [] },
  },
  {
    key: "grid-mode",
    en: {
      term: "Grid mode",
      definition: "The storefront editor mode where every block sits on the cells of a grid.",
    },
    cs: {
      term: "Režim mřížky",
      definition: "Režim editoru výlohy, ve kterém každý blok leží na buňkách mřížky.",
    },
    deprecated: { en: [], cs: [] },
  },
  {
    key: "merchant-of-record",
    en: {
      term: "Merchant of record",
      definition: "The business legally responsible for a sale. On Square Share that is you, the seller.",
    },
    cs: {
      term: "Prodávající",
      definition: "Ten, kdo za prodej právně odpovídá. Na Square Share jste to vy, prodejce.",
    },
    deprecated: { en: [], cs: [] },
  },
  {
    key: "payout",
    en: {
      term: "Payout",
      definition: "Money from your sales that reaches your bank account through your own Stripe account.",
    },
    cs: {
      term: "Výplata",
      definition: "Peníze z vašich prodejů, které dorazí na váš bankovní účet přes váš vlastní účet Stripe.",
    },
    deprecated: { en: [], cs: [] },
  },
] as const satisfies readonly GlossaryEntry[];

export type GlossaryKey = (typeof GLOSSARY)[number]["key"];

export function glossaryEntry(key: string): GlossaryEntry | undefined {
  return GLOSSARY.find((entry) => entry.key === key);
}
