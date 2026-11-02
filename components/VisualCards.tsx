import { Children, cloneElement, isValidElement, type ReactElement, type ReactNode } from "react";
import { cn } from "@/lib/cn";
import type { VisualCopy } from "@/lib/copy";
import { Illustration, isVisualKind } from "./visuals/Illustration";

type WithChildren = ReactElement<{ children?: ReactNode; className?: string }>;

function elementsOf(node: ReactNode): WithChildren[] {
  return Children.toArray(node).filter((child): child is WithChildren => isValidElement(child));
}

/**
 * Wraps a Markdown list and draws one illustration beside each item, in the
 * order given by `visuals` ("storefront button ai"). The content stays a plain
 * Markdown list, so the `.md` version, llms-full.txt and search read it as is.
 *
 * - "guides": big link cards, the whole card clicks through to the item's link.
 * - "features": the same cards without a link.
 */
export function VisualCards({
  visuals,
  variant,
  copy,
  children,
}: {
  visuals: string;
  variant: "guides" | "features";
  copy: VisualCopy;
  children: ReactNode;
}) {
  const kinds = visuals.split(/\s+/).filter(Boolean);

  return (
    <div className={cn("visual-cards", `visual-cards-${variant}`)}>
      {elementsOf(children).map((list, listIndex) =>
        cloneElement(
          list,
          { key: listIndex },
          elementsOf(list.props.children).map((item, index) => {
            const kind = kinds[index];
            return cloneElement(
              item,
              { key: index, className: "visual-card" },
              isVisualKind(kind) ? <Illustration kind={kind} copy={copy} className="visual-card-picture" /> : null,
              <div className="visual-card-body">{item.props.children}</div>,
            );
          }),
        ),
      )}
    </div>
  );
}
