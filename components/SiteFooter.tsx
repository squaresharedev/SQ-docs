"use client";

/*
 * The homepage's footer, copied from Home/src/components/Footer.tsx. Same
 * markup, classes, pixel grid and social row. Changed only where the docs
 * differ: links go back to squareshare.eu, the labels have a Czech version,
 * the brand is spelled "Square Share", and the cookie settings opener is left
 * out because the docs set no cookies and have no consent banner.
 *
 * Layout: the two halves sit side by side from xl, not md. Between md and xl
 * the original's link columns (shrink-0) push into the wordmark, and at 1280px
 * its credit line runs out of the column. The credit now wraps inside the
 * link columns' width instead.
 */
import { useEffect, useRef } from "react";
import { Heart, Mail } from "lucide-react";
import type { Locale } from "@/lib/i18n";
import { CONTACT_EMAIL, DASHBOARD_URL, HOME_URL } from "@/lib/site";
import PixelGrid from "./home/PixelGrid";

// Background pixel-grid cell size; the social buttons are sized and snapped to
// this so each one sits exactly on one grid square. Keep in sync with the
// PixelGrid cellSize/gap props below.
const GRID_CELL = 52;

const FOOTER_COPY = {
  en: {
    tagline: "Turn any website into a store. Embed a portable storefront anywhere and own your revenue stream.",
    explore: "Explore",
    legal: "Legal",
    contact: "Contact",
    links: ["How It Works", "Our Story", "Get Started", "Sign In"],
    legalLinks: ["Privacy Policy", "Cookie Policy", "Terms of Service", "Accessibility"],
    rights: "© 2026 Square Share. All rights reserved.",
    madeWith: "Made with",
    love: "love",
    byThe: "and passion by the",
    team: "team",
  },
  cs: {
    tagline: "Udělejte z jakéhokoli webu obchod. Vložte přenosnou výlohu kamkoli a mějte své tržby pod kontrolou.",
    explore: "Procházet",
    legal: "Právní informace",
    contact: "Kontakt",
    links: ["Jak to funguje", "Náš příběh", "Začít", "Přihlásit se"],
    legalLinks: ["Ochrana osobních údajů", "Zásady cookies", "Obchodní podmínky", "Přístupnost"],
    rights: "© 2026 Square Share. Všechna práva vyhrazena.",
    madeWith: "Vyrobeno s",
    love: "láskou",
    byThe: "a nadšením týmem",
    team: "",
  },
} as const;

const FOOTER_HREFS = [`${HOME_URL}/#features`, `${HOME_URL}/#founder`, `${HOME_URL}/#hero`, `${DASHBOARD_URL}/login`];
const LEGAL_HREFS = [
  `${HOME_URL}/legal/privacy-policy/`,
  `${HOME_URL}/legal/cookie-policy/`,
  `${HOME_URL}/terms`,
  `${HOME_URL}/accessibility`,
];

// Brand glyphs (simple-icons path data): lucide dropped brand marks for
// trademark reasons, so we inline the SVG paths here.
const BRAND_PATHS = {
  instagram:
    "M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z",
  github:
    "M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222 0 1.606-.014 2.898-.014 3.293 0 .322.216.694.825.576C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12",
} as const;

// Only these two profiles are live for now; add more here as they launch.
const socialLinks = [
  { label: "Instagram", href: "https://www.instagram.com/_squareshare", path: BRAND_PATHS.instagram },
  { label: "GitHub", href: "https://github.com/squaresharedev", path: BRAND_PATHS.github },
];

export function SiteFooter({ locale }: { locale: Locale }) {
  const copy = FOOTER_COPY[locale];
  const footerRef = useRef<HTMLElement>(null);
  const socialRef = useRef<HTMLDivElement>(null);

  // Snap the social row onto the background grid. The grid is drawn on the
  // canvas starting at its top-left, so we measure the row's offset from the
  // canvas and nudge it to the nearest cell boundary on both axes.
  useEffect(() => {
    const footer = footerRef.current;
    const social = socialRef.current;
    if (!footer || !social) return;

    const align = () => {
      const canvas = footer.querySelector("canvas");
      const origin = (canvas ?? footer).getBoundingClientRect();
      social.style.transform = ""; // reset to read the natural position
      const rect = social.getBoundingClientRect();
      const offX = rect.left - origin.left;
      const offY = rect.top - origin.top;
      const dx = Math.round(offX / GRID_CELL) * GRID_CELL - offX;
      const dy = Math.round(offY / GRID_CELL) * GRID_CELL - offY;
      social.style.transform = `translate(${dx}px, ${dy}px)`;
    };

    align();
    // Re-align after the first couple of frames and once webfonts settle:
    // those reflows move the row without changing the footer's size, so the
    // ResizeObserver alone would miss them and leave a stale offset.
    const raf1 = requestAnimationFrame(align);
    const raf2 = requestAnimationFrame(() => requestAnimationFrame(align));
    document.fonts?.ready.then(align).catch(() => {});

    // Watch the row's own size/position as well as the footer's, and catch
    // browser-zoom / viewport changes via window resize.
    const ro = new ResizeObserver(align);
    ro.observe(footer);
    ro.observe(social);
    window.addEventListener("resize", align, { passive: true });
    return () => {
      cancelAnimationFrame(raf1);
      cancelAnimationFrame(raf2);
      ro.disconnect();
      window.removeEventListener("resize", align);
    };
  }, []);

  return (
    <footer ref={footerRef} className="relative isolate overflow-hidden border-t border-white/10 bg-black">
      {/* Interactive pixel grid: lights up in acid near the cursor.
          cellSize/gap are tuned so one lit square == one social button (48px). */}
      <PixelGrid color="#a855f7" cellSize={52} gap={4} className="absolute inset-0 z-0" />

      {/* Subtle seam fade so the brand row stays crisp against the section above */}
      <div className="pointer-events-none absolute inset-x-0 top-0 z-[1] h-24 bg-gradient-to-b from-black to-transparent" />

      <div className="relative z-10 mx-auto max-w-7xl px-6 pt-24 pb-10">
        <div className="flex flex-col gap-12 xl:flex-row xl:items-stretch xl:justify-between">
          {/* Left: tagline above the giant wordmark */}
          <div className="xl:max-w-[58%]">
            <p className="mb-8 max-w-sm text-sm leading-relaxed text-white/40">{copy.tagline}</p>
            <div
              aria-hidden="true"
              className="footer-wordmark select-none text-[clamp(2.5rem,11vw,9rem)] font-black uppercase leading-[0.82] tracking-tighter"
            >
              Square Share
            </div>
          </div>

          {/* Right: nav columns at top, divider + credit pinned to the bottom */}
          <div className="flex flex-col xl:shrink-0">
            <div className="flex flex-col gap-10 sm:flex-row sm:gap-12">
              <nav className="flex flex-col gap-3" aria-label={copy.explore}>
                {copy.links.map((label, index) => (
                  <a
                    key={label}
                    href={FOOTER_HREFS[index]}
                    className="font-mono text-xs uppercase tracking-widest text-white/50 transition-colors duration-200 hover:text-acid"
                  >
                    {label}
                  </a>
                ))}
              </nav>
              <nav className="flex flex-col gap-3" aria-label={copy.legal}>
                {copy.legalLinks.map((label, index) => (
                  <a
                    key={label}
                    href={LEGAL_HREFS[index]}
                    className="font-mono text-xs uppercase tracking-widest text-white/50 transition-colors duration-200 hover:text-acid"
                  >
                    {label}
                  </a>
                ))}
              </nav>
              <div className="flex flex-col gap-3">
                <span className="font-mono text-xs uppercase tracking-widest text-white/30">{copy.contact}</span>
                <a
                  href={`mailto:${CONTACT_EMAIL}`}
                  className="group inline-flex items-center gap-2 font-mono text-xs tracking-widest text-white/50 transition-colors duration-200 hover:text-acid"
                >
                  <Mail size={14} strokeWidth={2} className="shrink-0" />
                  {CONTACT_EMAIL}
                </a>
                <div ref={socialRef} className="mt-6 flex items-center gap-1">
                  {socialLinks.map(({ label, href, path }) => (
                    <a
                      key={label}
                      href={href}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={label}
                      className="group flex h-12 w-12 items-center justify-center border border-white/10 text-white/50 transition-colors duration-200 hover:border-acid hover:bg-acid hover:text-black hover:shadow-[0_0_24px_-2px_rgba(168,85,247,0.55)]"
                    >
                      <svg
                        viewBox="0 0 24 24"
                        width={18}
                        height={18}
                        fill="currentColor"
                        aria-hidden="true"
                        className="transition-transform duration-200 ease-out group-hover:scale-125"
                      >
                        <path d={path} />
                      </svg>
                    </a>
                  ))}
                </div>
              </div>
            </div>

            {/* Divider + credit, bottom-aligned with the wordmark */}
            {/* w-0 min-w-full: the credit takes the link columns' width and wraps, instead of widening the column. */}
            <div className="mt-12 border-t border-white/10 pt-6 xl:mt-auto xl:w-0 xl:min-w-full xl:pt-24">
              <div className="flex flex-col items-center gap-2 text-sm sm:flex-row sm:flex-wrap sm:justify-end sm:gap-x-6">
                <span className="font-mono text-white/40">{copy.rights}</span>
                <p className="inline-flex flex-wrap items-center justify-center gap-x-1.5 gap-y-1 text-white/40">
                  {copy.madeWith}
                  <Heart size={13} aria-label={copy.love} className="fill-acid text-acid" />
                  {copy.byThe}{" "}
                  <a
                    href="https://rootlabs.studio"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-semibold text-white/60 underline decoration-white/20 underline-offset-2 transition-colors duration-200 hover:text-acid hover:decoration-acid"
                  >
                    Root Labs
                  </a>{" "}
                  {copy.team}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
