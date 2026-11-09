import type { MetadataRoute } from "next";
import { LOCALES } from "@/lib/i18n";
import { publishedPages } from "@/lib/llms";
import { hreflangFor } from "@/lib/seo";
import { absoluteUrl } from "@/lib/site";

export const dynamic = "force-static";

/**
 * Published pages only, in both languages, each with its frontmatter date and
 * its EN/CS hreflang alternates. Drafts never appear; / is a redirect to /en,
 * so it is not listed either.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  return LOCALES.flatMap((locale) =>
    publishedPages(locale).map((page) => {
      const languages = hreflangFor(page);
      return {
        url: absoluteUrl(page.url),
        lastModified: page.data.lastUpdated,
        ...(languages ? { alternates: { languages } } : {}),
      };
    }),
  );
}
