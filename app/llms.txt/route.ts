import { rootLlms } from "@/lib/llms";

export const revalidate = false;

export function GET() {
  return new Response(rootLlms(), { headers: { "Content-Type": "text/plain; charset=utf-8" } });
}
