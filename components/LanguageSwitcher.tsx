"use client";

import { DocsLink as Link } from "./DocsLink";
import { usePathname } from "next/navigation";
import { transitionClass } from "@squaresharedev/tokens";
import { LANGUAGE_NAME, LOCALES, type Locale } from "@/lib/i18n";
import { cn } from "@/lib/cn";
import { useLocaleContext } from "./locale-context";

export interface LanguageLink {
  code: Locale;
  href: string;
  current: boolean;
}

/**
 * One link per language. Each goes to the paired translation of the current
 * page (by translationKey), or to that language's docs home when the page has
 * no translation.
 */
export function useLanguageLinks(): LanguageLink[] {
  const { locale, switchTargets } = useLocaleContext();
  const pathname = usePathname().replace(/\/+$/, "") || "/";
  const targets = switchTargets[pathname];
  return LOCALES.map((code) => ({ code, href: targets?.[code] ?? `/${code}`, current: code === locale }));
}

/**
 * EN / CS as two plain links, so both targets are in the HTML. A link's name
 * starts with the code it shows, then the language's own name ("CS Čeština"),
 * so someone using voice control can say what they see (WCAG 2.5.3).
 * The header uses HeaderActions; this boxed version is kept for the lab's
 * Reference tab.
 */
export function LanguageSwitcher({ className }: { className?: string }) {
  const { copy } = useLocaleContext();
  const links = useLanguageLinks();

  return (
    <nav aria-label={copy.languageNav} className={cn("flex items-center", className)}>
      <ul className="flex items-center border border-fd-border">
        {links.map(({ code, href, current }) => (
          <li key={code}>
            <Link
              href={href}
              hrefLang={code}
              lang={code}
              aria-current={current ? "page" : undefined}
              className={cn(
                "eyebrow flex h-8 min-w-8 items-center justify-center px-1.5 sm:min-w-10 sm:px-2",
                transitionClass,
                current
                  ? "bg-fd-foreground text-fd-background"
                  : "text-fd-muted-foreground hover:bg-fd-accent hover:text-fd-accent-foreground",
              )}
            >
              {code.toUpperCase()}
              <span className="sr-only"> {LANGUAGE_NAME[code]}</span>
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
