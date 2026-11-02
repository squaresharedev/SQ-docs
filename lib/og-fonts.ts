/**
 * Geist as TrueType for the Open Graph renderer (it cannot read woff2), with
 * the full character set so Czech titles render. Fetched once per build from
 * Google Fonts, the same source next/font uses for the page fonts.
 */
type OgFont = { name: string; data: ArrayBuffer; weight: 400 | 800; style: "normal" };

let cached: Promise<OgFont[]> | undefined;

async function loadGeist(weight: 400 | 800): Promise<OgFont> {
  const css = await fetch(`https://fonts.googleapis.com/css2?family=Geist:wght@${weight}`).then((r) => r.text());
  const url = css.match(/src: url\((.+?)\) format\('truetype'\)/)?.[1];
  if (!url) throw new Error(`No TrueType Geist ${weight} in the Google Fonts response`);
  const data = await fetch(url).then((r) => r.arrayBuffer());
  return { name: "Geist", data, weight, style: "normal" };
}

export function ogFonts(): Promise<OgFont[]> {
  cached ??= Promise.all([loadGeist(400), loadGeist(800)]);
  return cached;
}
