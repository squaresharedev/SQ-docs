/**
 * Copy for the search UI.
 * EN is the primary copy; CS entries are natural Czech.
 * Two plain objects so TypeScript can verify both locales cover every key.
 */
import type { Locale } from "@/lib/i18n";

export type SearchCopy = {
  /** Button label, also the input aria-label. */
  triggerLabel: string;
  /** aria-label for the search dialog element. */
  overlayLabel: string;
  /** Input placeholder. */
  placeholder: string;
  /** aria-label for the listbox. */
  results: string;
  /** Clear-input button label when the field has text. */
  clear: string;
  /** Clear-input button label when the field is empty (close action). */
  close: string;
  /** Shown when a non-empty query returns no results. Contains {query}. */
  nothingMatches: string;
  /** Shown when the query is empty. */
  startTyping: string;
  /** Announced via aria-live while the index is loading or a search is pending. */
  searching: string;
  /**
   * Announced via aria-live when results arrive, one form per plural category
   * of the locale (Intl.PluralRules). Contains {count} and {query}.
   */
  resultCount: Partial<Record<Intl.LDMLPluralRule, string>> & { other: string };
};

const en: SearchCopy = {
  triggerLabel: "Search docs",
  overlayLabel: "Search documentation",
  placeholder: "Search documentation...",
  results: "Search results",
  clear: "Clear",
  close: "Close",
  nothingMatches: 'No results for "{query}"',
  startTyping: "Type to search...",
  searching: "Searching...",
  resultCount: {
    one: '{count} result for "{query}"',
    other: '{count} results for "{query}"',
  },
};

const cs: SearchCopy = {
  triggerLabel: "Hledat v dokumentaci",
  overlayLabel: "Hledat v dokumentaci",
  placeholder: "Hledejte v dokumentaci...",
  results: "Výsledky vyhledávání",
  clear: "Smazat",
  close: "Zavřít",
  nothingMatches: 'Žádné výsledky pro "{query}"',
  startTyping: "Začněte psát...",
  searching: "Hledám...",
  resultCount: {
    one: '{count} výsledek pro "{query}"',
    few: '{count} výsledky pro "{query}"',
    other: '{count} výsledků pro "{query}"',
  },
};

export const searchCopy: Record<Locale, SearchCopy> = { en, cs };

const PLURALS: Record<Locale, Intl.PluralRules> = {
  en: new Intl.PluralRules("en"),
  cs: new Intl.PluralRules("cs"),
};

/** "3 results for "storefront"", in the locale's plural form for the count. */
export function resultCount(locale: Locale, count: number, query: string): string {
  const forms = searchCopy[locale].resultCount;
  return interpolate(forms[PLURALS[locale].select(count)] ?? forms.other, { count, query });
}

/** Substitute one or more {key} placeholders in a copy string. */
export function interpolate(
  template: string,
  params: Record<string, string | number>,
): string {
  let out = template;
  for (const [k, v] of Object.entries(params)) {
    out = out.replace(`{${k}}`, String(v));
  }
  return out;
}
