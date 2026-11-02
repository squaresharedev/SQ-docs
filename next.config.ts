import { createMDX } from "fumadocs-mdx/next";
import type { NextConfig } from "next";

const withMDX = createMDX();

const config: NextConfig = {
  // Every page is prerendered to HTML at build time and served by worker/.
  output: "export",
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
