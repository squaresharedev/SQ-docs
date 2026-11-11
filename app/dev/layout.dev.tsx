import "@/styles/globals.css";
import type { ReactNode } from "react";
import { fontVariables } from "@/lib/fonts";

/**
 * Root layout for /dev, which exists only under `next dev`: route files here
 * are named *.dev.tsx and only a development server counts that as a page
 * extension (next.config.ts). A production build never sees these routes.
 */
export default function DevLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={fontVariables} suppressHydrationWarning>
      <body className="min-h-screen bg-fd-background text-fd-foreground">{children}</body>
    </html>
  );
}
