import { Children, cloneElement, isValidElement, type ReactElement, type ReactNode } from "react";
import { PAGE_ICONS } from "@/lib/icons";
import { allPages } from "@/lib/pairing";

type Element = ReactElement<{ children?: ReactNode; href?: string }>;

function elementsOf(node: ReactNode): Element[] {
  return Children.toArray(node).filter((child): child is Element => isValidElement(child));
}

/** The first link's target inside a list item. */
function hrefOf(node: ReactNode): string | undefined {
  for (const child of elementsOf(node)) {
    if (typeof child.props.href === "string") return child.props.href;
    const nested = hrefOf(child.props.children);
    if (nested) return nested;
  }
  return undefined;
}

/**
 * Wraps a plain Markdown list of links and lays it out as cards, each with
 * its page's icon (the one the sidebar shows). The content stays a Markdown
 * list, so the `.md` version and llms-full.txt get the same links and
 * descriptions.
 */
export function SectionCards({ children }: { children: ReactNode }) {
  const keyByUrl = new Map(allPages().map((page) => [page.url, page.data.translationKey]));

  return (
    <div className="section-cards">
      {elementsOf(children).map((list, listIndex) =>
        cloneElement(
          list,
          { key: listIndex },
          elementsOf(list.props.children).map((item, index) => {
            const href = hrefOf(item.props.children)?.split("#")[0];
            const Icon = href ? PAGE_ICONS[keyByUrl.get(href) ?? ""] : undefined;
            return cloneElement(
              item,
              { key: index },
              Icon ? (
                <span className="section-card-icon" aria-hidden="true">
                  <Icon />
                </span>
              ) : null,
              ...Children.toArray(item.props.children),
            );
          }),
        ),
      )}
    </div>
  );
}
