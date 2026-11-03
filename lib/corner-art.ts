import type { ComponentType } from "react";
import { ArrivingTeam } from "@/components/corner-art/ArrivingTeam";
import { CodeReels } from "@/components/corner-art/CodeReels";
import { PrintingReceipt } from "@/components/corner-art/PrintingReceipt";
import { RingingBell } from "@/components/corner-art/RingingBell";
import { WritingSignature } from "@/components/corner-art/WritingSignature";

/**
 * Which of the dashboard's settings-card motion graphics sits in a page's
 * header corner, by translationKey (both languages share it).
 */
export const CORNER_ART: Record<string, ComponentType<{ className?: string }>> = {
  "what-is-square-share": ArrivingTeam,
  "add-storefront": CodeReels,
  "add-purchase-button": PrintingReceipt,
  "install-with-ai": CodeReels,
  "payments-and-payouts": PrintingReceipt,
  troubleshooting: RingingBell,
  glossary: WritingSignature,
};
