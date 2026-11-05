import { createElement } from "react";
import {
  AppWindow,
  Bell,
  BookOpen,
  Bot,
  ChartColumn,
  CircleAlert,
  CircleHelp,
  CreditCard,
  Download,
  EyeOff,
  Factory,
  FileSpreadsheet,
  FileWarning,
  Frame,
  Globe,
  House,
  IdCard,
  Landmark,
  LayoutGrid,
  LifeBuoy,
  ListChecks,
  MousePointerClick,
  Package,
  PackagePlus,
  PanelsTopLeft,
  Plug,
  ShieldCheck,
  ShoppingBag,
  Store,
  Tag,
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
  "eu-seller-information": Landmark,
  "add-storefront": Store,
  "add-purchase-button": MousePointerClick,
  "install-with-ai": Bot,
  "allowed-domains": Globe,
  "site-builders": AppWindow,
  // One icon for every builder guide: the builders are told apart by name.
  "builder-wordpress": PanelsTopLeft,
  "builder-squarespace": PanelsTopLeft,
  "builder-wix": PanelsTopLeft,
  "builder-webflow": PanelsTopLeft,
  "builder-framer": PanelsTopLeft,
  "builder-carrd": PanelsTopLeft,
  "builder-webnode": PanelsTopLeft,
  "add-a-product": PackagePlus,
  "design-your-storefront": LayoutGrid,
  "shipping-and-returns": Truck,
  "product-safety-information": Factory,
  "sell-without-online-shop": ShoppingBag,
  "sell-digital-downloads": Download,
  "sell-from-portfolio": Frame,
  orders: Package,
  discounts: Tag,
  analytics: ChartColumn,
  "connect-ai-assistant": Plug,
  "two-factor-authentication": ShieldCheck,
  notifications: Bell,
  "payments-and-payouts": CreditCard,
  troubleshooting: LifeBuoy,
  "storefront-not-showing": EyeOff,
  "product-page-not-live": FileWarning,
  "csv-import-problems": FileSpreadsheet,
  "dashboard-error-messages": CircleAlert,
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
