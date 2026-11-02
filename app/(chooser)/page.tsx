import type { Metadata } from "next";
import Link from "next/link";
import { LogoMark } from "@/components/Logo";
import { LANGUAGE_NAME, LANGUAGE_TAG, LOCALES, type Locale } from "@/lib/i18n";
import { publishedPages } from "@/lib/llms";
import { absoluteUrl, SITE_URL } from "@/lib/site";

const CHOICES: Record<Locale, string> = {
  en: "Read the Square Share docs in English",
  cs: "Číst dokumentaci Square Share v češtině",
};

/** hreflang only for languages whose docs home is published. */
function publishedHomes(): Record<string, string> | undefined {
  const homes: Record<string, string> = {};
  for (const locale of LOCALES) {
    const home = publishedPages(locale).find((page) => page.url === `/${locale}`);
    if (!home) return undefined;
    homes[LANGUAGE_TAG[locale]] = absoluteUrl(home.url);
  }
  return { ...homes, "x-default": absoluteUrl("/") };
}

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { absolute: "Square Share Docs" },
  description: "Square Share documentation in English and Czech. Dokumentace Square Share v angličtině a češtině.",
  alternates: { canonical: absoluteUrl("/"), languages: publishedHomes() },
};

export default function LanguageChooser() {
  return (
    <main className="mx-auto flex min-h-screen max-w-xl flex-col justify-center gap-10 px-6 py-16">
      <div className="flex items-center gap-3">
        <LogoMark className="size-7" />
        <h1 className="text-2xl font-semibold tracking-tight">Square Share Docs</h1>
      </div>
      <ul className="flex flex-col gap-3">
        {LOCALES.map((locale) => (
          <li key={locale}>
            <Link
              href={`/${locale}`}
              hrefLang={locale}
              lang={locale}
              className="flex items-center justify-between gap-4 border border-border bg-card px-5 py-4 transition-colors hover:bg-accent"
            >
              <span className="flex flex-col gap-1">
                <span className="text-lg font-semibold">{LANGUAGE_NAME[locale]}</span>
                <span className="font-inter text-sm text-muted-foreground">{CHOICES[locale]}</span>
              </span>
              <span aria-hidden="true" className="font-inter text-sm uppercase text-muted-foreground">
                /{locale}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </main>
  );
}
