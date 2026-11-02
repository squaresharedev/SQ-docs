import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { createRelativeLink } from "fumadocs-ui/mdx";
import { DocsBody, DocsPage, DocsTitle } from "fumadocs-ui/layouts/notebook/page";
import { DraftBanner } from "@/components/DraftBanner";
import { JsonLd } from "@/components/JsonLd";
import { getMDXComponents } from "@/components/mdx";
import { PageMeta } from "@/components/PageMeta";
import { COPY } from "@/lib/copy";
import { pageGraph } from "@/lib/jsonld";
import { localeOf } from "@/lib/pairing";
import { pageMetadata } from "@/lib/seo";
import { source } from "@/lib/source";
import { markdownPath } from "@/lib/urls";

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

  return (
    <DocsPage toc={page.data.toc} tableOfContent={{ style: "clerk" }}>
      {page.data.draft ? <DraftBanner copy={copy} /> : null}
      <DocsTitle>{page.data.title}</DocsTitle>
      <PageMeta
        lastUpdated={page.data.lastUpdated}
        markdownUrl={markdownPath(page)}
        locale={locale}
        copy={copy}
      />
      <DocsBody>
        <MDX components={getMDXComponents({ a: createRelativeLink(source, page) })} />
      </DocsBody>
      <JsonLd data={pageGraph(page)} />
    </DocsPage>
  );
}

export async function generateMetadata(props: PageProps<"/[lang]/[[...slug]]">): Promise<Metadata> {
  return pageMetadata(await findPage(props));
}
