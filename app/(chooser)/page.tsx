import type { Metadata } from "next";
import { ButtonLink } from "@/components/ButtonLink";
import { LogoMark } from "@/components/Logo";
import { HeroCursors } from "@/components/visuals/HeroDecor";
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

/** The language chooser, drawn like the homepage hero. */
export default function LanguageChooser() {
  return (
    <main className="relative isolate flex min-h-screen flex-col justify-center overflow-hidden px-6 py-16 sm:px-12">
      <HeroCursors />
      <div className="relative mx-auto w-full max-w-3xl">
        <p className="m-0 flex items-center gap-3 font-mono text-xs uppercase tracking-widest text-muted-foreground">
          <LogoMark className="size-6 text-foreground" />
          Square Share
        </p>
        <h1 className="mt-6 mb-0 font-display text-5xl leading-[1.02] font-bold tracking-tight sm:text-7xl">
          Square Share <span className="text-acid">Docs</span>
        </h1>
        <ul className="mt-10 grid list-none gap-4 p-0 sm:grid-cols-2">
          {LOCALES.map((locale, index) => (
            <li key={locale} lang={locale} className="flex flex-col gap-3 border border-border bg-card p-5">
              <span className="font-mono text-xs uppercase tracking-widest text-muted-foreground">/{locale}</span>
              <span className="text-sm text-muted-foreground">{CHOICES[locale]}</span>
              <ButtonLink href={`/${locale}`} variant={index === 0 ? "solid" : "outline"} className="self-start">
                {LANGUAGE_NAME[locale]}
              </ButtonLink>
            </li>
          ))}
        </ul>
      </div>
    </main>
  );
}
