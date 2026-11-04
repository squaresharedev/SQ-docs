import type { ComponentType } from "react";
import { CodeReels } from "@/components/corner-art/CodeReels";
import { PrintingReceipt } from "@/components/corner-art/PrintingReceipt";
import { TransitFlow } from "@/components/corner-art/TransitFlow";

/**
 * Which of the dashboard's settings-card motion graphics sits in a page's
 * header corner, by translationKey (both languages share it). Only where the
 * picture means what the page is about, and on the page about the same thing
 * the dashboard shows it for: the receipt is its billing picture, the route
 * its Shipping card's, the code reels its two-factor card's. The others
 * (notification bell, team, signature) fit no docs page, so most pages have none.
 */
export const CORNER_ART: Partial<Record<string, ComponentType<{ className?: string }>>> = {
  "payments-and-payouts": PrintingReceipt,
  "shipping-and-returns": TransitFlow,
  "two-factor-authentication": CodeReels,
};
