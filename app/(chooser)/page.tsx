import type { Metadata } from "next";
import { ButtonLink } from "@/components/ButtonLink";
import { LogoMark } from "@/components/Logo";
import { HeroCursors } from "@/components/visuals/HeroDecor";
import { LANGUAGE_NAME, LOCALES, OG_LOCALE, type Locale } from "@/lib/i18n";
import { absoluteUrl, SITE_URL } from "@/lib/site";

const CHOICES: Record<Locale, string> = {
  en: "Read the Square Share docs in English",
  cs: "Číst dokumentaci Square Share v češtině",
};

const TITLE = "Square Share Docs";
const DESCRIPTION = "Square Share documentation in English and Czech. Dokumentace Square Share v angličtině a češtině.";
/** The chooser has no card image of its own, so it shares the English docs home's. */
const IMAGE = absoluteUrl("/og/en/image.png");

/**
 * In production the Worker answers / with a 301 to /en, so this page only
 * shows on static hosts (the GitHub Pages dev site). It is never indexed and
 * points search engines at the English docs home.
 */
export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { absolute: TITLE },
  description: DESCRIPTION,
  robots: { index: false },
  alternates: { canonical: absoluteUrl("/en") },
  openGraph: {
    type: "website",
    title: TITLE,
    description: DESCRIPTION,
    url: absoluteUrl("/en"),
    siteName: TITLE,
    locale: OG_LOCALE.en,
    alternateLocale: [OG_LOCALE.cs],
    images: [{ url: IMAGE, width: 1200, height: 630, alt: TITLE }],
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESCRIPTION,
    images: [{ url: IMAGE, alt: TITLE }],
  },
};

/** The language chooser, drawn like the homepage hero. */
export default function LanguageChooser() {
  return (
    <main className="relative isolate flex min-h-screen flex-col justify-center overflow-hidden px-6 py-16 sm:px-12">
      <HeroCursors />
      <div className="relative mx-auto w-full max-w-3xl">
        <p className="m-0 flex items-center gap-3 eyebrow text-muted-foreground">
          <LogoMark className="size-6 text-foreground" />
          Square Share
        </p>
        <h1 className="mt-6 mb-0 font-display text-5xl leading-[1.02] font-bold tracking-tight sm:text-7xl">
          Square Share <span className="text-acid">Docs</span>
        </h1>
        <ul role="list" className="mt-10 grid list-none gap-4 p-0 sm:grid-cols-2">
          {LOCALES.map((locale, index) => (
            <li key={locale} lang={locale} className="flex flex-col gap-3 border border-border bg-card p-5">
              <span className="eyebrow text-muted-foreground">/{locale}</span>
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
