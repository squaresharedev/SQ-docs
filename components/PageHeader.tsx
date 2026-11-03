import { Fragment, type ComponentType, type ReactNode } from "react";
import { ChevronRight } from "lucide-react";
import { DocsLink } from "./DocsLink";

/** The ART_BLEED of the dashboard's SettingsCard: the art's top and right edges are the card's own. */
const ART_BLEED_CLASS = "sm:-mr-7 sm:-mt-7";

/**
 * An article's header, drawn like the dashboard's settings lead card
 * (Store/src/components/settings/SettingsCard.tsx): a sharp bordered panel,
 * its corner art flush in the top-right corner beside the title, shown only
 * when the header is wide enough to keep a readable text column.
 */
export function PageHeader({
  title,
  trail,
  Art,
  children,
}: {
  title: string;
  /** Docs home and the page's sections; the title below names the page itself. */
  trail: { name: string; url?: string }[];
  Art?: ComponentType<{ className?: string }>;
  children?: ReactNode;
}) {
  return (
    <div className="not-prose border border-fd-border bg-fd-background p-6 sm:p-7">
      <div className="@container flex items-start gap-6">
        <div className="min-w-0 flex-1">
          <nav aria-label="Breadcrumb" className="mb-3 font-inter text-xs font-medium uppercase tracking-wide text-fd-muted-foreground">
            {trail.map((item, index) => (
              <Fragment key={`${item.name}${index}`}>
                {index > 0 ? <ChevronRight className="mx-1 inline size-3.5 align-[-2px]" aria-hidden="true" /> : null}
                {item.url ? (
                  <DocsLink href={item.url} className="transition-colors hover:text-fd-foreground">
                    {item.name}
                  </DocsLink>
                ) : (
                  <span>{item.name}</span>
                )}
              </Fragment>
            ))}
          </nav>
          <h1 className="docs-title m-0 text-fd-foreground">{title}</h1>
          {children}
        </div>
        {Art ? <Art className={`hidden @xl:block ${ART_BLEED_CLASS}`} /> : null}
      </div>
    </div>
  );
}
