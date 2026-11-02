import { notFound } from "next/navigation";
import { isLocale, LOCALES } from "@/lib/i18n";
import { localeLlmsIndex } from "@/lib/llms";

export const revalidate = false;
export const dynamicParams = false;

export async function GET(_request: Request, { params }: RouteContext<"/[lang]/llms.txt">) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  return new Response(localeLlmsIndex(lang), { headers: { "Content-Type": "text/plain; charset=utf-8" } });
}

export function generateStaticParams() {
  return LOCALES.map((lang) => ({ lang }));
}
