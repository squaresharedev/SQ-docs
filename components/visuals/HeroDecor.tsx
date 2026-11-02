/**
 * The homepage hero's ornaments, drawn statically: purple outline cursors
 * (some soft, as if out of focus) and a pixel skyline where the dark hero
 * meets the page. Decorative; the hero marks them aria-hidden.
 */

const POINTER = "M4 2.2 L4 18.8 L8.3 14.6 L11.1 21 L13.8 19.8 L11 13.5 L16.7 13.2 Z";

/**
 * [left, top, width, rotation, blur px, opacity, outline only, hide on phones].
 * Kept to the right and the corners, clear of the headline and buttons.
 */
const CURSORS: [string, string, string, number, number, number, boolean, boolean][] = [
  ["80%", "12%", "5rem", 64, 0, 1, false, true],
  ["90%", "56%", "3.25rem", -30, 0, 0.9, false, true],
  ["64%", "64%", "8.5rem", -38, 7, 0.5, false, false],
  ["-3%", "-16%", "7rem", 150, 10, 0.35, false, false],
  ["60%", "8%", "1.5rem", 20, 0, 0.5, true, true],
  ["72%", "40%", "1.3rem", -70, 0, 0.45, true, true],
  ["50%", "84%", "1.2rem", -20, 0, 0.4, true, true],
];

export function HeroCursors() {
  return (
    <span aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
      {CURSORS.map(([left, top, width, rotate, blur, opacity, plain, hideOnPhones]) => (
        <svg
          key={`${left}${top}`}
          viewBox="2.5 0.7 15.7 21.8"
          className={hideOnPhones ? "absolute max-sm:hidden" : "absolute"}
          style={{
            left,
            top,
            width,
            opacity,
            rotate: `${rotate}deg`,
            filter: blur ? `blur(${blur}px)` : undefined,
          }}
        >
          <path
            d={POINTER}
            fill="none"
            className={plain ? "stroke-fd-muted-foreground" : "stroke-acid"}
            strokeWidth={plain ? 0.9 : 1.3}
            strokeLinejoin="round"
          />
        </svg>
      ))}
    </span>
  );
}

/** Column depths of the skyline, in cells (deterministic, like the homepage's fixed scatter). */
const DEPTHS = [3, 2, 1, 2, 2, 3, 1, 2, 3, 3, 1, 1, 2, 3, 2, 1, 2, 3, 2, 2, 1, 3, 2, 1];
const ROWS = 3;

/** Squares of the page colour climbing into the dark hero's bottom edge. */
export function PixelSkyline() {
  const columns = DEPTHS.length;
  let d = `M0 ${ROWS}`;
  DEPTHS.forEach((depth, column) => {
    d += `V${ROWS - depth}H${column + 1}`;
  });
  d += `V${ROWS}Z`;
  return (
    <svg
      aria-hidden="true"
      viewBox={`0 0 ${columns} ${ROWS}`}
      preserveAspectRatio="none"
      shapeRendering="crispEdges"
      className="pointer-events-none absolute inset-x-0 bottom-0 block h-10 w-full sm:h-14"
    >
      <path d={d} style={{ fill: "var(--page-bg)" }} />
    </svg>
  );
}
