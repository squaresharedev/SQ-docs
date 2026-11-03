import { Geist, Inter, JetBrains_Mono, Space_Grotesk } from "next/font/google";

/**
 * The dashboard's and homepage's families: Geist for body text, Space Grotesk
 * for headlines (the homepage's display face), Inter for muted labels and
 * JetBrains Mono for code and the homepage footer's links. Self-hosted at build
 * time. The variable names are the ones @squaresharedev/tokens maps to
 * font-sans, font-display, font-inter and font-mono. latin-ext carries the
 * Czech letters (ě š č ř ž ů ť ď ň) that the dashboard's own Latin-only font
 * files lack.
 */
const geist = Geist({ subsets: ["latin", "latin-ext"], variable: "--font-geist", display: "swap" });

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin", "latin-ext"],
  variable: "--font-space-grotesk",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin", "latin-ext"],
  variable: "--font-inter",
  display: "swap",
  preload: false,
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin", "latin-ext"],
  variable: "--font-jetbrains-mono",
  display: "swap",
  preload: false,
});

export const fontVariables = [geist.variable, spaceGrotesk.variable, inter.variable, jetbrainsMono.variable].join(" ");
