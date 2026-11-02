import { defineI18nUI } from "fumadocs-ui/i18n";
import { i18n, LANGUAGE_NAME } from "./i18n.ts";

/**
 * Fumadocs' built-in UI strings. English is Fumadocs' default; Czech is ours.
 * TODO(adrian): native review of the Czech strings.
 */
export const i18nUI = defineI18nUI(i18n, {
  en: {
    displayName: LANGUAGE_NAME.en,
  },
  cs: {
    displayName: LANGUAGE_NAME.cs,
    "Search(search trigger)": "Hledat",
    "Search(search dialog)": "Hledat",
    "Open Search(search trigger)(aria-label)": "Otevřít hledání",
    "Close Search(search dialog)(aria-label)": "Zavřít hledání",
    "No results found(search dialog)": "Nic jsme nenašli",
    "Search failed(search dialog)": "Hledání selhalo",
    "Search failed, showing results for {query}(search dialog)": "Hledání selhalo, zobrazujeme výsledky pro {query}",
    "On this page(table of contents)": "Na této stránce",
    "No Headings(table of contents)": "Žádné nadpisy",
    "Table of Contents(inline table of contents)": "Obsah",
    "Next Page(pagination)": "Další",
    "Previous Page(pagination)": "Předchozí",
    "Last updated on(page footer)": "Naposledy upraveno",
    "Copy Text(code block)(aria-label)": "Kopírovat text",
    "Copied Text(code block)(aria-label)": "Text zkopírován",
    "Copy Anchor Link(heading anchor)(aria-label)": "Kopírovat odkaz na nadpis",
    "Copied Anchor Link(heading anchor)(aria-label)": "Odkaz zkopírován",
    "Copy Markdown(page actions)": "Kopírovat Markdown",
    "Copied Markdown(page actions)": "Markdown zkopírován",
    "View as Markdown(page actions)": "Zobrazit jako Markdown",
    "Open Sidebar(sidebar)(aria-label)": "Otevřít postranní panel",
    "Close Sidebar(sidebar)(aria-label)": "Zavřít postranní panel",
    "Close Sidebar(aria-label)": "Zavřít postranní panel",
    "Collapse Sidebar(sidebar)(aria-label)": "Sbalit postranní panel",
    "Show Sidebar(sidebar)": "Zobrazit postranní panel",
    "Hide Sidebar(sidebar)": "Skrýt postranní panel",
    "Toggle Menu(mobile menu)(aria-label)": "Přepnout nabídku",
    "Toggle Theme(theme switcher)(aria-label)": "Přepnout motiv",
    "Light(theme switcher)(aria-label)": "Světlý",
    "Dark(theme switcher)(aria-label)": "Tmavý",
    "System(theme switcher)(aria-label)": "Podle systému",
    "Choose a language(language switcher)": "Vyberte jazyk",
    "Choose a language(language switcher)(aria-label)": "Vyberte jazyk",
    "Page Not Found(404 page)": "Stránka nenalezena",
    "Back to Home(404 page)": "Zpět na úvod",
  },
});
