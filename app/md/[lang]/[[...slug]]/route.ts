import { notFound } from "next/navigation";
import { pageMarkdown } from "@/lib/llms";
import { allPages } from "@/lib/pairing";
import { source } from "@/lib/source";
import { markdownRouteSegments } from "@/lib/urls";

export const revalidate = false;
export const dynamicParams = false;

/**
 * Builds out/md/<lang>/<slug>/content.md for every page. scripts/postbuild.ts
 * then moves each file to its public address, <page URL>.md.
 */
export async function GET(_request: Request, { params }: RouteContext<"/md/[lang]/[[...slug]]">) {
  const { lang, slug = [] } = await params;
  const page = source.getPage(slug.slice(0, -1), lang);
  if (!page) notFound();
  return new Response(await pageMarkdown(page), {
    headers: { "Content-Type": "text/markdown; charset=utf-8" },
  });
}

export function generateStaticParams() {
  return allPages().map((page) => ({ lang: page.locale ?? "", slug: markdownRouteSegments(page) }));
}
