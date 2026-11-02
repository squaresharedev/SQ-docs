import type { Metadata } from "next";
import { DocsPage } from "fumadocs-ui/layouts/notebook/page";
import { ButtonLink } from "@/components/ButtonLink";
import { COPY } from "@/lib/copy";
import { isLocale, LOCALES } from "@/lib/i18n";
import { KEY_PAGES } from "@/lib/routes";

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
      <p aria-hidden="true" className="not-found-digits m-0 font-display text-[clamp(5rem,18vw,10rem)] leading-none font-bold">
        404
      </p>
      <h1 className="docs-title mt-2 mb-0 font-display text-3xl font-bold">{copy.notFoundTitle}</h1>
      <p className="mt-3 text-fd-muted-foreground">{copy.notFoundBody}</p>
      <div className="mt-8 flex flex-wrap gap-3">
        <ButtonLink href={`/${locale}`}>{copy.notFoundHome}</ButtonLink>
        <ButtonLink href={KEY_PAGES[locale].whatIs} variant="outline">
          {copy.heroSecondary}
        </ButtonLink>
      </div>
    </DocsPage>
  );
}
