import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { createRelativeLink } from "fumadocs-ui/mdx";
import { DocsBody, DocsPage } from "fumadocs-ui/layouts/notebook/page";
import { DocsHomeHero } from "@/components/DocsHomeHero";
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
import { source } from "@/lib/source";
import { markdownPath, markdownViewPath } from "@/lib/urls";

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
      markdownUrl={markdownPath(page)}
      markdownViewUrl={markdownViewPath(page)}
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
    >
      {page.data.draft ? <DraftBanner copy={copy} /> : null}
      {isHome ? (
        <>
          <DocsHomeHero title={page.data.title} lead={page.data.description} locale={locale} copy={copy} />
          {meta}
        </>
      ) : (
        <PageHeader title={page.data.title} trail={sectionTrail(page)} Art={CORNER_ART[page.data.translationKey]}>
          {meta}
        </PageHeader>
      )}
      <DocsBody>
        <MDX components={getMDXComponents(locale, { a: createRelativeLink(source, page) })} />
      </DocsBody>
      <JsonLd data={pageGraph(page)} />
    </DocsPage>
  );
}

export async function generateMetadata(props: PageProps<"/[lang]/[[...slug]]">): Promise<Metadata> {
  return pageMetadata(await findPage(props));
}
