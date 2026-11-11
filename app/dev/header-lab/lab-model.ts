/**
 * The header lab's model: option lists, slider specs, the look in the address
 * bar, Copy JSX and Shuffle. Defaults are the component's own
 * HEADER_ACTIONS_LOOK, never a copy.
 */
import {
  HEADER_ACTIONS_LOOK,
  type HeaderActionsLook,
  type HeaderCtaStyle,
  type HeaderFrame,
  type HeaderLangStyle,
  type HeaderThemeStyle,
} from "@/components/HeaderActions";
import { between, changedProps, decodeLabHash, encodeLabHash, pick } from "../lab-kit/state";

export const LANG_STYLES: readonly { value: HeaderLangStyle; label: string }[] = [
  { value: "text", label: "Text: EN / CS" },
  { value: "swap", label: "Swap: globe + other language" },
  { value: "menu", label: "Menu: globe opens a list" },
  { value: "quiet", label: "Segmented, grey current" },
  { value: "segmented", label: "Segmented, filled current" },
];

export const THEME_STYLES: readonly { value: HeaderThemeStyle; label: string }[] = [
  { value: "icon", label: "One icon button" },
  { value: "segmented", label: "Sun and moon cells" },
  { value: "pill", label: "Fumadocs toggle (first version)" },
];

export const CTA_STYLES: readonly { value: HeaderCtaStyle; label: string }[] = [
  { value: "filled-arrow", label: "Filled with arrow" },
  { value: "filled", label: "Filled, no arrow" },
  { value: "outline-arrow", label: "Outline with arrow" },
  { value: "link-arrow", label: "Text link with arrow" },
];

export const FRAMES: readonly { value: HeaderFrame; label: string }[] = [
  { value: "bare", label: "Bare: no borders" },
  { value: "joined", label: "Joined: one strip" },
  { value: "separate", label: "Separate boxes" },
];

export const SLIDERS = {
  height: { label: "Control height", min: 28, max: 44, step: 2, unit: "px" },
  gap: { label: "Gap", min: 0, max: 20, step: 2, unit: "px" },
} as const;

/** A preset's partial look over the defaults. */
export const withDefaults = (look: Partial<HeaderActionsLook>): HeaderActionsLook => ({ ...HEADER_ACTIONS_LOOK, ...look });

const oneOf = <T,>(value: unknown, list: readonly { value: T }[]): value is T => list.some((item) => item.value === value);

/** The look from a link; anything unreadable falls back to the default. */
export function lookFromHash(hash: string): HeaderActionsLook {
  const raw = decodeLabHash(hash);
  if (!raw) return HEADER_ACTIONS_LOOK;
  const look = { ...HEADER_ACTIONS_LOOK };
  if (oneOf(raw.lang, LANG_STYLES)) look.lang = raw.lang;
  if (oneOf(raw.theme, THEME_STYLES)) look.theme = raw.theme;
  if (oneOf(raw.cta, CTA_STYLES)) look.cta = raw.cta;
  if (oneOf(raw.frame, FRAMES)) look.frame = raw.frame;
  if (typeof raw.height === "number" && raw.height >= SLIDERS.height.min && raw.height <= SLIDERS.height.max) look.height = raw.height;
  if (typeof raw.gap === "number" && raw.gap >= SLIDERS.gap.min && raw.gap <= SLIDERS.gap.max) look.gap = raw.gap;
  if (typeof raw.divider === "boolean") look.divider = raw.divider;
  if (raw.themeIcons === "line" || raw.themeIcons === "fill") look.themeIcons = raw.themeIcons;
  if (raw.langLabel === "code" || raw.langLabel === "name") look.langLabel = raw.langLabel;
  return look;
}

export const lookToHash = (look: HeaderActionsLook) => encodeLabHash(changedProps(HEADER_ACTIONS_LOOK, look));

/** What to paste back: the look's changes over the shipped one. */
export function lookToJsx(look: HeaderActionsLook): string {
  const changed = Object.entries(changedProps(HEADER_ACTIONS_LOOK, look));
  if (!changed.length) return "<HeaderActions />";
  const lines = changed.map(([key, value]) => `    ${key}: ${JSON.stringify(value)},`);
  return `<HeaderActions\n  look={{\n    ...HEADER_ACTIONS_LOOK,\n${lines.join("\n")}\n  }}\n/>`;
}

const snap = (value: number, step: number) => Math.round(value / step) * step;

/** A random look that still makes sense. */
export function shuffle(random: () => number = Math.random): HeaderActionsLook {
  const lang = pick(LANG_STYLES, random).value;
  return {
    lang,
    theme: pick(THEME_STYLES.slice(0, 2), random).value,
    cta: pick(CTA_STYLES, random).value,
    frame: pick(FRAMES, random).value,
    height: snap(between(32, 40, random), 2),
    gap: snap(between(4, 14, random), 2),
    divider: random() > 0.4,
    themeIcons: random() > 0.7 ? "fill" : "line",
    langLabel: (lang === "text" || lang === "swap") && random() > 0.7 ? "name" : "code",
  };
}
