import "@/styles/globals.css";
import type { ReactNode } from "react";
import { fontVariables } from "@/lib/fonts";

/**
 * Root layout of `/`, the language chooser. Always the brand's dark palette,
 * like the homepage hero. Locale pages have their own layout in app/[lang].
 */
export default function ChooserLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={fontVariables}>
      <body className="dark min-h-screen bg-background text-foreground">{children}</body>
    </html>
  );
}
