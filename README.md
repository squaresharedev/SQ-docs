# Square Share Docs

Documentation for Square Share at `https://docs.squareshare.eu`.
English and Czech, built for people and for AI systems that read docs.

Next.js 16 (App Router, static export) + Fumadocs 16 + Tailwind CSS 4, with the
dashboard's design tokens from `@squaresharedev/tokens`. A small Hono Worker
serves the export on Cloudflare Workers and answers `Accept: text/markdown`.

Production runs at https://docs.squareshare.eu, and a noindex preview at
https://sq-docs-preview.squareshare.workers.dev (see "Deploying" below).

## Setup

```sh
pnpm install
```

`@squaresharedev/tokens` is installed from its source in the shared packages
repo (`../System/SQ-system/packages/tokens`), because the GitHub Packages
registry refuses this machine's token (see "Tokens package" below).

## Ports

| What | Command | URL |
| --- | --- | --- |
| Next dev server | `pnpm dev` | http://localhost:3100 |
| Worker serving the static export | `pnpm worker:dev` | http://localhost:8787 |

Do not run `pnpm build` while `pnpm dev` is running: both write `.next`. If a
build then fails with "Node.js subprocess crashed while evaluating loaders
[fumadocs-mdx...]", delete `.next` and build again.

Dev-only labs live under `app/dev` as `*.dev.tsx` route files, which only
`pnpm dev` (and `next typegen`) treat as pages (see `next.config.ts`); a build
never contains them. `/dev/header-lab` tunes the header's right side
(`components/HeaderActions.tsx`).

`<page URL>.md` only exists in the build (postbuild puts the files there and the
Worker serves them). Under `pnpm dev` the "View as Markdown" button and `.md`
links in page text go to the Markdown route instead,
`/md/<lang>/<slug>/content.md`, which shows the same file.

## Scripts

| Script | What it does |
| --- | --- |
| `pnpm dev` | Next dev server on 3100. |
| `pnpm build` | Content lint, then `next build` (static export to `out/`), then `scripts/postbuild.ts` (moves each page's Markdown to `<page URL>.md`). |
| `pnpm worker:dev` | `wrangler dev` on 8787 serving `out/` through `worker/index.ts`. Build first. |
| `pnpm typecheck` | Route types (`next typegen`), then TypeScript for the site and the Worker. |
| `pnpm lint` | ESLint, zero warnings allowed. |
| `pnpm content:lint` | Dashes, banned phrases, deprecated terms, prices, frontmatter, translation pairs, answer blocks. |
| `pnpm check:links` | Every internal link and anchor in `out/` resolves. |
| `pnpm check:seo` | Titles, descriptions, canonicals, JSON-LD, hreflang, sitemap, llms files, Markdown versions, drafts. Needs `pnpm worker:dev`. |
| `pnpm check:draft-path` | Temporarily publishes four pages, rebuilds and proves the non-draft path (sitemap, hreflang, llms), then reverts and rebuilds. `--lighthouse` also runs Lighthouse while they are published. |
| `pnpm test:e2e` | Playwright at 1280, 768 and 375 px, light and dark, with axe: any WCAG 2.2 A/AA violation fails. Keyboard and screen reader checks in `tests/site.spec.ts`. Screenshots go to `tests/screenshots/`. |
| `pnpm test:lighthouse` | Lighthouse (mobile) on the docs homes and the "What is Square Share" pages. |

## SITE_URL

`SITE_URL` sets the origin in canonical URLs, the sitemap, `llms.txt`, Open
Graph tags and JSON-LD. It is read when the site is built.

- Local default: `http://localhost:3100`
- Production: `SITE_URL=https://docs.squareshare.eu pnpm build`

## How the site is put together

- `content/docs/en`, `content/docs/cs`: MDX pages. Czech pages have Czech slugs
  and are paired with their English page by the `translationKey` frontmatter
  field. See [WRITING.md](WRITING.md) to add or edit a page.
- `content/glossary.ts`: the single source of truth for terms. `<GlossaryList />`
  renders it at build time, so the HTML, the `.md` version and search agree.
- `lib/`: source loader, i18n, translation pairing, metadata, JSON-LD, llms
  files, URL helpers, UI copy.
- `app/[lang]`: the docs (one root layout per locale, so `<html lang>` is right),
  `app/(chooser)`: the language chooser at `/` (the `x-default` target).
- `lib/legal.tsx`: squareshare.eu's legal pages, listed in the footer and as the
  last group of the sidebar.
- `styles/tokens.css`: the docs' own tokens, for values used in more than one
  place that the package does not ship (motion, the eyebrow label, the code
  surface greens, the focus colour, the sticky header's height). Components
  and stylesheets use these names, never the values.
- `styles/fumadocs-theme.css`: the only place Fumadocs UI meets the tokens.
- Accessibility: the docs aim at WCAG 2.2 AA (what the European Accessibility
  Act's EN 301 549 and US ADA and Section 508 practice point to). Fumadocs'
  gaps are filled through its own props and slots: `components/TableOfContents.tsx`,
  `components/ThemeSwitch.tsx`, `components/useDrawerFocus.ts`, `lib/sidebar.tsx`,
  `components/DocsLink.tsx` (aria-current) and `components/mdx.tsx` (code block
  names, table row headers). Motion that starts by itself stops within five
  seconds (`styles/corner-art.css`, the code surface in `styles/visuals.css`).
- Parts copied from the sibling apps, each file naming its source: the footer
  (`components/SiteFooter.tsx`, `components/home/PixelGrid.tsx`) from Home, and
  the search field and palette (`components/search`), the setup checklist's
  line (`components/SetupMap.tsx`, `components/transit-styles.ts`) and the
  billing, shipping and two-factor corner animations (`components/corner-art`,
  `styles/corner-art.css`) from the dashboard. The search reads the static index at `/api/search.json` instead of
  the dashboard's API.
- `worker/`: Hono Worker plus `wrangler.toml`.
- `RECON.md`: what was verified in the sibling repos and where.

### Files built for search engines and AI systems

| Path | Contents |
| --- | --- |
| `/sitemap.xml` | Published pages only, `lastmod` from frontmatter, hreflang alternates. |
| `/robots.txt` | Everything allowed, AI crawlers named, a `Content-Signal` line in every group (search and AI answers yes, training no), sitemap reference. Cloudflare prepends its own managed block in production. |
| `/llms.txt` | Site summary and links to each language's index. |
| `/en/llms.txt`, `/cs/llms.txt` | Published pages, linking their `.md` versions. |
| `/en/llms-full.txt`, `/cs/llms-full.txt` | Every published page in full. |
| `<page URL>.md` | The page as Markdown. The Worker also returns it for `Accept: text/markdown`. |
| `/og/<lang>/<slug>/image.png` | Open Graph image per page, coloured from the tokens. |
| `/31d1794a3bd09e6ebf170779d83bf859.txt` | IndexNow key (`public/`): proves the site owns submissions to `api.indexnow.org` (Bing, Seznam, Yandex and others). Keep it; a new key means a new file. |

### Drafts

`draft: true` pages render with a Draft banner and `noindex`, and stay out of
the sitemap, the llms files and hreflang. Every page starts as a draft; only a
person sets `draft: false`.

## Tokens package

The docs import `@squaresharedev/tokens/tokens.css` the way the SQ-system README
documents. The registry install failed on this machine with:

```text
npm error 403 403 Forbidden - GET https://npm.pkg.github.com/@squaresharedev%2ftokens - Permission permission_denied: The token provided does not match expected scopes.
```

GitHub Packages needs a classic personal access token with `read:packages`; the
local token is fine-grained. Once a classic token is in `~/.npmrc`, switch the
dependency in `package.json` from `file:../System/SQ-system/packages/tokens` to
`^0.3.0` and run `pnpm install`. Nothing else changes.

## Deploying

### Preview

A separate Worker, `sq-docs-preview`, for reading the drafts before launch.
It sends `X-Robots-Tag: noindex` on every response, so search engines leave
it alone. Wrangler needs `CLOUDFLARE_API_TOKEN` (or `wrangler login`).

```sh
SITE_URL=https://sq-docs-preview.squareshare.workers.dev pnpm build
pnpm exec wrangler deploy --config worker/wrangler.toml --env preview
```

Rebuild without `SITE_URL` afterwards for local testing: the checks and
Playwright expect the localhost build.

### Production

The `sq-docs` Worker serves `https://docs.squareshare.eu` (custom domain set in
`worker/wrangler.toml`, no workers.dev address).

```sh
SITE_URL=https://docs.squareshare.eu pnpm build
pnpm exec wrangler deploy --config worker/wrangler.toml
```

### Launch checklist for search and AI crawlers

The site does the rest itself once pages are published: sitemap, hreflang,
`llms.txt`, structured data and the Markdown versions only include pages with
`draft: false` in both languages.

Only a build with `SITE_URL=https://docs.squareshare.eu` is indexable
(`INDEXABLE` in `lib/site.ts`). Any other build (localhost, the GitHub Pages
dev site, the workers.dev preview) puts `noindex` on every page, published or
not; `NOINDEX=1` forces it on a production build too. The Worker answers `/`
with a 301 to `/en`, the x-default of every hreflang set.

What needs a person:

1. A native speaker reviews the Czech pages; then set `draft: false` on both
   languages of each page (the pair goes live together).
2. Before deploying, prove the published site with
   `SITE_URL=https://docs.squareshare.eu node scripts/draft-path-check.ts --all`.
   It publishes every page in a temporary build, runs the SEO check, then puts
   the files back.
3. Deploy the default Worker (not `--env preview`, whose responses carry
   `X-Robots-Tag: noindex`).
4. In Cloudflare, allow the AI crawlers (above), and turn on Crawler Hints so
   Bing and other IndexNow engines hear about changed pages.
5. Verify `docs.squareshare.eu` in Google Search Console and Bing Webmaster
   Tools with a DNS record, and submit `https://docs.squareshare.eu/sitemap.xml`
   in both.
6. Delete the `sq-docs-preview` Worker, or keep it: it is noindex either way.
