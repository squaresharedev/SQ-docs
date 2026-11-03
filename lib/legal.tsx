import { Accessibility, Cookie, Scale, Shield } from "lucide-react";
import type { Item, Root, Separator } from "fumadocs-core/page-tree";
import type { Locale } from "./i18n.ts";
import { HOME_URL } from "./site.ts";

/**
 * squareshare.eu's legal pages, in the homepage footer's order. The footer and
 * the bottom of the sidebar both list them, so they cannot drift apart.
 */
export const LEGAL_LINKS = [
  { key: "privacy", href: `${HOME_URL}/legal/privacy-policy/`, Icon: Shield, label: { en: "Privacy policy", cs: "Ochrana osobních údajů" } },
  { key: "cookies", href: `${HOME_URL}/legal/cookie-policy/`, Icon: Cookie, label: { en: "Cookie policy", cs: "Zásady cookies" } },
  { key: "terms", href: `${HOME_URL}/terms`, Icon: Scale, label: { en: "Terms of service", cs: "Obchodní podmínky" } },
  { key: "accessibility", href: `${HOME_URL}/accessibility`, Icon: Accessibility, label: { en: "Accessibility", cs: "Přístupnost" } },
] as const;

export const LEGAL_HEADING: Record<Locale, string> = { en: "Legal", cs: "Právní informace" };

/**
 * The sidebar's page tree with the legal pages added as its last group. They
 * are external items, so Fumadocs leaves them out of the previous and next
 * page links. styles/visuals.css pushes the group to the bottom of the sidebar
 * when there is room; when there is not, it scrolls with the list.
 */
export function withLegalPages(tree: Root, locale: Locale): Root {
  const separator: Separator = { type: "separator", name: LEGAL_HEADING[locale] };
  const items: Item[] = LEGAL_LINKS.map(({ href, Icon, label }) => ({
    type: "page",
    name: label[locale],
    url: href,
    external: true,
    icon: <Icon />,
  }));
  return { ...tree, children: [...tree.children, separator, ...items] };
}
