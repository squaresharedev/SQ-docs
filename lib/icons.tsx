import { createElement } from "react";
import {
  BookOpen,
  Bot,
  CircleHelp,
  CreditCard,
  House,
  LifeBuoy,
  MousePointerClick,
  Store,
  type LucideIcon,
} from "lucide-react";
import type { LoaderPlugin } from "fumadocs-core/source";

/**
 * One lucide icon per page, keyed by translationKey so both languages share
 * it. Used by the sidebar (like the dashboard's nav items) and the section
 * cards on the docs home.
 */
export const PAGE_ICONS: Record<string, LucideIcon> = {
  "docs-home": House,
  "what-is-square-share": CircleHelp,
  "add-storefront": Store,
  "add-purchase-button": MousePointerClick,
  "install-with-ai": Bot,
  "payments-and-payouts": CreditCard,
  troubleshooting: LifeBuoy,
  glossary: BookOpen,
};

function iconFor(data: unknown) {
  const key = (data as { translationKey?: unknown } | undefined)?.translationKey;
  const Icon = typeof key === "string" ? PAGE_ICONS[key] : undefined;
  return Icon ? createElement(Icon, { "aria-hidden": true }) : undefined;
}

/** Puts each page's icon on its sidebar item, and on a folder whose link is its index page. */
export function pageIconsPlugin(): LoaderPlugin {
  return {
    name: "square-share:page-icons",
    transformPageTree: {
      file(node, filePath) {
        const file = filePath ? this.storage.read(filePath) : undefined;
        const icon = file?.format === "page" ? iconFor(file.data) : undefined;
        return icon ? { ...node, icon } : node;
      },
      folder(node) {
        return node.index?.icon ? { ...node, icon: node.index.icon } : node;
      },
    },
  };
}
