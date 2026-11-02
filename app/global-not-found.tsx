import "@/styles/globals.css";
import type { Metadata } from "next";
import { ButtonLink } from "@/components/ButtonLink";
import { LogoMark } from "@/components/Logo";
import { HeroCursors } from "@/components/visuals/HeroDecor";
import { COPY } from "@/lib/copy";
import { fontVariables } from "@/lib/fonts";
import { LOCALES } from "@/lib/i18n";

export const metadata: Metadata = {
  title: { absolute: `${COPY.en.notFoundTitle} | ${COPY.en.titleSuffix}` },
  robots: { index: false },
};

/** 404 for addresses outside /en and /cs. Each locale has its own in app/[lang]/404. */
export default function GlobalNotFound() {
  return (
    <html lang="en" className={fontVariables}>
      <body className="dark min-h-screen bg-background text-foreground">
        <main className="relative isolate flex min-h-screen flex-col justify-center overflow-hidden px-6 py-16 sm:px-12">
          <HeroCursors />
          <div className="relative mx-auto w-full max-w-3xl">
            <LogoMark className="size-7" />
            <p aria-hidden="true" className="not-found-digits mt-6 mb-0 font-display text-[clamp(6rem,22vw,12rem)] leading-none font-bold">
              404
            </p>
            <h1 className="mt-2 mb-0 font-display text-3xl font-bold tracking-tight">{COPY.en.notFoundTitle}</h1>
            <p className="mt-3 text-muted-foreground">{COPY.en.notFoundBody}</p>
            <ul className="mt-8 flex list-none flex-wrap gap-3 p-0">
              {LOCALES.map((locale, index) => (
                <li key={locale} lang={locale}>
                  <ButtonLink href={`/${locale}`} variant={index === 0 ? "solid" : "outline"}>
                    {COPY[locale].notFoundHome}
                  </ButtonLink>
                </li>
              ))}
            </ul>
          </div>
        </main>
      </body>
    </html>
  );
}
