import { notFound } from "next/navigation";
import { generateOGImage } from "fumadocs-ui/og";
import { LogoMark } from "@/components/Logo";
import { COPY } from "@/lib/copy";
import { ogFonts } from "@/lib/og-fonts";
import { allPages, localeOf } from "@/lib/pairing";
import { source } from "@/lib/source";
import { OG_COLORS } from "@/lib/tokens";
import { ogImageSegments } from "@/lib/urls";

export const revalidate = false;
export const dynamicParams = false;

export async function GET(_request: Request, { params }: RouteContext<"/og/[lang]/[...slug]">) {
  const { lang, slug } = await params;
  const page = source.getPage(slug.slice(0, -1), lang);
  if (!page) notFound();

  return generateOGImage({
    title: page.data.title,
    description: page.data.description,
    site: COPY[localeOf(page)].siteName,
    primaryColor: OG_COLORS.accent,
    primaryTextColor: OG_COLORS.foreground,
    icon: <LogoMark width={56} height={56} style={{ color: OG_COLORS.foreground }} />,
    fonts: await ogFonts(),
  });
}

export function generateStaticParams() {
  return allPages().map((page) => ({ lang: page.locale ?? "", slug: ogImageSegments(page) }));
}
