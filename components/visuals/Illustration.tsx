import type { ComponentType } from "react";
import { cn } from "@/lib/cn";
import type { VisualCopy } from "@/lib/copy";
import { AiPromptVisual } from "./AiPromptVisual";
import { EditorVisual } from "./EditorVisual";
import { PaymentVisual } from "./PaymentVisual";
import { PurchaseFlowVisual } from "./PurchaseFlowVisual";
import { StorefrontVisual } from "./StorefrontVisual";

export const VISUALS = {
  storefront: StorefrontVisual,
  button: PurchaseFlowVisual,
  ai: AiPromptVisual,
  editor: EditorVisual,
  payment: PaymentVisual,
} satisfies Record<string, ComponentType<{ copy: VisualCopy }>>;

export type VisualKind = keyof typeof VISUALS;

export function isVisualKind(value: string | undefined): value is VisualKind {
  return value !== undefined && value in VISUALS;
}

/**
 * One drawing. It only pictures what the text beside it says, so it is hidden
 * from assistive technology and inert, and the Markdown version leaves it out.
 */
export function Illustration({
  kind,
  copy,
  className,
}: {
  kind: VisualKind;
  copy: VisualCopy;
  className?: string;
}) {
  const Visual = VISUALS[kind];
  return (
    <div aria-hidden="true" inert className={cn("not-prose docs-visual select-none", className)}>
      <Visual copy={copy} />
    </div>
  );
}
