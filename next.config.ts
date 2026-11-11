import { createMDX } from "fumadocs-mdx/next";
import type { NextConfig } from "next";
import { PHASE_PRODUCTION_BUILD } from "next/constants";

const withMDX = createMDX();

// Set when the export is served from a subpath, e.g. BASE_PATH=/SQ-docs for
// GitHub Pages. Empty for the Worker deploys, which serve from the root.
const basePath = (process.env.BASE_PATH ?? "").replace(/\/+$/, "");

/**
 * The /dev labs never reach a build: their route files are named page.dev.tsx
 * and layout.dev.tsx, and only the dev server and `next typegen` count
 * "dev.tsx" as a page extension (typegen loads the config as a production
 * build, so it is told apart by its command; its route types then agree with
 * the dev server's). To `next build` they are modules nothing imports, so
 * out/ has no /dev. Same idea as Store.
 */
const PAGE_EXTENSIONS = ["tsx", "ts", "jsx", "js"];
const DEV_PAGE_EXTENSIONS = ["dev.tsx", "dev.ts"];
const isTypegen = process.argv.includes("typegen");

const config: NextConfig = {
  // Every page is prerendered to HTML at build time and served by worker/.
  output: "export",
  basePath: basePath || undefined,
  env: { NEXT_PUBLIC_BASE_PATH: basePath },
  reactStrictMode: true,
  images: { unoptimized: true },
  // `next dev` would otherwise write an AGENTS.md whose text breaks the repo's no-dash rule.
  agentRules: false,
  experimental: {
    // Two root layouts (the language chooser and [lang]) need one 404 for
    // paths outside both.
    globalNotFound: true,
  },
};

export default function nextConfig(phase: string): NextConfig {
  const pageExtensions = phase === PHASE_PRODUCTION_BUILD && !isTypegen ? PAGE_EXTENSIONS : [...DEV_PAGE_EXTENSIONS, ...PAGE_EXTENSIONS];
  return withMDX({ ...config, pageExtensions });
}
