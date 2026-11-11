import { notFound } from "next/navigation";
import { RootProvider } from "fumadocs-ui/provider/next";
import { DocsLink } from "@/components/DocsLink";
import { LocaleProvider } from "@/components/locale-context";
import { SearchProvider } from "@/components/search";
import { COPY } from "@/lib/copy";
import { switchTargets } from "@/lib/pairing";
import { i18nUI } from "@/lib/ui-translations";
import { LabLoader } from "./LabLoader";

export const metadata = { title: "Header lab", robots: { index: false } };

/**
 * /dev/header-lab: the right side of the header (language, theme, Get
 * started) in many looks, in the real header bar. The page is always light;
 * the dark boxes put the tokens' .dark palette on themselves.
 */
export default function HeaderLabPage() {
  if (process.env.NODE_ENV === "production") notFound();
  return (
    <RootProvider
      search={{ enabled: false }}
      i18n={i18nUI.provider("en")}
      theme={{ forcedTheme: "light", hotKey: false }}
      components={{ Link: DocsLink }}
    >
      <LocaleProvider locale="en" copy={COPY.en} switchTargets={switchTargets()}>
        <SearchProvider>
          <LabLoader />
        </SearchProvider>
      </LocaleProvider>
    </RootProvider>
  );
}
