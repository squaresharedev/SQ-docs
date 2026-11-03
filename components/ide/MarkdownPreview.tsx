import { COPY } from "@/lib/copy";
import type { Locale } from "@/lib/i18n";
import { markdownFileName, WORKSPACE } from "@/lib/ide";
import { pageMarkdown } from "@/lib/llms";
import { pagesOf } from "@/lib/pairing";
import { MarkdownIde } from "./MarkdownIde";

/**
 * Another page's Markdown in the compact editor view, inside an article: what
 * an AI tool reads when it opens that page's `.md`. Left out of the Markdown
 * version (lib/source.ts), which links the `.md` itself.
 */
export async function MarkdownPreview({ locale, translationKey }: { locale: Locale; translationKey: string }) {
  const page = pagesOf(locale).find((candidate) => candidate.data.translationKey === translationKey);
  if (!page) throw new Error(`MarkdownPreview: no ${locale} page with translationKey "${translationKey}"`);
  const copy = COPY[locale];
  return (
    <MarkdownIde
      className="my-8"
      compact
      fileName={markdownFileName(page)}
      markdown={await pageMarkdown(page)}
      workspace={WORKSPACE}
      labels={{ explorer: copy.explorer, lines: copy.lines, aiReadable: copy.aiReadable }}
    />
  );
}
