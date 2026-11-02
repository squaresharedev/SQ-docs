import { formatDate, type Copy } from "@/lib/copy";
import type { Locale } from "@/lib/i18n";
import { CopyMarkdownButton } from "./CopyMarkdownButton";

/** "Last updated", "View as Markdown" and "Copy page as Markdown", under the title. */
export function PageMeta({
  lastUpdated,
  markdownUrl,
  locale,
  copy,
}: {
  lastUpdated: string;
  markdownUrl: string;
  locale: Locale;
  copy: Copy;
}) {
  return (
    <div className="not-prose flex flex-wrap items-center gap-x-4 gap-y-2 border-b border-fd-border pb-5 text-sm">
      <p className="m-0 font-inter text-fd-muted-foreground">
        {copy.lastUpdated}: <time dateTime={lastUpdated}>{formatDate(lastUpdated, locale)}</time>
      </p>
      <div className="flex flex-wrap items-center gap-2 sm:ms-auto">
        <a
          href={markdownUrl}
          type="text/markdown"
          className="inline-flex h-8 items-center px-1 text-sm font-medium text-fd-foreground underline underline-offset-4 hover:text-fd-muted-foreground"
        >
          {copy.viewMarkdown}
        </a>
        <CopyMarkdownButton markdownUrl={markdownUrl} copy={copy} />
      </div>
    </div>
  );
}
