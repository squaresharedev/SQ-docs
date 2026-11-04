import { createMDX } from "fumadocs-mdx/next";
import type { NextConfig } from "next";

const withMDX = createMDX();

// Set when the export is served from a subpath, e.g. BASE_PATH=/SQ-docs for
// GitHub Pages. Empty for the Worker deploys, which serve from the root.
const basePath = (process.env.BASE_PATH ?? "").replace(/\/+$/, "");

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

export default withMDX(config);
