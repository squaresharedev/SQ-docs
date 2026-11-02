import type { ReactNode } from "react";
import type { VisualCopy } from "@/lib/copy";
import { LogoMark } from "@/components/Logo";

/** Money goes from the buyer straight to the seller; Square Share stands aside. */
export function PaymentVisual({ copy }: { copy: VisualCopy }) {
  return (
    <div className="w-full border border-fd-border bg-fd-card p-4 shadow-lg sm:p-6">
      <div className="flex items-center gap-3">
        <Node label={copy.buyer}>
          <svg viewBox="0 0 24 24" className="size-6" fill="none" stroke="currentColor" strokeWidth="1.8">
            <circle cx="12" cy="8" r="4" />
            <path d="M4 21c1.5-4 4.5-6 8-6s6.5 2 8 6" />
          </svg>
        </Node>
        <div className="flex min-w-0 flex-1 flex-col items-center gap-1">
          <span className="font-mono text-[10px] uppercase tracking-widest text-fd-muted-foreground">{copy.paysYou}</span>
          <span className="relative block h-0.5 w-full bg-acid">
            <span className="absolute -right-0.5 top-1/2 size-2 -translate-y-1/2 rotate-45 border-t-2 border-r-2 border-acid" />
          </span>
        </div>
        <Node label={copy.seller}>
          <svg viewBox="0 0 24 24" className="size-6" fill="none" stroke="currentColor" strokeWidth="1.8">
            <path d="M3 9l2-5h14l2 5M4 9v11h16V9M3 9h18M9 20v-6h6v6" />
          </svg>
        </Node>
      </div>
      <div className="mt-5 flex items-center justify-center gap-2 border border-dashed border-fd-border px-3 py-2 font-inter text-[11px] text-fd-muted-foreground">
        <LogoMark className="size-3 shrink-0 text-fd-foreground" />
        <span>{copy.noHold}</span>
      </div>
    </div>
  );
}

function Node({ label, children }: { label: string; children: ReactNode }) {
  return (
    <span className="flex shrink-0 flex-col items-center gap-1.5">
      <span className="flex size-12 items-center justify-center bg-fd-foreground text-fd-background">{children}</span>
      <span className="font-display text-xs font-bold text-fd-foreground">{label}</span>
    </span>
  );
}
