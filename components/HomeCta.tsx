import type { Copy } from "@/lib/copy";
import { HOME_URL } from "@/lib/site";

/**
 * The box at the bottom of every docs page: the way from a docs answer to
 * squareshare.eu, under a link text that says where it goes (search engines
 * read the words of a link as a description of its target, so "Create your
 * free SquareShare storefront" beats "Get started"). It carries a data-track
 * name for the GA4 events in lib/analytics.ts. No sign-in link until seller
 * sign-up opens on squareshare.eu.
 */
export function HomeCta({ copy }: { copy: Copy }) {
  return (
    <aside aria-labelledby="home-cta-title" className="not-prose mt-12 border border-fd-border p-6 sm:p-8">
      {/* Not a heading: the box is the same on every page and is not part of
          the page's content, so it stays out of the outline (and the .md). */}
      <p id="home-cta-title" className="m-0 font-display text-xl font-semibold tracking-tight text-fd-foreground sm:text-2xl">
        {copy.ctaTitle}
      </p>
      <p className="mt-2 mb-0 max-w-xl text-fd-muted-foreground">{copy.ctaBody}</p>
      <div className="mt-6">
        <a
          href={`${HOME_URL}/`}
          className="docs-button"
          data-external=""
          data-track="get_started_click"
          data-placement="docs-page-cta"
        >
          {copy.ctaPrimary}
        </a>
      </div>
    </aside>
  );
}
