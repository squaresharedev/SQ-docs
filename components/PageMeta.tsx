import { Clock, FileCode2 } from "lucide-react";
import { formatDate, type Copy } from "@/lib/copy";
import type { Locale } from "@/lib/i18n";
import { CopyMarkdownButton } from "./CopyMarkdownButton";
import { DocsLink } from "./DocsLink";

/** The dashboard's secondary button (control-styles secondaryButtonClass), at bar size. */
export const SECONDARY_BUTTON_CLASS =
  "inline-flex h-8 items-center gap-1.5 border border-fd-border bg-fd-background px-3 text-sm font-medium text-fd-foreground transition-colors hover:bg-fd-accent";

/** "Last updated", then "View as Markdown" (the editor view) and "Copy page as Markdown". */
export function PageMeta({
  lastUpdated,
  markdownUrl,
  markdownViewUrl,
  locale,
  copy,
}: {
  lastUpdated: string;
  /** The raw `.md` file, what the copy button copies. */
  markdownUrl: string;
  /** The page's Markdown shown in an editor. */
  markdownViewUrl: string;
  locale: Locale;
  copy: Copy;
}) {
  return (
    <div className="not-prose mt-5 flex flex-wrap items-center gap-x-4 gap-y-3 text-sm">
      <p className="m-0 inline-flex items-center gap-1.5 font-inter text-fd-muted-foreground">
        <Clock className="size-3.5" aria-hidden="true" />
        {copy.lastUpdated}: <time dateTime={lastUpdated}>{formatDate(lastUpdated, locale)}</time>
      </p>
      <div className="flex flex-wrap items-center gap-2 sm:ms-auto">
        <DocsLink href={markdownViewUrl} className={SECONDARY_BUTTON_CLASS}>
          <FileCode2 className="size-4" aria-hidden="true" />
          {copy.viewMarkdown}
        </DocsLink>
        <CopyMarkdownButton markdownUrl={markdownUrl} copy={copy} className={SECONDARY_BUTTON_CLASS} />
      </div>
    </div>
  );
}
