import type { MetadataRoute } from "next";
import { LOCALES } from "@/lib/i18n";
import { publishedPages } from "@/lib/llms";
import { chooserAlternates, hreflangFor } from "@/lib/seo";
import { absoluteUrl } from "@/lib/site";

export const dynamic = "force-static";

/**
 * Published pages only, each with its frontmatter date and hreflang
 * alternates. The language chooser (/) joins them once both docs homes are
 * published, because it is their x-default.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const pages = LOCALES.flatMap((locale) =>
    publishedPages(locale).map((page) => {
      const languages = hreflangFor(page);
      return {
        url: absoluteUrl(page.url),
        lastModified: page.data.lastUpdated,
        ...(languages ? { alternates: { languages } } : {}),
      };
    }),
  );
  const chooser = chooserAlternates();
  return chooser ? [{ url: absoluteUrl("/"), alternates: { languages: chooser } }, ...pages] : pages;
}
