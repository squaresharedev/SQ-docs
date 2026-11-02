"use client";

import { createContext, useContext, type ReactNode } from "react";
import type { Copy } from "@/lib/copy";
import type { Locale } from "@/lib/i18n";
import type { SwitchTargets } from "@/lib/pairing";

interface LocaleContextValue {
  locale: Locale;
  copy: Copy;
  switchTargets: SwitchTargets;
}

const LocaleContext = createContext<LocaleContextValue | null>(null);

export function LocaleProvider({ children, ...value }: LocaleContextValue & { children: ReactNode }) {
  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>;
}

export function useLocaleContext(): LocaleContextValue {
  const value = useContext(LocaleContext);
  if (!value) throw new Error("useLocaleContext must be used inside LocaleProvider");
  return value;
}
