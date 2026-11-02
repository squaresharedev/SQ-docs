import "@/styles/globals.css";
import type { Metadata } from "next";
import Link from "next/link";
import { LogoMark } from "@/components/Logo";
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
      <body className="min-h-screen bg-background text-foreground">
        <main className="mx-auto flex min-h-screen max-w-xl flex-col justify-center gap-6 px-6 py-16">
          <LogoMark className="size-7" />
          <h1 className="text-2xl font-semibold tracking-tight">{COPY.en.notFoundTitle}</h1>
          <p className="text-muted-foreground">{COPY.en.notFoundBody}</p>
          <ul className="flex flex-wrap gap-3">
            {LOCALES.map((locale) => (
              <li key={locale}>
                <Link
                  href={`/${locale}`}
                  hrefLang={locale}
                  lang={locale}
                  className="inline-flex items-center bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90"
                >
                  {COPY[locale].notFoundHome}
                </Link>
              </li>
            ))}
          </ul>
        </main>
      </body>
    </html>
  );
}
