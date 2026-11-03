import { BRAND_NAME } from "@/lib/site";
import type { Copy } from "@/lib/copy";
import type { Locale } from "@/lib/i18n";
import { KEY_PAGES } from "@/lib/routes";
import { ButtonLink } from "./ButtonLink";
import { HeroCursors, PixelSkyline } from "./visuals/HeroDecor";

/** The brand name in white, the rest of the title in the purple accent, like the homepage's "into sales". */
function Title({ text }: { text: string }) {
  const index = text.indexOf(BRAND_NAME);
  if (index < 0) return <>{text}</>;
  const before = text.slice(0, index).trim();
  const after = text.slice(index + BRAND_NAME.length).trim();
  return (
    <>
      {before ? <span className="text-acid">{before} </span> : null}
      <span>{BRAND_NAME}</span>
      {after ? <span className="text-acid"> {after}</span> : null}
    </>
  );
}

/**
 * The docs home's opening, in the homepage's language: black, a heavy
 * headline with one purple accent, purple cursors and a pixel edge. It holds
 * the page's one h1.
 */
export function DocsHomeHero({
  title,
  lead,
  locale,
  copy,
}: {
  title: string;
  lead: string;
  locale: Locale;
  copy: Copy;
}) {
  return (
    <div className="not-prose docs-hero-frame">
      <section className="dark docs-hero relative isolate overflow-hidden bg-fd-background px-6 pt-16 pb-24 text-fd-foreground sm:px-10 sm:pt-20 sm:pb-28">
        <HeroCursors />
        <p className="relative m-0 font-inter text-xs font-medium uppercase tracking-wide text-fd-muted-foreground">
          {BRAND_NAME} / {copy.docsLabel}
        </p>
        <h1 className="relative mt-4 mb-0 max-w-3xl font-display text-4xl leading-[1.05] font-bold tracking-tight sm:text-6xl">
          <Title text={title} />
        </h1>
        <p className="relative mt-5 mb-0 max-w-xl text-base text-fd-muted-foreground sm:text-lg">{lead}</p>
        <div className="relative mt-8 flex flex-wrap gap-3">
          <ButtonLink href={KEY_PAGES[locale].addStorefront}>{copy.heroPrimary}</ButtonLink>
          <ButtonLink href={KEY_PAGES[locale].whatIs} variant="outline">
            {copy.heroSecondary}
          </ButtonLink>
        </div>
        <PixelSkyline />
      </section>
    </div>
  );
}
