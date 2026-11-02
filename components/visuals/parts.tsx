import Image from "next/image";
import type { CSSProperties, ReactNode } from "react";
import { cn } from "@/lib/cn";
import { LogoMark } from "@/components/Logo";

/**
 * Pieces shared by the docs illustrations. Everything here is a drawing:
 * the illustration wrapper marks it aria-hidden and inert, and the words in
 * it repeat what the page text already says.
 */

export const PRODUCTS = {
  camera: "/img/products/product-01.jpg",
  headphones: "/img/products/product-02.jpg",
  watch: "/img/products/product-03.jpg",
  monstera: "/img/products/product-04.jpg",
  mouse: "/img/products/product-05.jpg",
  succulent: "/img/products/product-07.jpg",
} as const;

export type Product = keyof typeof PRODUCTS;

/** A product photo filling its box (photos from the homepage's walkthrough). */
export function Photo({
  product,
  className,
  style,
}: {
  product: Product;
  className?: string;
  style?: CSSProperties;
}) {
  return (
    <span className={cn("relative block overflow-hidden bg-fd-muted", className)} style={style}>
      <Image src={PRODUCTS[product]} alt="" fill sizes="240px" className="object-cover" />
    </span>
  );
}

const DOTS = [0, 1, 2] as const;

/**
 * A drawn browser window, like the homepage's walkthrough and the dashboard's
 * embed picture: three dots, an address pill, then the page.
 */
export function BrowserFrame({
  url,
  brand = false,
  children,
  className,
}: {
  url: string;
  /** Square Share's own page: the mark in the address pill. */
  brand?: boolean;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("overflow-hidden border border-fd-border bg-fd-card shadow-lg", className)}>
      <div className="flex items-center gap-2 border-b border-fd-border bg-fd-secondary px-2.5 py-2">
        <span className="flex gap-1">
          {DOTS.map((dot) => (
            <span key={dot} className="size-2 rounded-full bg-fd-border" />
          ))}
        </span>
        <span className="flex min-w-0 flex-1 items-center gap-1.5 rounded-full bg-fd-background px-2.5 py-0.5 font-inter text-[10px] text-fd-muted-foreground">
          {brand ? <LogoMark className="size-2.5 shrink-0 text-fd-foreground" /> : <LockGlyph />}
          <span className="truncate">{url}</span>
        </span>
      </div>
      {children}
    </div>
  );
}

function LockGlyph() {
  return (
    <svg viewBox="0 0 12 12" className="size-2.5 shrink-0" fill="none" stroke="currentColor" strokeWidth="1.4">
      <rect x="2" y="5.5" width="8" height="5.5" />
      <path d="M4 5.5V4a2 2 0 0 1 4 0v1.5" />
    </svg>
  );
}

/** The homepage's pointer with its purple name tag: a buyer on the seller's page. */
export function Cursor({ label, className }: { label?: string; className?: string }) {
  return (
    <span className={cn("pointer-events-none absolute z-10 block", className)}>
      <svg viewBox="2.5 0.7 15.7 21.8" className="block w-4 drop-shadow-md">
        <path
          d="M4 2.2 L4 18.8 L8.3 14.6 L11.1 21 L13.8 19.8 L11 13.5 L16.7 13.2 Z"
          className="fill-fd-foreground stroke-fd-background"
          strokeWidth="1.4"
          strokeLinejoin="round"
        />
      </svg>
      {label ? (
        <span className="absolute left-3 top-4 whitespace-nowrap bg-acid px-1.5 py-0.5 font-inter text-[9px] font-semibold text-white">
          {label}
        </span>
      ) : null}
    </span>
  );
}

/** A grey line standing in for text. */
export function Bar({ className }: { className?: string }) {
  return <span className={cn("block h-1.5 bg-fd-muted", className)} />;
}
