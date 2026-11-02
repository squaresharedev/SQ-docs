import { createFromSource } from "fumadocs-core/search/server";
import { source } from "@/lib/source";

export const revalidate = false;

// Built once into out/api/search.json; the search dialog downloads it.
export const { staticGET: GET } = createFromSource(source);
