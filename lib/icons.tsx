import { createElement } from "react";
import {
  BookOpen,
  Bot,
  CircleHelp,
  CreditCard,
  EyeOff,
  FileWarning,
  Globe,
  House,
  IdCard,
  LayoutGrid,
  LifeBuoy,
  ListChecks,
  MousePointerClick,
  PackagePlus,
  Plug,
  ShieldCheck,
  Store,
  Truck,
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
  "set-up-square-share": ListChecks,
  "seller-details": IdCard,
  "add-storefront": Store,
  "add-purchase-button": MousePointerClick,
  "install-with-ai": Bot,
  "allowed-domains": Globe,
  "add-a-product": PackagePlus,
  "design-your-storefront": LayoutGrid,
  "shipping-and-returns": Truck,
  "connect-ai-assistant": Plug,
  "two-factor-authentication": ShieldCheck,
  "payments-and-payouts": CreditCard,
  troubleshooting: LifeBuoy,
  "storefront-not-showing": EyeOff,
  "product-page-not-live": FileWarning,
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
