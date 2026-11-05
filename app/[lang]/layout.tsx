import "@/styles/globals.css";
import { notFound } from "next/navigation";
import { DocsLayout } from "fumadocs-ui/layouts/notebook";
import { LocaleProvider } from "@/components/locale-context";
import { Provider } from "@/components/Provider";
import { SearchProvider } from "@/components/search";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { ThemeSwitch } from "@/components/ThemeSwitch";
import { COPY } from "@/lib/copy";
import { fontVariables } from "@/lib/fonts";
import { isLocale, LANGUAGE_TAG, LOCALES } from "@/lib/i18n";
import { withLegalPages } from "@/lib/legal";
import { switchTargets } from "@/lib/pairing";
import { withSectionHeadings } from "@/lib/sidebar";
import { WAITLIST_URL } from "@/lib/site";
import { source } from "@/lib/source";
import { i18nUI } from "@/lib/ui-translations";

export const dynamicParams = false;

export function generateStaticParams() {
  return LOCALES.map((lang) => ({ lang }));
}

export default async function LocaleLayout({ params, children }: LayoutProps<"/[lang]">) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const copy = COPY[lang];

  return (
    <html lang={LANGUAGE_TAG[lang]} className={fontVariables} suppressHydrationWarning>
      <body className="flex min-h-screen flex-col">
        {/* The first thing a keyboard reaches: past the header and sidebar to the page (WCAG 2.4.1). */}
        <a href="#nd-page" className="skip-link docs-button">
          {copy.skipToContent}
        </a>
        <Provider i18n={i18nUI.provider(lang)}>
          <LocaleProvider locale={lang} copy={copy} switchTargets={switchTargets()}>
            <SearchProvider>
              <DocsLayout
              tree={withSectionHeadings(withLegalPages(source.getPageTree(lang), lang))}
              nav={{ mode: "top", title: copy.siteName, url: `/${lang}` }}
              slots={{ header: SiteHeader, languageSelect: false, themeSwitch: ThemeSwitch }}
              links={[
                { type: "button", text: copy.getStarted, url: WAITLIST_URL, external: true, on: "menu" },
              ]}
              sidebar={{ collapsible: false, "aria-label": copy.sidebarLabel }}
            >
              {children}
            </DocsLayout>
            <SiteFooter locale={lang} />
            </SearchProvider>
          </LocaleProvider>
        </Provider>
      </body>
    </html>
  );
}
