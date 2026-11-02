import "@/styles/globals.css";
import type { ReactNode } from "react";
import { fontVariables } from "@/lib/fonts";

/** Root layout of `/`, the language chooser. Locale pages have their own in app/[lang]. */
export default function ChooserLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={fontVariables}>
      <body className="min-h-screen bg-background text-foreground">{children}</body>
    </html>
  );
}
