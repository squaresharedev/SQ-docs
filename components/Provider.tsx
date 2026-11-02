"use client";

import type { ReactNode } from "react";
import { RootProvider } from "fumadocs-ui/provider/next";
import type { I18nProviderProps } from "fumadocs-ui/contexts/i18n";
import SearchDialog from "./SearchDialog";

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
    <RootProvider search={{ SearchDialog }} i18n={i18n} theme={{ defaultTheme: "light", hotKey: false }}>
      {children}
    </RootProvider>
  );
}
