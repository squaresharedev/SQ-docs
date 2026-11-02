import "@/styles/globals.css";
import { notFound } from "next/navigation";
import { DocsLayout } from "fumadocs-ui/layouts/notebook";
import { LocaleProvider } from "@/components/locale-context";
import { Provider } from "@/components/Provider";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { COPY } from "@/lib/copy";
import { fontVariables } from "@/lib/fonts";
import { isLocale, LANGUAGE_TAG, LOCALES } from "@/lib/i18n";
import { switchTargets } from "@/lib/pairing";
import { HOME_URL, WAITLIST_URL } from "@/lib/site";
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
        <Provider i18n={i18nUI.provider(lang)}>
          <LocaleProvider locale={lang} copy={copy} switchTargets={switchTargets()}>
            <DocsLayout
              tree={source.getPageTree(lang)}
              nav={{ mode: "top", title: copy.siteName, url: `/${lang}` }}
              slots={{ header: SiteHeader, languageSelect: false }}
              links={[
                { text: copy.mainSiteLink, url: HOME_URL, external: true, on: "menu" },
                { type: "button", text: copy.getStarted, url: WAITLIST_URL, external: true, on: "menu" },
              ]}
              sidebar={{ collapsible: false }}
            >
              {children}
            </DocsLayout>
            <SiteFooter locale={lang} />
          </LocaleProvider>
        </Provider>
      </body>
    </html>
  );
}
