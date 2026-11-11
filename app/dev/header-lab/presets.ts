import type { HeaderActionsLook } from "@/components/HeaderActions";
import type { LabFit } from "../lab-kit/state";

export interface HeaderPreset {
  id: string;
  name: string;
  /** What it is, in one sentence. */
  note: string;
  fit: LabFit;
  group: string;
  look: Partial<HeaderActionsLook>;
}

/** Tabs in viewing order. Shortlist lists LAB_SHORTLIST; Reference shows the first version. */
export const LAB_GROUPS = [
  { id: "shortlist", label: "Shortlist" },
  { id: "bare", label: "No borders" },
  { id: "joined", label: "One strip" },
  { id: "boxed", label: "Boxes, one height" },
  { id: "button", label: "Get started" },
  { id: "reference", label: "Reference" },
] as const;

export const LAB_PRESETS: HeaderPreset[] = [
  // No borders
  {
    id: "quiet-text",
    name: "Quiet text",
    note: "EN / CS as words, one moon button, a hairline, then the filled button: the button is the only box.",
    fit: "on-brand",
    group: "bare",
    look: {},
  },
  {
    id: "quiet-text-names",
    name: "Quiet text, names",
    note: "Same, with the languages written out in their own words: English / Čeština.",
    fit: "stretch",
    group: "bare",
    look: { langLabel: "name" },
  },
  {
    id: "swap-code",
    name: "Swap",
    note: "One link to the other language, a globe and its code, so the header shows one fewer word.",
    fit: "on-brand",
    group: "bare",
    look: { lang: "swap" },
  },
  {
    id: "swap-name",
    name: "Swap, name",
    note: "The swap link with the language's own name: a globe and Čeština on English pages.",
    fit: "on-brand",
    group: "bare",
    look: { lang: "swap", langLabel: "name" },
  },
  {
    id: "menu",
    name: "Globe menu",
    note: "A globe with the current code that opens a list of languages, ready for a third language.",
    fit: "on-brand",
    group: "bare",
    look: { lang: "menu" },
  },
  {
    id: "bare-quiet-seg",
    name: "Grey segment",
    note: "EN and CS as small caps cells with the current one on the hover grey, no border.",
    fit: "on-brand",
    group: "bare",
    look: { lang: "quiet" },
  },
  {
    id: "bare-filled-icons",
    name: "Filled icons",
    note: "Quiet text with a filled moon and sun, like the first version's icons.",
    fit: "stretch",
    group: "bare",
    look: { themeIcons: "fill" },
  },
  {
    id: "bare-compact",
    name: "Compact",
    note: "Quiet text at 32 px with tight gaps, for a lighter bar.",
    fit: "on-brand",
    group: "bare",
    look: { height: 32, gap: 4 },
  },
  {
    id: "bare-roomy",
    name: "Roomy",
    note: "Quiet text at 40 px with wider gaps; the button matches the search field's weight.",
    fit: "on-brand",
    group: "bare",
    look: { height: 40, gap: 12 },
  },
  {
    id: "bare-no-divider",
    name: "No hairline",
    note: "Quiet text without the hairline before the button.",
    fit: "on-brand",
    group: "bare",
    look: { divider: false, gap: 12 },
  },

  // One strip
  {
    id: "joined-quiet",
    name: "Strip, grey segment",
    note: "Language and theme in one bordered strip, current language on the grey, then the button.",
    fit: "on-brand",
    group: "joined",
    look: { frame: "joined", lang: "quiet", divider: false },
  },
  {
    id: "joined-filled",
    name: "Strip, filled segment",
    note: "One strip with the current language filled in the text colour, closest to the first version.",
    fit: "on-brand",
    group: "joined",
    look: { frame: "joined", lang: "segmented", divider: false },
  },
  {
    id: "joined-text",
    name: "Strip, text",
    note: "EN / CS as words and the moon inside one bordered strip.",
    fit: "on-brand",
    group: "joined",
    look: { frame: "joined", lang: "text", divider: false },
  },
  {
    id: "joined-cells",
    name: "Strip, sun and moon",
    note: "Grey language segment and sun and moon cells, all in one strip of square cells.",
    fit: "on-brand",
    group: "joined",
    look: { frame: "joined", lang: "quiet", theme: "segmented", divider: false },
  },
  {
    id: "joined-menu",
    name: "Strip, globe menu",
    note: "The globe menu and the moon in one strip.",
    fit: "stretch",
    group: "joined",
    look: { frame: "joined", lang: "menu", divider: false },
  },

  // Boxes, one height
  {
    id: "boxed-tidy",
    name: "First version, tidied",
    note: "The first version's filled EN / CS and sun and moon, all at 36 px in square cells.",
    fit: "on-brand",
    group: "boxed",
    look: { frame: "separate", lang: "segmented", theme: "segmented", divider: false },
  },
  {
    id: "boxed-quiet-icon",
    name: "Grey segment and moon box",
    note: "A bordered grey segment and a bordered square moon button, then the filled button.",
    fit: "on-brand",
    group: "boxed",
    look: { frame: "separate", lang: "quiet", divider: false },
  },
  {
    id: "boxed-swap",
    name: "Swap box and moon box",
    note: "Two bordered controls, the globe swap and the moon, then the button.",
    fit: "on-brand",
    group: "boxed",
    look: { frame: "separate", lang: "swap", divider: false },
  },
  {
    id: "boxed-text",
    name: "Text box",
    note: "EN / CS as words inside a border, with a bordered moon button.",
    fit: "stretch",
    group: "boxed",
    look: { frame: "separate", lang: "text", divider: false },
  },

  // Get started
  {
    id: "cta-filled",
    name: "Filled, no arrow",
    note: "Quiet text with a plain filled button.",
    fit: "on-brand",
    group: "button",
    look: { cta: "filled" },
  },
  {
    id: "cta-outline",
    name: "Outline button",
    note: "Quiet text with an outlined button, so nothing in the header is filled.",
    fit: "on-brand",
    group: "button",
    look: { cta: "outline-arrow" },
  },
  {
    id: "cta-link",
    name: "Text link",
    note: "Get started as a bold text link with an arrow: no boxes at all.",
    fit: "stretch",
    group: "button",
    look: { cta: "link-arrow" },
  },
  {
    id: "cta-swap-outline",
    name: "Swap and outline",
    note: "The globe swap, the moon and an outlined button.",
    fit: "on-brand",
    group: "button",
    look: { lang: "swap", cta: "outline-arrow" },
  },
];

/** Best first, with why. */
export const LAB_SHORTLIST: { id: string; why: string }[] = [
  { id: "quiet-text", why: "Simplest: one box on the right, the button, and both languages still one click away." },
  { id: "swap-code", why: "Even fewer words: the header names only the language you can switch to." },
  { id: "joined-quiet", why: "Keeps a framed control like the search field, but as one strip instead of three boxes." },
  { id: "menu", why: "Scales to more languages and keeps the bar quiet; costs one extra click." },
  { id: "boxed-tidy", why: "The first version with its mismatches fixed: one height, square cells, one border style." },
  { id: "bare-roomy", why: "Quiet text sized to the search field, for a calmer, larger bar." },
  { id: "cta-outline", why: "Nothing filled in the header, if the button feels too loud next to the search." },
  { id: "swap-name", why: "Says Čeština in its own word, the clearest for a Czech reader on an English page." },
];
