"use client";

import type { ReactNode } from "react";
import { RootProvider } from "fumadocs-ui/provider/next";
import type { I18nProviderProps } from "fumadocs-ui/contexts/i18n";
import { DocsLink } from "./DocsLink";

/**
 * Fumadocs root provider. Light by default like the dashboard; dark mode is
 * the tokens' `.dark` palette, chosen with the theme switch. Fumadocs' own
 * search is off: the header uses the dashboard's search (components/search).
 */
export function Provider({
  i18n,
  children,
}: {
  i18n: Omit<I18nProviderProps, "children" | "onLocaleChange">;
  children: ReactNode;
}) {
  return (
    <RootProvider
      search={{ enabled: false }}
      i18n={i18n}
      theme={{ defaultTheme: "light", hotKey: false }}
      components={{ Link: DocsLink }}
    >
      {children}
    </RootProvider>
  );
}
