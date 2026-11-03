import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ArrowLeft, FileDown } from "lucide-react";
import { DocsPage } from "fumadocs-ui/layouts/notebook/page";
import { CopyMarkdownButton } from "@/components/CopyMarkdownButton";
import { DocsLink } from "@/components/DocsLink";
import { MarkdownIde } from "@/components/ide/MarkdownIde";
import { SECONDARY_BUTTON_CLASS } from "@/components/PageMeta";
import { COPY } from "@/lib/copy";
import { localeOf } from "@/lib/pairing";
import { ideFiles, markdownFileName, WORKSPACE } from "@/lib/ide";
import { pageMarkdown } from "@/lib/llms";
import { absoluteUrl } from "@/lib/site";
import { source } from "@/lib/source";
import { markdownPath, markdownViewPath } from "@/lib/urls";

/**
 * Every page's Markdown, shown as a file open in a code editor. A view for
 * people; machines read the raw `.md` (linked here and from every page's head).
 */
export const dynamicParams = false;

export function generateStaticParams() {
  return source.generateParams("slug", "lang");
}

async function findPage(props: PageProps<"/[lang]/markdown/[[...slug]]">) {
  const { lang, slug } = await props.params;
  const page = source.getPage(slug, lang);
  if (!page) notFound();
  return page;
}

export async function generateMetadata(props: PageProps<"/[lang]/markdown/[[...slug]]">): Promise<Metadata> {
  const page = await findPage(props);
  const copy = COPY[localeOf(page)];
  return {
    title: { absolute: `${markdownFileName(page)} | ${copy.titleSuffix}` },
    description: page.data.description,
    robots: { index: false },
    alternates: {
      canonical: absoluteUrl(page.url),
      types: { "text/markdown": absoluteUrl(markdownPath(page)) },
    },
  };
}

export default async function MarkdownView(props: PageProps<"/[lang]/markdown/[[...slug]]">) {
  const page = await findPage(props);
  const locale = localeOf(page);
  const copy = COPY[locale];

  return (
    <DocsPage full breadcrumb={{ enabled: false }} footer={{ enabled: false }} tableOfContent={{ enabled: false }}>
      <div className="not-prose mb-6 flex flex-wrap items-end gap-4">
        <div className="min-w-0 flex-1">
          <h1 className="docs-title m-0 text-fd-foreground">{page.data.title}</h1>
          <p className="mt-2 mb-0 max-w-2xl text-fd-muted-foreground">{copy.markdownLead}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <DocsLink href={page.url} className={SECONDARY_BUTTON_CLASS}>
            <ArrowLeft className="size-4" aria-hidden="true" />
            {copy.backToPage}
          </DocsLink>
          <a href={markdownPath(page)} type="text/markdown" className={SECONDARY_BUTTON_CLASS}>
            <FileDown className="size-4" aria-hidden="true" />
            {copy.openRaw}
          </a>
          <CopyMarkdownButton markdownUrl={markdownPath(page)} copy={copy} className={SECONDARY_BUTTON_CLASS} />
        </div>
      </div>
      <MarkdownIde
        fileName={markdownFileName(page)}
        markdown={await pageMarkdown(page)}
        workspace={WORKSPACE}
        files={ideFiles(locale)}
        activeHref={markdownViewPath(page)}
        labels={{ explorer: copy.explorer, lines: copy.lines, aiReadable: copy.aiReadable }}
      />
    </DocsPage>
  );
}
