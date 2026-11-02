import type { Locale } from "./i18n.ts";

/** Pages the docs chrome links to (hero buttons, footer), per locale. */
export const KEY_PAGES: Record<Locale, { whatIs: string; addStorefront: string; addButton: string; glossary: string }> = {
  en: {
    whatIs: "/en/what-is-square-share",
    addStorefront: "/en/install/add-storefront-to-website",
    addButton: "/en/install/add-purchase-button",
    glossary: "/en/reference/glossary",
  },
  cs: {
    whatIs: "/cs/co-je-square-share",
    addStorefront: "/cs/instalace/pridani-vylohy-na-web",
    addButton: "/cs/instalace/pridani-tlacitka-pro-nakup",
    glossary: "/cs/reference/slovnik",
  },
};
