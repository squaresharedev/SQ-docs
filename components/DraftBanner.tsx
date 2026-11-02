import type { Copy } from "@/lib/copy";

/** Shown on every page whose frontmatter says `draft: true`. */
export function DraftBanner({ copy }: { copy: Copy }) {
  return (
    <div role="note" data-draft-banner="" className="mb-6 flex items-start gap-3 border border-fd-border bg-fd-secondary px-4 py-3 text-sm text-fd-secondary-foreground">
      <span className="shrink-0 bg-fd-primary px-1.5 py-0.5 font-inter text-xs font-medium uppercase tracking-wide text-fd-primary-foreground">
        {copy.draftTitle}
      </span>
      <p className="m-0">{copy.draftBody}</p>
    </div>
  );
}
