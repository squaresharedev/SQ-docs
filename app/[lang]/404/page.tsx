import type { Metadata } from "next";
import Link from "next/link";
import { DocsBody, DocsPage, DocsTitle } from "fumadocs-ui/layouts/notebook/page";
import { COPY } from "@/lib/copy";
import { isLocale, LOCALES } from "@/lib/i18n";

/**
 * Exported as out/<lang>/404.html. Cloudflare's static assets serve the
 * nearest 404.html, so a missing /cs/... page gets the Czech one.
 */
export const dynamicParams = false;

export function generateStaticParams() {
  return LOCALES.map((lang) => ({ lang }));
}

export async function generateMetadata({ params }: PageProps<"/[lang]/404">): Promise<Metadata> {
  const { lang } = await params;
  const copy = COPY[isLocale(lang) ? lang : "en"];
  return { title: { absolute: `${copy.notFoundTitle} | ${copy.titleSuffix}` }, robots: { index: false } };
}

export default async function LocaleNotFound({ params }: PageProps<"/[lang]/404">) {
  const { lang } = await params;
  const locale = isLocale(lang) ? lang : "en";
  const copy = COPY[locale];

  return (
    <DocsPage breadcrumb={{ enabled: false }} footer={{ enabled: false }} tableOfContent={{ enabled: false }}>
      <DocsTitle>{copy.notFoundTitle}</DocsTitle>
      <DocsBody>
        <p>{copy.notFoundBody}</p>
        <p>
          <Link href={`/${locale}`}>{copy.notFoundHome}</Link>
        </p>
      </DocsBody>
    </DocsPage>
  );
}
