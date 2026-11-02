import { readFileSync } from "node:fs";
import { join } from "node:path";

/**
 * Reads colour values straight from @squaresharedev/tokens/tokens.css, for
 * places CSS variables cannot reach (the Open Graph image renderer). Nothing
 * is copied: change the package and the images follow on the next build.
 */
const tokensCss = readFileSync(join(process.cwd(), "node_modules/@squaresharedev/tokens/tokens.css"), "utf8");

function block(selector: string): string {
  const start = tokensCss.search(new RegExp(`(^|\\n)${selector.replace(".", "\\.")}\\s*\\{`));
  if (start < 0) throw new Error(`tokens.css has no ${selector} block`);
  const open = tokensCss.indexOf("{", start);
  return tokensCss.slice(open + 1, tokensCss.indexOf("}", open));
}

function read(source: string, name: string): string {
  const match = source.match(new RegExp(`${name}:\\s*([^;]+);`));
  if (!match?.[1]) throw new Error(`tokens.css has no ${name}`);
  return match[1].trim();
}

/** sRGB hex for `#rrggbb` or an achromatic `oklch(L 0 0)`, the forms the tokens use for these colours. */
function toHex(value: string): string {
  if (/^#[0-9a-f]{6}$/i.test(value)) return value;
  const oklch = value.match(/^oklch\(\s*([\d.]+)\s+0\s+0\s*\)$/);
  if (!oklch?.[1]) throw new Error(`Cannot convert token value ${value}`);
  // With chroma 0, OKLab l = m = s = L, so linear sRGB is L cubed on every channel.
  const linear = Number(oklch[1]) ** 3;
  const encoded = linear <= 0.0031308 ? 12.92 * linear : 1.055 * linear ** (1 / 2.4) - 0.055;
  const byte = Math.round(Math.min(1, Math.max(0, encoded)) * 255);
  return `#${byte.toString(16).padStart(2, "0").repeat(3)}`;
}

const dark = block(".dark");

/** The brand's dark palette (black surface, white text, purple accent). */
export const OG_COLORS = {
  background: toHex(read(dark, "--background")),
  foreground: toHex(read(dark, "--foreground")),
  muted: toHex(read(dark, "--muted-foreground")),
  accent: toHex(read(tokensCss, "--color-acid")),
};
