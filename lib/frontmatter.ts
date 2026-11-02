import { z } from "zod";

/** Search engines cut longer meta descriptions. */
export const DESCRIPTION_MAX = 160;

/**
 * Frontmatter of every page in content/docs. The MDX compiler validates each
 * file against it (an invalid page fails the build) and so does
 * scripts/content-lint.ts. Plain Zod only, so Node scripts can import it.
 */
export const frontmatterSchema = z
  .object({
    title: z.string().trim().min(1),
    description: z.string().trim().min(1).max(DESCRIPTION_MAX),
    translationKey: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "use lowercase-kebab-case"),
    // YAML reads an unquoted 2026-11-02 as a Date; accept both spellings.
    lastUpdated: z.preprocess(
      (value) => (value instanceof Date ? value.toISOString().slice(0, 10) : value),
      z.iso.date(),
    ),
    draft: z.boolean(),
  })
  .strict();

export type Frontmatter = z.infer<typeof frontmatterSchema>;
