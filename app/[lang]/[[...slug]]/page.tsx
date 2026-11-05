import type { ComponentProps } from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { createRelativeLink } from "fumadocs-ui/mdx";
import { DocsBody, DocsPage } from "fumadocs-ui/layouts/notebook/page";
import { TOCProvider } from "fumadocs-ui/layouts/notebook/page/slots/toc";
import { DocsHomeHero } from "@/components/DocsHomeHero";
import { DocsTOC, DocsTOCPopover } from "@/components/TableOfContents";
import { DraftBanner } from "@/components/DraftBanner";
import { JsonLd } from "@/components/JsonLd";
import { getMDXComponents } from "@/components/mdx";
import { PageHeader } from "@/components/PageHeader";
import { PageMeta } from "@/components/PageMeta";
import { COPY } from "@/lib/copy";
import { CORNER_ART } from "@/lib/corner-art";
import { pageGraph, sectionTrail } from "@/lib/jsonld";
import { localeOf } from "@/lib/pairing";
import { pageMetadata } from "@/lib/seo";
import { source, type DocsPage as SourcePage } from "@/lib/source";
import { markdownHref, markdownPath } from "@/lib/urls";

export const dynamicParams = false;

export function generateStaticParams() {
  return source.generateParams("slug", "lang");
}

async function findPage(props: PageProps<"/[lang]/[[...slug]]">) {
  const { lang, slug } = await props.params;
  const page = source.getPage(slug, lang);
  if (!page) notFound();
  return page;
}

/**
 * Links in page content. A link to a `.md` file is a plain link (the browser
 * shows the file, there is no page to route to) that also works under
 * `next dev`; every other link resolves relative paths the Fumadocs way.
 */
function contentLink(page: SourcePage) {
  const RelativeLink = createRelativeLink(source, page);
  return function ContentLink(props: ComponentProps<"a">) {
    if (props.href?.endsWith(".md")) return <a {...props} href={markdownHref(props.href)} type="text/markdown" />;
    return <RelativeLink {...props} />;
  };
}

export default async function Page(props: PageProps<"/[lang]/[[...slug]]">) {
  const page = await findPage(props);
  const locale = localeOf(page);
  const copy = COPY[locale];
  const MDX = page.data.body;
  // A locale's docs home opens with the homepage-style hero instead of the article header.
  const isHome = page.slugs.length === 0;
  const meta = (
    <PageMeta
      lastUpdated={page.data.lastUpdated}
      markdownUrl={markdownHref(markdownPath(page))}
      locale={locale}
      copy={copy}
    />
  );

  return (
    <DocsPage
      toc={page.data.toc}
      full={isHome}
      breadcrumb={{ enabled: false }}
      tableOfContent={{ style: "clerk", enabled: !isHome }}
      tableOfContentPopover={{ enabled: !isHome }}
      slots={{ toc: { provider: TOCProvider, main: DocsTOC, popover: DocsTOCPopover } }}
    >
      {page.data.draft ? <DraftBanner copy={copy} /> : null}
      {isHome ? (
        <>
          <DocsHomeHero title={page.data.title} lead={page.data.description} locale={locale} copy={copy} />
          {meta}
        </>
      ) : (
        <PageHeader
          title={page.data.title}
          trail={sectionTrail(page)}
          trailLabel={copy.breadcrumbLabel}
          Art={CORNER_ART[page.data.translationKey]}
        >
          {meta}
        </PageHeader>
      )}
      <DocsBody>
        <MDX components={getMDXComponents(locale, { a: contentLink(page) })} />
      </DocsBody>
      <JsonLd data={pageGraph(page)} />
    </DocsPage>
  );
}

export async function generateMetadata(props: PageProps<"/[lang]/[[...slug]]">): Promise<Metadata> {
  return pageMetadata(await findPage(props));
}
