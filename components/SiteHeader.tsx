"use client";

import { DocsLink as Link } from "./DocsLink";
import type { ComponentProps } from "react";
import { useNotebookLayout } from "fumadocs-ui/layouts/notebook";
import { cn } from "@/lib/cn";
import { HOME_URL, WAITLIST_URL } from "@/lib/site";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { useLocaleContext } from "./locale-context";
import { Logo } from "./Logo";

/**
 * Replaces the notebook layout's header slot with the homepage's header:
 * always black (the `dark` class switches the tokens to the brand's dark
 * palette), mono links, a white sharp "Get started" with its arrow. Holds the
 * logo + "Docs", search, squareshare.eu, language switcher and theme switch.
 * The wrapper classes keep the layout's own grid placement and height.
 */
export function SiteHeader(props: ComponentProps<"header">) {
  const { slots } = useNotebookLayout();
  const { locale, copy } = useLocaleContext();

  return (
    <header
      id="nd-subnav"
      {...props}
      className={cn(
        "dark sticky [grid-area:header] top-(--fd-docs-row-1) z-10 flex flex-col bg-fd-background text-fd-foreground layout:[--fd-header-height:--spacing(14)]",
        props.className,
      )}
    >
      <div className="flex h-14 items-center gap-3 border-b border-fd-border px-4 md:px-6">
        <Link href={`/${locale}`} className="flex shrink-0 items-center">
          <Logo label={copy.docsLabel} />
        </Link>

        {slots.searchTrigger ? (
          <slots.searchTrigger.full
            hideIfDisabled
            className="my-auto ms-4 w-full max-w-sm rounded-sm bg-fd-secondary/60 ps-2.5 max-md:hidden"
          />
        ) : null}

        <div className="ms-auto flex items-center gap-2 md:gap-3">
          <a
            href={HOME_URL}
            className="px-1 font-mono text-xs tracking-wide text-fd-muted-foreground transition-colors hover:text-fd-foreground max-lg:hidden"
          >
            {copy.mainSiteLink}
          </a>
          <LanguageSwitcher />
          {slots.themeSwitch ? <slots.themeSwitch className="max-md:hidden" /> : null}
          {/* The wrapper hides it on phones: the button class sets its own display. */}
          <span className="max-md:hidden">
            <a href={WAITLIST_URL} data-external="" className="docs-button docs-button-sm">
              {copy.getStarted}
            </a>
          </span>
          {slots.searchTrigger ? <slots.searchTrigger.sm hideIfDisabled className="p-2 md:hidden" /> : null}
          {slots.sidebar ? (
            <slots.sidebar.trigger className="inline-flex size-9 items-center justify-center text-fd-muted-foreground hover:bg-fd-accent hover:text-fd-accent-foreground md:hidden">
              <MenuIcon />
            </slots.sidebar.trigger>
          ) : null}
        </div>
      </div>
    </header>
  );
}

function MenuIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <path d="M4 6h16M4 12h16M4 18h16" strokeLinecap="square" />
    </svg>
  );
}
