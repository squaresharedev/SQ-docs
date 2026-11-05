import { Clock, FileCode2 } from "lucide-react";
import { transitionClass } from "@squaresharedev/tokens";
import { cn } from "@/lib/cn";
import { formatDate, type Copy } from "@/lib/copy";
import type { Locale } from "@/lib/i18n";
import { CopyMarkdownButton } from "./CopyMarkdownButton";

/** The dashboard's secondary button (control-styles secondaryButtonClass), at bar size, with its transition. */
export const SECONDARY_BUTTON_CLASS = cn(
  "inline-flex h-8 items-center gap-1.5 border border-fd-border bg-fd-background px-3 text-sm font-medium text-fd-foreground hover:bg-fd-accent",
  transitionClass,
);

/** "Last updated", then "View as Markdown" (the raw `.md` file) and "Copy page as Markdown". */
export function PageMeta({
  lastUpdated,
  markdownUrl,
  locale,
  copy,
}: {
  lastUpdated: string;
  /** The raw `.md` file: what the link opens and the copy button copies. */
  markdownUrl: string;
  locale: Locale;
  copy: Copy;
}) {
  return (
    <div className="not-prose mt-5 flex flex-wrap items-center gap-x-4 gap-y-3 text-sm">
      <p className="m-0 inline-flex items-center gap-1.5 font-inter text-fd-muted-foreground">
        <Clock className="size-3.5" aria-hidden="true" />
        {copy.lastUpdated}: <time dateTime={lastUpdated}>{formatDate(lastUpdated, locale)}</time>
      </p>
      <div className="flex flex-wrap items-center gap-2">
        {/* A plain link: the browser shows the file as text, no page around it. */}
        <a href={markdownUrl} type="text/markdown" className={SECONDARY_BUTTON_CLASS}>
          <FileCode2 className="size-4" aria-hidden="true" />
          {copy.viewMarkdown}
        </a>
        <CopyMarkdownButton markdownUrl={markdownUrl} copy={copy} className={SECONDARY_BUTTON_CLASS} />
      </div>
    </div>
  );
}
