import type { ComponentType } from "react";
import { PrintingReceipt } from "@/components/corner-art/PrintingReceipt";

/**
 * Which of the dashboard's settings-card motion graphics sits in a page's
 * header corner, by translationKey (both languages share it). Only where the
 * picture means what the page is about: the receipt is the dashboard's billing
 * picture. The others (two-factor code, notification bell, team, signature)
 * fit no docs page, so most pages have none.
 */
export const CORNER_ART: Partial<Record<string, ComponentType<{ className?: string }>>> = {
  "payments-and-payouts": PrintingReceipt,
};
