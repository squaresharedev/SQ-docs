import { Geist, Inter, JetBrains_Mono } from "next/font/google";

/**
 * The dashboard's families (Geist body and headings, Inter for muted labels,
 * JetBrains Mono for code), self-hosted at build time. The variable names are
 * the ones @squaresharedev/tokens maps to font-sans, font-inter and font-mono.
 * latin-ext carries the Czech letters (ě š č ř ž ů ť ď ň) that the dashboard's
 * own Latin-only font files lack.
 */
const geist = Geist({ subsets: ["latin", "latin-ext"], variable: "--font-geist", display: "swap" });

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

export const fontVariables = [geist.variable, inter.variable, jetbrainsMono.variable].join(" ");
