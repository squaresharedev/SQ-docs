import { defineI18n } from "fumadocs-core/i18n";

export const LOCALES = ["en", "cs"] as const;
export type Locale = (typeof LOCALES)[number];
export const DEFAULT_LOCALE: Locale = "en";

/**
 * Locale-prefixed URLs always (`/en/...`, `/cs/...`). Content lives in
 * `content/docs/<locale>/`, and a page missing in one locale never falls back
 * to the other: Czech pages have Czech slugs, so translations are paired by the
 * `translationKey` frontmatter field instead (see lib/pairing.ts).
 */
export const i18n = defineI18n({
  languages: [...LOCALES],
  defaultLanguage: DEFAULT_LOCALE,
  hideLocale: "never",
  parser: "dir",
  fallbackLanguage: null,
});

export function isLocale(value: string): value is Locale {
  return (LOCALES as readonly string[]).includes(value);
}

/** BCP 47 tags for `<html lang>`, hreflang and JSON-LD `inLanguage`. */
export const LANGUAGE_TAG: Record<Locale, string> = { en: "en", cs: "cs" };

/** Open Graph locale codes. */
export const OG_LOCALE: Record<Locale, string> = { en: "en_US", cs: "cs_CZ" };

/** Each language named in itself, for the switcher and the chooser page. */
export const LANGUAGE_NAME: Record<Locale, string> = { en: "English", cs: "Čeština" };
