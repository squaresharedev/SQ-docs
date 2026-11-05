import type { ComponentType, ReactNode } from "react";
import { ChevronRight } from "lucide-react";
import { transitionClass } from "@squaresharedev/tokens";
import { cn } from "@/lib/cn";
import { DocsLink } from "./DocsLink";

/** The ART_BLEED of the dashboard's SettingsCard: the art's top and right edges are the card's own. */
const ART_BLEED_CLASS = "sm:-mr-7 sm:-mt-7";

/**
 * An article's header, drawn like the dashboard's settings lead card
 * (Store/src/components/settings/SettingsCard.tsx): a sharp bordered panel,
 * its corner art flush in the top-right corner beside the title, shown only
 * when the header is wide enough to keep a readable text column. The trail is
 * an ordered list laid out inline, so it reads as the steps of a path.
 */
export function PageHeader({
  title,
  trail,
  trailLabel,
  Art,
  children,
}: {
  title: string;
  /** Docs home and the page's sections; the title below names the page itself. */
  trail: { name: string; url?: string }[];
  /** The trail's name for screen readers, in the page's language. */
  trailLabel: string;
  Art?: ComponentType<{ className?: string }>;
  children?: ReactNode;
}) {
  return (
    <div className="not-prose border border-fd-border bg-fd-background p-6 sm:p-7">
      <div className="@container flex items-start gap-6">
        <div className="min-w-0 flex-1">
          <nav aria-label={trailLabel} className="eyebrow mb-3 text-fd-muted-foreground">
            <ol className="inline">
              {trail.map((item, index) => (
                <li key={`${item.name}${index}`} className="inline">
                  {index > 0 ? <ChevronRight className="mx-1 inline size-3.5 align-[-2px]" aria-hidden="true" /> : null}
                  {item.url ? (
                    <DocsLink href={item.url} className={cn("hover:text-fd-foreground", transitionClass)}>
                      {item.name}
                    </DocsLink>
                  ) : (
                    <span>{item.name}</span>
                  )}
                </li>
              ))}
            </ol>
          </nav>
          <h1 className="docs-title m-0 text-fd-foreground">{title}</h1>
          {children}
        </div>
        {Art ? <Art className={`hidden @xl:block ${ART_BLEED_CLASS}`} /> : null}
      </div>
    </div>
  );
}
