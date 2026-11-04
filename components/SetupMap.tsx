/*
 * Copied from the dashboard: Store/src/components/onboarding/SetupMap.tsx (the
 * line and its stations) and the row layout of Store/src/components/onboarding/
 * SetupChecklist.tsx. Changes: static, with no "just done" moments; every
 * station is drawn as a brand-new account sees it (the first step to take now,
 * the rest ahead); the rows wrap a Markdown list, so the `.md` version keeps
 * the steps (see lib/source.ts).
 */
import { Children, isValidElement, type ReactElement, type ReactNode } from "react";
import {
  TRANSIT_JOG as JOG,
  TRANSIT_LINE_TONE as LINE_TONE,
  TRANSIT_LINE_WIDTH as WIDTH,
  TRANSIT_OFFSET as OFFSET,
  TRANSIT_STATION as STATION,
  transitBend,
} from "@/components/transit-styles";
import { cn } from "@/lib/cn";

/** A station's centre, down from the top of its row: the row's divider (1px),
 *  its py-3 and half the label's 1.25rem line, so it sits level with the label. */
const STATION_TOP_CLASS = "top-[calc(1.375rem+1px)]";

/** Stations sit OFFSET either side of the column's centre, a jog apart. */
const stationLeft = (side: 0 | 1) => `calc(50% ${side === 0 ? "-" : "+"} ${OFFSET}px)`;

/** A stretch still ahead: before any step is done, every stretch is. */
function Line({ fromSide, toSide }: { fromSide: 0 | 1; toSide: 0 | 1 }) {
  const x = (side: 0 | 1) => (side === 0 ? WIDTH : WIDTH + JOG);
  const a = x(fromSide);
  const b = x(toSide);
  // An S-bend from one run to the next, its ends tucked into the straight runs.
  const bend = `M ${a} -2 L ${a} 0 ${transitBend(0, a, b, (along, across) => `${across} ${along}`)} L ${b} ${JOG + 2}`;
  const run = (side: 0 | 1) => (
    <span className="flex-1 -translate-x-1/2 bg-current" style={{ marginLeft: stationLeft(side), width: WIDTH }} />
  );
  return (
    <span className={cn("absolute inset-x-0 flex h-full flex-col", STATION_TOP_CLASS, LINE_TONE.todo)}>
      {run(fromSide)}
      <svg
        viewBox={`0 0 ${JOG + WIDTH * 2} ${JOG}`}
        className="mx-auto shrink-0 overflow-visible"
        style={{ width: JOG + WIDTH * 2, height: JOG }}
      >
        <path d={bend} fill="none" stroke="currentColor" strokeWidth={WIDTH} strokeLinejoin="round" />
      </svg>
      {run(toSide)}
    </span>
  );
}

function Station({ look, side }: { look: "current" | "todo"; side: 0 | 1 }) {
  return (
    <span
      className={cn(
        "absolute flex -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full",
        STATION_TOP_CLASS,
        STATION[look],
      )}
      style={{ left: stationLeft(side) }}
    />
  );
}

type Element = ReactElement<{ children?: ReactNode }>;

function elementsOf(node: ReactNode): Element[] {
  return Children.toArray(node).filter((child): child is Element => isValidElement(child));
}

/**
 * THE SETUP MAP around an ordered list: each item is a row with its station on
 * the line, the first one the step to take now. Write each item as a bold
 * label, a line break and one sentence; the label draws like the dashboard's
 * step label and the sentence like its detail line.
 */
export function SetupMap({ children }: { children: ReactNode }) {
  const list = elementsOf(children)[0];
  const items = list ? elementsOf(list.props.children) : [];
  const last = items.length - 1;

  return (
    <div className="setup-map not-prose [--map:3.5rem] [--map-gap:0.75rem]">
      <ol className="relative">
        {items.map((item, index) => {
          // Stations alternate left (0) and right (1) of the column's centre.
          const side = (index % 2) as 0 | 1;
          const toSide = ((index + 1) % 2) as 0 | 1;
          return (
            <li key={index} className="grid grid-cols-[var(--map)_minmax(0,1fr)] gap-x-(--map-gap)">
              <div aria-hidden className="relative">
                {index < last && <Line fromSide={side} toSide={toSide} />}
                <Station look={index === 0 ? "current" : "todo"} side={side} />
              </div>
              <div className={cn("setup-map-row border-t py-3", index > 0 ? "border-fd-border" : "border-transparent")}>
                {item.props.children}
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
