import type { VisualCopy } from "@/lib/copy";
import { BrowserFrame, Cursor, Photo, type Product } from "./parts";

/** Bento tiles on a 4 x 3 grid: [product, column, row, width, height]. */
const TILES: [Product, number, number, number, number][] = [
  ["camera", 1, 1, 2, 2],
  ["monstera", 3, 1, 1, 1],
  ["watch", 4, 1, 1, 1],
  ["headphones", 3, 2, 2, 2],
  ["succulent", 1, 3, 1, 1],
  ["mouse", 2, 3, 1, 1],
];

/** A storefront embedded on the seller's own site, a buyer's cursor on a product. */
export function StorefrontVisual({ copy }: { copy: VisualCopy }) {
  return (
    <BrowserFrame url={copy.domain} className="w-full">
      <div className="flex items-center justify-between border-b border-fd-border px-3 py-2">
        <span className="font-display text-xs font-bold text-fd-foreground">{copy.store}</span>
        <span className="flex gap-2.5 font-inter text-[9px] text-fd-muted-foreground">
          {copy.nav.map((item) => (
            <span key={item}>{item}</span>
          ))}
        </span>
      </div>
      <div className="relative p-2.5">
        <div className="grid aspect-[4/3] grid-cols-4 grid-rows-3 gap-1.5">
          {TILES.map(([product, column, row, width, height]) => (
            <Photo
              key={product}
              product={product}
              className="rounded-sm border border-fd-border"
              style={{ gridColumn: `${column} / span ${width}`, gridRow: `${row} / span ${height}` }}
            />
          ))}
        </div>
        <Cursor label={copy.customer} className="right-[22%] top-[58%]" />
      </div>
    </BrowserFrame>
  );
}
