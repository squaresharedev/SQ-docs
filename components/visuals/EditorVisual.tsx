import type { VisualCopy } from "@/lib/copy";
import { Photo } from "./parts";

const CELLS = Array.from({ length: 12 }, (_, index) => index);

/** Slider value as a share of the track: [label, fill]. */
function sliders(copy: VisualCopy): [string, string][] {
  return [
    [copy.spacing, "40%"],
    [copy.corners, "65%"],
    [copy.rotation, "30%"],
  ];
}

/** The storefront editor in grid mode: a selected tile on the grid, design controls beside it. */
export function EditorVisual({ copy }: { copy: VisualCopy }) {
  return (
    <div className="grid w-full grid-cols-[1fr_auto] overflow-hidden border border-fd-border bg-fd-card shadow-lg">
      <div className="relative bg-fd-secondary p-2.5">
        <div className="grid aspect-[4/3] grid-cols-4 grid-rows-3 gap-1.5">
          {CELLS.map((cell) => (
            <span key={cell} className="border border-dashed border-fd-muted-foreground/40" />
          ))}
        </div>
        <div className="absolute inset-2.5 grid aspect-[4/3] grid-cols-4 grid-rows-3 gap-1.5">
          <span className="relative col-span-2 row-span-2 outline-2 outline-offset-2 outline-acid">
            <Photo product="camera" className="size-full rounded-md" />
            <span className="absolute -right-1.5 -bottom-1.5 size-2.5 border-2 border-acid bg-fd-card" />
            <span className="absolute -top-1.5 -left-1.5 size-2.5 border-2 border-acid bg-fd-card" />
          </span>
          <Photo product="succulent" className="col-start-4 row-start-2 rotate-6 rounded-md shadow-md" />
        </div>
      </div>
      <div className="flex w-28 flex-col gap-3 border-s border-fd-border p-3 sm:w-36">
        {sliders(copy).map(([label, fill]) => (
          <div key={label} className="flex flex-col gap-1.5">
            <span className="font-inter text-[9px] text-fd-muted-foreground">{label}</span>
            <span className="relative block h-1 bg-fd-muted">
              <span className="absolute inset-y-0 left-0 bg-fd-foreground" style={{ width: fill }} />
              <span
                className="absolute top-1/2 size-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-fd-foreground bg-fd-card"
                style={{ left: fill }}
              />
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
