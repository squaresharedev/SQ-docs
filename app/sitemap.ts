import type { MetadataRoute } from "next";
import { LOCALES } from "@/lib/i18n";
import { publishedPages } from "@/lib/llms";
import { hreflangFor } from "@/lib/seo";
import { absoluteUrl } from "@/lib/site";

export const dynamic = "force-static";

/** Published pages only, each with its frontmatter date and hreflang alternates. */
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
