/**
 * Banned phrases for scripts/content-lint.ts. This file, WRITING.md and RECON.md
 * are exempt from the phrase checks because they quote the lists.
 *
 * A trailing `*` in an entry matches any word ending (`elevate*` covers
 * elevate, elevated, elevates). Matching is case-insensitive and whole-word.
 * A space in an entry matches any run of whitespace.
 */
export const SLOP_EN: readonly string[] = [
  "delve*",
  "seamless",
  "seamlessly",
  "effortless",
  "effortlessly",
  "unlock*",
  "unleash*",
  "elevate*",
  "elevating",
  "empower*",
  "game-changer",
  "game changer",
  "cutting-edge",
  "revolutioni*",
  "robust*",
  "leverag*",
  "harness*",
  "embark*",
  "journey*",
  "landscape*",
  "tapestry",
  "in today's fast-paced",
  "whether you're",
  "it's not just",
  "look no further",
  "dive in",
  "let's explore",
  "in conclusion",
  "we exist to",
  "take it to the next level",
];

export const SLOP_CS: readonly string[] = [
  "bezproblémově",
  "bez námahy",
  "odemkněte",
  "posuňte na další úroveň",
  "v dnešní uspěchané době",
  "revoluční*",
  "ponořme se",
];

const APOSTROPHE = String.fromCharCode(0x2019);

const BACKSLASH = String.fromCharCode(92);

function escapeRegex(piece: string): string {
  return piece.replace(/[.+?^${}()|[\]/]/g, (char) => BACKSLASH + char);
}

/** Compiles one rule entry into a whole-word, case-insensitive, Unicode-aware regex. */
export function phraseRegex(phrase: string): RegExp {
  const body = phrase
    .split("*")
    .map((piece) =>
      piece
        .split(/\s+/)
        .map((word) => escapeRegex(word).replace(/'/g, `['${APOSTROPHE}]`))
        .join(String.raw`\s+`),
    )
    .join(String.raw`\p{L}*`);
  return new RegExp(String.raw`(?<![\p{L}\p{N}_])${body}(?![\p{L}\p{N}_])`, "giu");
}

export interface CompiledRule {
  phrase: string;
  regex: RegExp;
}

export function compile(phrases: readonly string[]): CompiledRule[] {
  return phrases.map((phrase) => ({ phrase, regex: phraseRegex(phrase) }));
}

/** Money, percentages and fee words. Docs never state prices (RECON.md section 9). */
export const PRICE_PATTERNS: readonly { name: string; regex: RegExp }[] = [
  { name: "currency amount", regex: /[€$£]\s?\d|\d[\d.,\s]*\s?[€$£]/gu },
  {
    name: "currency code with a number",
    regex: /(?<![\p{L}\p{N}_])\d[\d.,]*\s*(?:EUR|USD|CZK|Kč)(?![\p{L}\p{N}_])|(?<![\p{L}\p{N}_])(?:EUR|USD|CZK|Kč)\s*\d/giu,
  },
  { name: "percentage", regex: /\d\s*%|\d\s*(?:percent|per\s+cent|procent\p{L}*)(?![\p{L}\p{N}_])/giu },
  {
    name: "fee or commission word",
    regex: /(?<![\p{L}\p{N}_])(?:fees?|commissions?|poplat\p{L}*|proviz\p{L}*)(?![\p{L}\p{N}_])/giu,
  },
];
