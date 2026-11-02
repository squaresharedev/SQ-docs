import type { ReactNode } from "react";
import { COPY } from "@/lib/copy";
import type { Locale } from "@/lib/i18n";
import { KEY_PAGES } from "@/lib/routes";
import { BRAND_NAME, CONTACT_EMAIL, DASHBOARD_URL, HOME_URL } from "@/lib/site";
import { DocsLink } from "./DocsLink";

/**
 * The homepage's footer: black over a faint grid, mono uppercase links and
 * the giant wordmark. Always dark, whichever theme the page is in.
 */
export function SiteFooter({ locale }: { locale: Locale }) {
  const copy = COPY[locale];
  const pages = KEY_PAGES[locale];
  const docsLinks = [
    { href: pages.whatIs, label: copy.heroSecondary },
    { href: pages.addStorefront, label: copy.heroPrimary },
    { href: pages.glossary, label: copy.footerGlossary },
  ];
  const productLinks = [
    { href: HOME_URL, label: copy.mainSiteLink },
    { href: DASHBOARD_URL, label: copy.footerDashboard },
    { href: `mailto:${CONTACT_EMAIL}`, label: CONTACT_EMAIL },
  ];

  return (
    <footer className="dark site-footer relative isolate overflow-hidden bg-fd-background text-fd-foreground">
      <div className="relative mx-auto grid max-w-6xl gap-10 px-6 pt-16 pb-8 md:grid-cols-[1.4fr_1fr_1fr] md:px-10">
        <p className="m-0 max-w-sm text-sm text-fd-muted-foreground">{copy.footerTagline}</p>
        <FooterColumn title={copy.footerDocs}>
          {docsLinks.map((link) => (
            <li key={link.href}>
              <DocsLink href={link.href} className="footer-link">
                {link.label}
              </DocsLink>
            </li>
          ))}
        </FooterColumn>
        <FooterColumn title={copy.footerProduct}>
          {productLinks.map((link) => (
            <li key={link.href}>
              <a href={link.href} className="footer-link">
                {link.label}
              </a>
            </li>
          ))}
        </FooterColumn>
      </div>
      <p
        aria-hidden="true"
        className="relative m-0 px-4 font-display text-[clamp(3rem,14vw,11rem)] leading-[0.82] font-bold tracking-tighter whitespace-nowrap uppercase select-none md:px-8"
      >
        {BRAND_NAME}
      </p>
      <p className="relative m-0 border-t border-fd-border px-6 py-5 font-mono text-[11px] tracking-wide text-fd-muted-foreground md:px-10">
        {copy.footerOperator}
      </p>
    </footer>
  );
}

function FooterColumn({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div>
      <p className="m-0 mb-4 font-mono text-[11px] uppercase tracking-widest text-fd-muted-foreground">{title}</p>
      <ul className="m-0 flex list-none flex-col gap-3 p-0">{children}</ul>
    </div>
  );
}
