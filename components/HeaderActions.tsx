"use client";

import { useEffect, useId, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { Check, ChevronDown, Globe, Moon, Sun } from "lucide-react";
import { transitionClass } from "@squaresharedev/tokens";
import { cn } from "@/lib/cn";
import { LANGUAGE_NAME } from "@/lib/i18n";
import { WAITLIST_URL } from "@/lib/site";
import { DocsLink as Link } from "./DocsLink";
import { useLanguageLinks } from "./LanguageSwitcher";
import { useLocaleContext } from "./locale-context";
import { ThemeSwitch, useThemeToggle, type ThemeName } from "./ThemeSwitch";

/**
 * The right side of the header: language, theme and Get started, drawn from
 * one look (HEADER_ACTIONS_LOOK) so every control shares a height and a frame.
 * The /dev/header-lab page tunes the look; SiteHeader ships it.
 *
 * Whatever the look, the parts keep their names: a navigation landmark called
 * "Language" holding a link per language (hreflang, lang, aria-current), and
 * one "Dark theme" button with aria-pressed.
 */

/** How the language links look. */
export type HeaderLangStyle =
  /** Both codes in one strip, the current one filled with the text colour. */
  | "segmented"
  /** Both codes in one strip, the current one on the hover grey. */
  | "quiet"
  /** "EN / CS" as words: the current one in the text colour, the other muted. */
  | "text"
  /** One link to the other language: a globe and its code. */
  | "swap"
  /** A globe button with the current code that opens a list of languages. */
  | "menu";

/** How the theme control looks. */
export type HeaderThemeStyle =
  /** One square button showing the theme it switches to. */
  | "icon"
  /** Sun and moon side by side in square cells, the current one shaded. */
  | "segmented"
  /** Fumadocs' sun and moon toggle (what the header had first). */
  | "pill";

/** How Get started looks. */
export type HeaderCtaStyle = "filled-arrow" | "filled" | "outline-arrow" | "link-arrow";

/** Borders around the language and theme controls. */
export type HeaderFrame =
  /** No borders: the controls are text and icons with a grey hover. */
  | "bare"
  /** Language and theme share one bordered strip with a hairline between. */
  | "joined"
  /** Each control has a border of its own. */
  | "separate";

export interface HeaderActionsLook {
  lang: HeaderLangStyle;
  theme: HeaderThemeStyle;
  cta: HeaderCtaStyle;
  frame: HeaderFrame;
  /** Height of every control, in px. */
  height: number;
  /** Space between the language control, the theme control and the button, in px. */
  gap: number;
  /** A short vertical hairline before Get started. */
  divider: boolean;
  /** Theme icons drawn as lines or filled. */
  themeIcons: "line" | "fill";
  /** "text" and "swap" show the language's code ("CS") or its own name ("Čeština"). */
  langLabel: "code" | "name";
}

/** The shipped look. The lab starts from it and its Copy JSX lists changes from it. */
export const HEADER_ACTIONS_LOOK: HeaderActionsLook = {
  lang: "text",
  theme: "icon",
  cta: "filled-arrow",
  frame: "bare",
  height: 36,
  gap: 8,
  divider: true,
  themeIcons: "line",
  langLabel: "code",
};

/**
 * "responsive": the theme control from md and Get started from lg (below lg
 * the sidebar drawer lists Get started). The lab forces "desktop", "tablet"
 * (md to lg) or "phone" to draw a size inside a box of another width.
 */
export type HeaderActionsLayout = "responsive" | "desktop" | "tablet" | "phone";

const BOX = "border border-fd-border";
const GHOST = "text-fd-muted-foreground hover:bg-fd-accent hover:text-fd-foreground";

export function HeaderActions({
  look = HEADER_ACTIONS_LOOK,
  layout = "responsive",
  shownTheme,
}: {
  look?: HeaderActionsLook;
  layout?: HeaderActionsLayout;
  /** Draw the theme control as if this theme were on (the lab's boxes). */
  shownTheme?: ThemeName;
}) {
  const { copy } = useLocaleContext();
  const showTheme = layout === "desktop" || layout === "tablet" || (layout === "responsive" ? "max-md:hidden" : null);
  const showCta = layout === "desktop" || (layout === "responsive" ? "max-lg:hidden" : null);
  const style = { "--ha-h": `${look.height}px`, gap: `${look.gap}px` } as CSSProperties;

  // Phones get tighter language padding so the bar fits 375 px (the old switcher did the same).
  const pad: LangPad =
    layout === "phone"
      ? { text: "px-1", icon: "px-1.5" }
      : layout === "responsive"
        ? { text: "px-1 sm:px-2", icon: "px-1.5 sm:px-2.5" }
        : { text: "px-2", icon: "px-2.5" };
  const lang = <LanguageControl look={look} pad={pad} />;
  const theme = showTheme ? (
    <ThemeControl look={look} shownTheme={shownTheme} className={typeof showTheme === "string" ? showTheme : undefined} />
  ) : null;

  return (
    <div className="flex items-center" style={style} data-header-actions="">
      {look.frame === "joined" ? (
        <div className={cn("flex h-(--ha-h) items-stretch", BOX)}>
          {lang}
          {theme ? <span aria-hidden="true" className={cn("w-px bg-fd-border", typeof showTheme === "string" && showTheme)} /> : null}
          {theme}
        </div>
      ) : (
        <>
          {lang}
          {theme}
        </>
      )}
      {showCta ? (
        <>
          {look.divider ? (
            <span
              aria-hidden="true"
              className={cn("h-[calc(var(--ha-h)*0.6)] w-px bg-fd-border", typeof showCta === "string" && showCta)}
            />
          ) : null}
          {/* The wrapper does the hiding: the button class sets its own display. */}
          <span className={cn("flex", typeof showCta === "string" && showCta)}>
            <CtaLink look={look}>{copy.getStarted}</CtaLink>
          </span>
        </>
      ) : null}
    </div>
  );
}

function CtaLink({ look, children }: { look: HeaderActionsLook; children: ReactNode }) {
  if (look.cta === "link-arrow") {
    return (
      <a
        href={WAITLIST_URL}
        data-external=""
        className={cn(
          "inline-flex h-(--ha-h) items-center gap-1.5 px-1 text-sm font-semibold text-fd-foreground underline-offset-4 hover:underline",
          transitionClass,
        )}
      >
        {children}
        <ArrowUpRight />
      </a>
    );
  }
  return (
    <a
      href={WAITLIST_URL}
      data-external=""
      className={cn(
        "docs-button docs-button-sm h-(--ha-h)!",
        look.cta === "outline-arrow" && "docs-button-outline",
        look.cta === "filled" && "after:hidden",
      )}
    >
      {children}
    </a>
  );
}

function ArrowUpRight() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="square" aria-hidden="true" className="size-3.5">
      <path d="M7 17L17 7M9 7h8v8" />
    </svg>
  );
}

/** Horizontal padding of the language links: codes and words, and globe controls. */
interface LangPad {
  text: string;
  icon: string;
}

function LanguageControl({ look, pad }: { look: HeaderActionsLook; pad: LangPad }) {
  const { copy } = useLocaleContext();
  const links = useLanguageLinks();
  const framed = look.frame === "separate";
  const label = (code: string) => (look.langLabel === "name" ? LANGUAGE_NAME[code as keyof typeof LANGUAGE_NAME] : code.toUpperCase());

  if (look.lang === "menu") return <LanguageMenu look={look} pad={pad} />;

  if (look.lang === "swap") {
    const other = links.find((link) => !link.current) ?? links[0];
    return (
      <nav aria-label={copy.languageNav} className="flex">
        <Link
          href={other.href}
          hrefLang={other.code}
          lang={other.code}
          className={cn(
            "inline-flex h-(--ha-h) items-center gap-1.5 text-sm font-medium",
            pad.icon,
            GHOST,
            framed && BOX,
            transitionClass,
          )}
        >
          <Globe className="size-4" strokeWidth={2} aria-hidden="true" />
          {label(other.code)}
          {look.langLabel === "code" ? <span className="sr-only"> {LANGUAGE_NAME[other.code]}</span> : null}
        </Link>
      </nav>
    );
  }

  if (look.lang === "text") {
    return (
      <nav aria-label={copy.languageNav} className="flex">
        <ul className={cn("flex h-(--ha-h) items-center", framed && cn(BOX, "px-1"))}>
          {links.map(({ code, href, current }, index) => (
            <li key={code} className="flex items-center">
              {index > 0 ? (
                <span aria-hidden="true" className="text-fd-border">
                  /
                </span>
              ) : null}
              <Link
                href={href}
                hrefLang={code}
                lang={code}
                aria-current={current ? "page" : undefined}
                className={cn(
                  "inline-flex h-(--ha-h) items-center text-sm",
                  pad.text,
                  transitionClass,
                  current ? "font-semibold text-fd-foreground" : "font-medium text-fd-muted-foreground hover:text-fd-foreground",
                )}
              >
                {label(code)}
                {look.langLabel === "code" ? <span className="sr-only"> {LANGUAGE_NAME[code]}</span> : null}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    );
  }

  // segmented and quiet
  return (
    <nav aria-label={copy.languageNav} className="flex">
      <ul className={cn("flex h-(--ha-h) items-stretch", framed && BOX)}>
        {links.map(({ code, href, current }) => (
          <li key={code} className="flex">
            <Link
              href={href}
              hrefLang={code}
              lang={code}
              aria-current={current ? "page" : undefined}
              className={cn(
                "eyebrow flex min-w-(--ha-h) items-center justify-center",
                pad.text,
                transitionClass,
                current
                  ? look.lang === "segmented"
                    ? "bg-fd-foreground text-fd-background"
                    : "bg-fd-accent font-semibold text-fd-foreground"
                  : GHOST,
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

/**
 * A disclosure, not an ARIA menu: a button that shows a list of links. Escape
 * and a click outside close it; Escape puts focus back on the button.
 */
function LanguageMenu({ look, pad }: { look: HeaderActionsLook; pad: LangPad }) {
  const { locale, copy } = useLocaleContext();
  const links = useLanguageLinks();
  const [open, setOpen] = useState(false);
  const root = useRef<HTMLElement>(null);
  const button = useRef<HTMLButtonElement>(null);
  const listId = useId();

  useEffect(() => {
    if (!open) return;
    const onPointer = (event: PointerEvent) => {
      if (!root.current?.contains(event.target as Node)) setOpen(false);
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
        button.current?.focus();
      }
    };
    document.addEventListener("pointerdown", onPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <nav ref={root} aria-label={copy.languageNav} className="relative flex">
      <button
        ref={button}
        type="button"
        aria-expanded={open}
        aria-controls={listId}
        onClick={() => setOpen((value) => !value)}
        className={cn(
          "inline-flex h-(--ha-h) items-center gap-1.5 text-sm font-medium",
          pad.icon,
          GHOST,
          look.frame === "separate" && BOX,
          open && "bg-fd-accent text-fd-foreground",
          transitionClass,
        )}
      >
        <Globe className="size-4" strokeWidth={2} aria-hidden="true" />
        {locale.toUpperCase()}
        <span className="sr-only"> {LANGUAGE_NAME[locale]}</span>
        <ChevronDown className={cn("size-3.5", transitionClass, open && "rotate-180")} strokeWidth={2.25} aria-hidden="true" />
      </button>
      <ul id={listId} hidden={!open} className={cn("absolute end-0 top-full z-20 mt-1 min-w-40 bg-fd-popover py-1 shadow-lg", BOX)}>
        {links.map(({ code, href, current }) => (
          <li key={code}>
            <Link
              href={href}
              hrefLang={code}
              lang={code}
              aria-current={current ? "page" : undefined}
              onClick={() => setOpen(false)}
              className={cn(
                "flex items-center justify-between gap-4 px-3 py-2 text-sm",
                current ? "font-semibold text-fd-foreground" : "text-fd-muted-foreground hover:bg-fd-accent hover:text-fd-foreground",
                transitionClass,
              )}
            >
              {LANGUAGE_NAME[code]}
              {current ? <Check className="size-4" strokeWidth={2.25} aria-hidden="true" /> : null}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}

function ThemeControl({ look, shownTheme, className }: { look: HeaderActionsLook; shownTheme?: ThemeName; className?: string }) {
  const { copy } = useLocaleContext();
  const { theme, toggle } = useThemeToggle(shownTheme);
  const fill = look.themeIcons === "fill" ? "currentColor" : "none";

  if (look.theme === "pill") return <ThemeSwitch shown={shownTheme} className={className} />;

  if (look.theme === "segmented") {
    const cell = (on: boolean) =>
      cn("flex aspect-square h-full items-center justify-center", transitionClass, on ? "bg-fd-accent text-fd-foreground" : "text-fd-muted-foreground");
    return (
      <button
        type="button"
        aria-label={copy.darkTheme}
        aria-pressed={theme ? theme === "dark" : undefined}
        onClick={toggle}
        data-theme-toggle=""
        className={cn("group flex h-(--ha-h) items-stretch", look.frame === "separate" && BOX, className)}
      >
        <span className={cell(theme === "light")}>
          <Sun fill={fill} className="size-4" strokeWidth={2} aria-hidden="true" />
        </span>
        <span className={cell(theme === "dark")}>
          <Moon fill={fill} className="size-4" strokeWidth={2} aria-hidden="true" />
        </span>
      </button>
    );
  }

  // icon: shows the theme it turns on
  const Icon = theme === "dark" ? Sun : Moon;
  return (
    <button
      type="button"
      aria-label={copy.darkTheme}
      aria-pressed={theme ? theme === "dark" : undefined}
      onClick={toggle}
      data-theme-toggle=""
      className={cn(
        "flex size-(--ha-h) items-center justify-center",
        GHOST,
        look.frame === "separate" && BOX,
        transitionClass,
        className,
      )}
    >
      <Icon fill={fill} className={cn("size-4.5", !theme && "opacity-0")} strokeWidth={2} aria-hidden="true" />
    </button>
  );
}
