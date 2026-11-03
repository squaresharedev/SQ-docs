"use client";

import type { ComponentProps } from "react";
import { Menu } from "lucide-react";
import { useNotebookLayout } from "fumadocs-ui/layouts/notebook";
import { cn } from "@/lib/cn";
import { WAITLIST_URL } from "@/lib/site";
import { DocsLink as Link } from "./DocsLink";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { useLocaleContext } from "./locale-context";
import { Logo } from "./Logo";
import { SearchMobileTrigger, SearchTrigger } from "./search";

/**
 * Replaces the notebook layout's header slot with a bar like the dashboard's
 * top bar: the page's own background, a hairline under it, the wordmark, the
 * dashboard's search field, the language switch, the theme switch and a sharp
 * "Get started". The wrapper classes keep the layout's grid placement and height.
 */
export function SiteHeader(props: ComponentProps<"header">) {
  const { slots } = useNotebookLayout();
  const { locale, copy } = useLocaleContext();

  return (
    <header
      id="nd-subnav"
      {...props}
      className={cn(
        "sticky [grid-area:header] top-(--fd-docs-row-1) z-10 flex flex-col bg-fd-background text-fd-foreground layout:[--fd-header-height:--spacing(14)]",
        props.className,
      )}
    >
      <div className="flex h-14 items-center gap-2 border-b border-fd-border px-4 sm:gap-3 md:px-6">
        <Link href={`/${locale}`} className="flex shrink-0 items-center">
          <Logo />
        </Link>

        <div className="ms-6 hidden min-w-0 flex-1 md:flex">
          <SearchTrigger />
        </div>

        <div className="ms-auto flex items-center gap-1.5 sm:gap-2">
          <LanguageSwitcher />
          {slots.themeSwitch ? <slots.themeSwitch className="max-md:hidden" /> : null}
          {/*
            Below lg the sidebar lists Get started (Fumadocs shows menu links there
            up to lg), so the header shows it from lg. The wrapper does the hiding:
            the button class sets its own display.
          */}
          <span className="max-lg:hidden">
            <a href={WAITLIST_URL} data-external="" className="docs-button docs-button-sm">
              {copy.getStarted}
            </a>
          </span>
          <span className="md:hidden">
            <SearchMobileTrigger />
          </span>
          {slots.sidebar ? (
            <slots.sidebar.trigger className="inline-flex size-10 items-center justify-center text-fd-foreground hover:bg-fd-accent md:hidden">
              <Menu className="size-5" strokeWidth={2} aria-hidden="true" />
            </slots.sidebar.trigger>
          ) : null}
        </div>
      </div>
    </header>
  );
}
