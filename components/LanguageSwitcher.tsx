"use client";

import { DocsLink as Link } from "./DocsLink";
import { usePathname } from "next/navigation";
import { LANGUAGE_NAME, LOCALES, type Locale } from "@/lib/i18n";
import { cn } from "@/lib/cn";
import { useLocaleContext } from "./locale-context";

/**
 * EN / CS as two plain links, so both targets are in the HTML. Each goes to the
 * paired translation of the current page (by translationKey), or to that
 * language's docs home when the page has no translation.
 */
export function LanguageSwitcher({ className }: { className?: string }) {
  const { locale, copy, switchTargets } = useLocaleContext();
  const pathname = usePathname().replace(/\/+$/, "") || "/";
  const targets = switchTargets[pathname];

  return (
    <nav aria-label={copy.languageNav} className={cn("flex items-center", className)}>
      <ul className="flex items-center border border-fd-border">
        {LOCALES.map((code: Locale) => {
          const current = code === locale;
          return (
            <li key={code}>
              <Link
                href={targets?.[code] ?? `/${code}`}
                hrefLang={code}
                lang={code}
                aria-current={current ? "page" : undefined}
                title={LANGUAGE_NAME[code]}
                className={cn(
                  "flex h-8 min-w-10 items-center justify-center px-2 font-inter text-xs font-medium uppercase tracking-wide transition-colors",
                  current
                    ? "bg-fd-primary text-fd-primary-foreground"
                    : "text-fd-muted-foreground hover:bg-fd-accent hover:text-fd-accent-foreground",
                )}
              >
                <span aria-hidden="true">{code}</span>
                <span className="sr-only">{LANGUAGE_NAME[code]}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
