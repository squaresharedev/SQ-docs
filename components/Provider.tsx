"use client";

import { lazy, type ReactNode } from "react";
import { RootProvider } from "fumadocs-ui/provider/next";
import type { I18nProviderProps } from "fumadocs-ui/contexts/i18n";
import { DocsLink } from "./DocsLink";

// The dialog and its search engine download on first open, not with every page.
const SearchDialog = lazy(() => import("./SearchDialog"));

/**
 * Fumadocs root provider. Light by default like the dashboard; dark mode is
 * the tokens' `.dark` palette, chosen with the theme switch.
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
      search={{ SearchDialog, preload: false }}
      i18n={i18n}
      theme={{ defaultTheme: "light", hotKey: false }}
      components={{ Link: DocsLink }}
    >
      {children}
    </RootProvider>
  );
}
