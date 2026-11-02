import type { VisualCopy } from "@/lib/copy";

const DOTS = [0, 1, 2] as const;

/** An AI coding tool's window: the prompt, the snippet it pastes, its reply. Always dark. */
export function AiPromptVisual({ copy }: { copy: VisualCopy }) {
  return (
    <div className="dark w-full overflow-hidden border border-fd-border bg-fd-background font-mono text-[10px] leading-relaxed text-fd-muted-foreground shadow-lg sm:text-[11px]">
      <div className="flex items-center gap-2 border-b border-fd-border px-3 py-2">
        <span className="flex gap-1">
          {DOTS.map((dot) => (
            <span key={dot} className="size-2 rounded-full bg-fd-secondary" />
          ))}
        </span>
        <span className="font-inter text-[10px] text-fd-muted-foreground">{copy.agent}</span>
      </div>
      <div className="flex flex-col gap-2 p-3 sm:p-4">
        <p className="m-0 text-fd-foreground">
          <span className="text-acid">&gt;</span> {copy.prompt}
        </p>
        <div className="border-s-2 border-fd-border ps-3">
          <p className="m-0">
            <span className="text-fd-foreground">&lt;div</span> data-squareshare-storefront=
            <span className="text-acid">&quot;…&quot;</span>
            <span className="text-fd-foreground">&gt;&lt;/div&gt;</span>
          </p>
          <p className="m-0">
            <span className="text-fd-foreground">&lt;script</span> async src=
            <span className="text-acid">&quot;https://embed.squareshare.eu/widget.js&quot;</span>
            <span className="text-fd-foreground">&gt;&lt;/script&gt;</span>
          </p>
        </div>
        <p className="m-0 text-fd-foreground">
          <span className="text-acid">✓</span> {copy.agentReply}
          <span className="caret ms-1 inline-block h-3 w-1.5 translate-y-0.5 bg-acid" />
        </p>
      </div>
    </div>
  );
}
