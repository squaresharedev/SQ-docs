# RECON: verified facts for the Square Share docs

Phase 0 output. Read-only research across the sibling repos on 2026-11-02.
Content in `content/docs` may only state facts from this file. Anything not
here gets a `TODO(adrian): ...` marker instead of a guess.

Paths are relative to `C:\Squareshare`.

## 1. Sibling repos

| Folder | package.json name | What it is |
| --- | --- | --- |
| `Store` | `squareshare-store` | Seller dashboard. Next.js 16.2.9, React 19.2.4, next-intl, OpenNext on Cloudflare Workers. |
| `Home` | `squareshare-app` (sic) | Marketing site squareshare.eu. Next.js 16.2.9. English only. |
| `App` | `squareshare-app` | Future hosted app (app.squareshare.eu). Vite + Hono Worker. |
| `Admin` | `squareshare-admin` | Staff admin. Next.js 16.2.10. |
| `System/SQ-system` | pnpm workspace | Shared `@squaresharedev/*` packages published to GitHub Packages. |
| `App-old`, `API` | | Old or empty. Ignored. |

The brief calls the dashboard "SQ Dashboard (store.squareshare.eu)". In code the
dashboard origin is **`https://dashboard.squareshare.eu`** (`Store/.env.production`
`NEXT_PUBLIC_APP_URL`, `Store/wrangler.jsonc` custom domain). The docs use the
code value. TODO(adrian) confirms it.

## 2. Design tokens

- `@squaresharedev/tokens` v0.3.0 lives in `System/SQ-system/packages/tokens`
  (`tokens.css` + `dist/` control-style class constants).
- **No sibling repo depends on it.** Store defines the same tokens itself in
  `Store/src/app/globals.css`; `tokens.css` says it was "Extracted from SQ-store
  app/globals.css". Store only has the `.npmrc` scope mapping.
- Registry install fails from this machine:
  `npm error 403 403 Forbidden - GET https://npm.pkg.github.com/@squaresharedev%2ftokens - Permission permission_denied: The token provided does not match expected scopes.`
  The local token (`GH_PACKAGES_TOKEN`, used by `~/.npmrc`) is a fine-grained
  `github_pat_`. GitHub Packages needs a classic PAT with `read:packages`
  (SQ-system README, Store `.npmrc` comment, Store `deploy.yml` comment).
- Documented import pattern (SQ-system README):
  `@import "tailwindcss"; @import "@squaresharedev/tokens/tokens.css";` and
  `@custom-variant dark (&:is(.dark *));` in the app entry CSS.
- Package vs Store drift (Store is newer): `--muted-foreground` 0.556 vs Store
  0.545, `--destructive` 0.577 vs Store 0.55. Store also adds motion tokens
  (`--transition-duration-fast/base/slow` 120/180/260ms, `--ease-standard`,
  `--ease-entrance`) that are not in the package.

## 3. Dashboard look and feel (Store)

- Fonts, self-hosted with `next/font/local` (`Store/src/app/fonts/*.woff2`):
  Geist `--font-geist` (body and headings, semibold headings), Inter
  `--font-inter` (muted labels, captions), JetBrains Mono
  `--font-jetbrains-mono` (code), Space Grotesk `--font-space-grotesk` (auth
  screens and wordmark only). Store's files are Latin-only subsets with no
  Latin Extended-A, so Czech `ě š č ř ž ů ť ď ň` fall back to another font.
- Light mode only in the product UI. No theme toggle. `.dark` is the brand dark
  palette (black surfaces, purple `#a855f7` primary) and is only used on error
  screens.
- Buttons: sharp corners (`rounded-none`). Primary is black on white
  (`bg-primary text-primary-foreground`), `px-4 py-2.5 text-sm font-medium`.
  Secondary: `border border-border bg-background hover:bg-accent`.
- Cards: `rounded-md border border-border bg-card shadow-xs`.
- Inputs: `rounded-sm border border-input`.
- Focus: `ring-2 ring-ring ring-offset-2 ring-offset-background`.
- Purple accent is reserved: never for buttons, links, focus rings or borders
  (`Store/docs/styles.md`). One brand moment per surface is allowed.
- Code surface (`.code-surface`): white slab in a 4px animated green ring.
  Store-only CSS, not in the tokens package.
- Page shell: `mx-auto max-w-7xl px-6 py-8`.

## 4. Logo

- Mark geometry: `BRAND_MARK` in `Store/src/lib/brand.ts`, same shape as
  `Home/src/components/SquareShareLogo.tsx`:
  `<svg viewBox="0 0 630 624" fill="currentColor"><path d="M0 84H270V354H540V624H0Z M360 0H630V270H547V83H360Z"/></svg>`
- No wordmark file. The brand name is live text "Square Share".
- Dashboard sidebar brand row: mark + "Dashboard" in `text-lg font-semibold tracking-tight`.
- `Store/src/app/icon.png` (1080x1080) and `apple-icon.png` (180x180) are the app icons.

## 5. Brand voice and naming (Home)

- Name is "Square Share", two words (`SITE_NAME`, `BRAND_NAME`).
- Tone samples: "No. You copy one line and paste it where you want it."
  "We're not live yet." "Leave your email and you'll be first in when we open."
- Waitlist: **no URL or anchor exists.** It is a modal opened by the "Get
  started" buttons on squareshare.eu. Home's footer "Get Started" link points to
  `https://squareshare.eu/#hero`. The docs use that. TODO(adrian).
- Home has no Czech version and no "not affiliated with Square" statement.
- Contact email office@squareshare.eu comes from the brief (not found in code).

## 6. Storefront embed (shipped, live since 2026-10-19)

- Embed origin: `https://embed.squareshare.eu` (`NEXT_PUBLIC_EMBED_URL` in `Store/.env.production`).
- Script snippet (`Store/src/lib/storefront/embed-snippet.ts:44-49`):
  ```html
  <div data-squareshare-storefront="EMBED_KEY"></div>
  <script async src="https://embed.squareshare.eu/widget.js"></script>
  ```
- Iframe-only snippet (`embed-snippet.ts:81-88`), for sites that strip scripts:
  ```html
  <iframe src="https://embed.squareshare.eu/e/EMBED_KEY/SITE" title="Shop" loading="lazy"
    sandbox="allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox allow-forms" referrerpolicy="no-referrer"
    style="display:block;width:100%;height:640px;border:0"></iframe>
  ```
  `SITE` is the seller's saved domains plus www twins, up to 4 path segments.
- Where: sidebar **Storefront** (`/storefront`), storefront card **Share**
  button (or **Share** in the designer header). Opens
  `/storefront/<id>/embed`, page title "Share this storefront".
- Steps on that page:
  1. "Choose the sites it shows on": switch **Show on my website**, field
     **Allowed domains** (up to 10, comma-separated), **Save settings**.
  2. "Paste the snippet into your site": **Your site builder** dropdown, tabs
     **Script** / **Iframe only**, button **Copy embed snippet**.
  3. "Add this to your privacy policy" (Required): **Copy privacy text**.
  4. "Snippet key" with **Rotate key** (rotating breaks every pasted copy).
- The Copy button works only when: embedding is on, at least one domain is SAVED, seller
  details are complete, product pages are on.
- Site builder instructions (`Store/messages/en/storefront.json`):
  Another site: "Paste it into your page's HTML where the storefront should appear."
  WordPress: "Add a Custom HTML block where the storefront should appear, and paste it in."
  Squarespace: "Add a Code block and paste it in. If the storefront only appears after a reload, switch to Iframe only."
  Wix: "Add Embed Code, then Embed HTML, and paste it in. Then drag the box as tall as your storefront."
  Webflow: "Add a Code Embed element and paste it in. It shows on your published site."
  Shopify: "In the theme editor, add a Custom Liquid section and paste it in."
  Google Sites: "Choose Insert, then Embed, then Embed code, and paste it in."
  Framer: "Add an Embed component, set it to HTML, and paste it in."
  Carrd: "Add an Embed element, set its type to Code, and paste it in."
- Rules: https only (http pages are refused). Whole host must match, `www.` is
  ignored, subdomains are listed separately. Script version sizes itself;
  iframe version is 640px tall and scrolls inside.
- Buyer click on a tile: opens the hosted product page in a new tab,
  `https://dashboard.squareshare.eu/s/<storefrontId>/p/<productId>?via=embed`.
- Checking it worked: no test button. Info tip "If the storefront does not
  show": "Your site's address must be in Allowed domains, and the site must use
  https. Pasted code shows on your published site, not in a builder's editor.
  To see it on a preview address (such as yoursite.webflow.io), add that
  address too." A refused embed draws nothing; `widget.js` logs a console
  message starting `[Square Share] The storefront is not showing on`.
- Privacy text the seller must add (verbatim): "This site shows a storefront
  provided by Square Share. When it loads, the visitor's IP address and browser
  details are sent to Square Share to display the products and to count
  visits. Square Share sets no cookies and stores nothing on the visitor's
  device for this. Details: {policy}". The dashboard fills `{policy}` with
  `https://squareshare.eu/legal/privacy-policy/` (`Store/src/lib/legal/links.ts`).

## 7. Purchase button (shipped; the dashboard calls it "buy button")

- Docs term is **purchase button**. Dashboard UI says "buy button" (dialog
  title "Add a buy button to your website", Analytics channel "Buy button").
  The docs never quote those strings. TODO(adrian): align UI wording.
- Where: **Products** (`/products`), product card **⋯** menu, **Add to your website**.
- Tabs and what they copy:
  - **Link**: `https://dashboard.squareshare.eu/s/<storefrontId>/p/<productId>?via=button`
    ("Paste it into your button's link setting.")
  - **HTML**: `<a href="URL">Buy now</a>` ("Paste it where the button should go.")
  - **AI agent**: a prompt (verbatim in `Store/src/lib/storefront/embed-snippet.ts:115-121`).
- Footer: **Try your button** opens the URL in a new tab.
- Blocked states: product taken offline; seller details incomplete; product is
  a draft ("Make it Active first"); product not on a storefront ("Put this
  product on a storefront first, so it has a page to land on").
- It is a plain link. No script, no iframe. The product page refuses to be framed.
- Buyer flow: product page, then its button goes to (in order) the seller's own
  purchase link, Square Share checkout, or an enquiry email.

## 8. Storefront editor (shipped: grid mode only)

- Designer at `/storefront/<id>`. Sample at `/storefront/sample` (nothing saved).
- Grid only. Free placement ("freeform") is a future plan feature with no UI.
- No templates. Three "Looks" (Minimal, Classic, Bold) set colours, font,
  corners, spacing and tile content in one go.
- Confirmed settings: Upload a font (WOFF2, WOFF, TTF or OTF, up to 2 MB);
  colours (background, accent, text, shape fill and border); Rotation (-180 to
  180); text alignment (left, center, right); block size by dragging edges;
  Grid density (0 to 32 px); Corner roundness (cards, price tag, shapes);
  Border thickness (price tag and shapes); Show title on hover; price tag
  position (Below, On image, Hidden, plus 7 spots on the image).
- Not found: an align or distribute tool for blocks; a border on product tiles.

## 9. Payments

- Built: Stripe Connect Express, direct charges on the seller's own account.
  Seller is merchant of record. Terms summary: "Payments run through Stripe,
  into your own Stripe account, under Stripe's own terms. We never hold your money."
- **Switched off in production** (`NEXT_PUBLIC_STRIPE_CONNECT_ENABLED`
  commented out). Payments page says "Getting paid through Stripe is coming
  soon" and "Until then, buyers pay you through your product's buy link, or by
  emailing you." TODO(adrian).
- Fees exist in code and are switched off. The docs never state prices, fees or percentages.

## 10. Accounts and dashboard

- Sign-up at `https://dashboard.squareshare.eu/login?mode=signup`: email and
  password, Continue with Google, or email sign-in link. Open in code. Home
  still shows the waitlist. Sign-up form: "you are 18 or over and based in the
  EU, the USA or Canada".
- Sidebar: Overview, Products, Storefront, Orders, Discounts, Analytics, Payments, Settings.
- Setup checklist in production: Add your seller details, Add a product, Put a
  product on a storefront, Publish its page.
- Product needs a title and a price to start. Status Active or Draft.
- "Collection" does not exist in the dashboard. TODO(adrian): define it.
- Dashboard UI locales include Czech. Czech terms used there: storefront =
  "výloha", product = "produkt", dashboard = "panel", buy button = "tlačítko nákupu".
- MCP server for AI assistants: `https://dashboard.squareshare.eu/mcp`
  (Settings, Connected apps). Not covered by these docs yet.

## 11. Not shipped (future tense only)

Freeform editor mode, templates, hosted storefronts on app.squareshare.eu,
discovery feed or marketplace, more widgets (email signup, reservations or
booking, availability calendar), WordPress and Wix plugins, Square Share
checkout through Stripe (built, switched off).

## 12. Second batch of pages (verified 2026-11-03)

Read-only research in `Store` for the ten pages added on 2026-11-03. Paths
relative to `Store/`. UI strings are quoted from `messages/en` and `messages/cs`.

- **Production switches that limit what the docs may say:** buyer checkout off
  (`.env.production` `NEXT_PUBLIC_STRIPE_CONNECT_ENABLED` commented out);
  transactional email off (`wrangler.jsonc` LAUNCH SWITCHES step 3), so no app
  emails, no invite emails, and a confirmed contact email is NOT yet required
  to publish (`src/lib/contact-verification/availability.ts`); phone
  confirmation by text unavailable. MCP server on (`AGENT_ACCESS_ENABLED`).
- **Setup checklist** (`src/lib/onboarding/steps.ts`, `onboarding.json`): four
  steps while checkout is off. A product page is live only when seller details
  are complete, the product is Active, it has a block on a storefront, that
  storefront has "Show a product page" on, and the automatic check has not
  held it (`src/lib/products/public.ts`). Buyers otherwise see "This product
  isn't available".
- **Seller details** (`settings.json` `tax`): required Trader name, Address,
  Contact email; optional VAT ID, Country, Phone, Bio. Public in the product
  page Seller block (`src/components/product-page/SellerBlock.tsx`).
- **Product form** (`src/lib/validation/product.ts`, `products.json`): EUR or
  USD; download file up to 200 MB; images PNG/JPG/WEBP/GIF/AVIF up to 10 MB;
  24 extra photos; 4 option groups, 48 options; 6 badges (3 on the photo);
  8 PDFs up to 20 MB; max 100 per order. A purchase link opens in a new tab
  ("Checkout on" host); without one the button is "Ask about this product"
  (mailto). Add-ons need Square Share checkout, so buyers do not see them
  today. CSV import up to 2 MB, photos not imported.
- **Designer** (`storefront.json`, `src/types/storefront.ts`): canvas 3 to 12
  columns, 2 to 60 rows, 120 blocks, grid gap 0 to 32 px; explicit Save
  (Ctrl/Cmd+S); "Allow search engines" defaults off (`allowIndexing: false`).
- **Allowed domains** (`src/lib/validation/inputs.ts`, `src/lib/storefront/embed.ts`):
  pasted URLs are trimmed to the host; whole-host match, leading `www.` ignored
  both ways; no wildcards, ports, localhost or IPs; Wix `filesusr.com` frames
  recognised from the listed site. `public/widget.js` logs the
  `[Square Share] The storefront is not showing on` message with
  `console.info`, at once on http pages, else after 10 s; an invalid key does
  nothing and logs nothing; frames load near the viewport (600 px margin).
- **Shipping & returns** (`settings.json` `shipping`): up to 6 destinations, 8
  profiles; returns window None, 14 (EU statutory minimum), 30 or custom days.
  Product pages state EU withdrawal and guarantee rights (`productPage.json`
  `statutory`).
- **Two-factor** (`settings.json` `security`, `docs/two-factor-auth.md`):
  passkey (Recommended) or authenticator app, 10 recovery codes; using one
  turns 2FA off. Locked-out contact is `support@squareshare.eu`
  (`src/lib/site.ts`).
- **MCP** (`settings.json` `connectedApps`, `src/lib/agent/scopes.ts`,
  `tests/unit/agent/registry.test.ts`): permission labels as on the consent
  page; Refund orders and Delete things start unticked; seller details,
  team, 2FA, email, billing and account deletion stay with the person. The
  dashboard links to `https://claude.ai/settings/connectors`; Claude's own
  docs (checked 2026-11-03) place custom connectors under Customize >
  Connectors.

## 13. Third batch: site builders, selling, EU rules (verified 2026-11-05)

Pages added on 2026-11-05. Store paths relative to `Store/`; builder and law
facts from the official sources named here (each page also carries a
`TODO(adrian)` with its source and date).

- **Builder steps in the dashboard** (`storefront.json` `embed.builderSteps`,
  `src/lib/storefront/embed-builders.ts`): Another site, WordPress,
  Squarespace, Wix, Webflow, Shopify, Google Sites, Framer, Carrd. No Webnode
  entry. Only Wix (`<site-with-dashes>.filesusr.com`) and Google Sites frames
  are recognised (`isBuilderFrame` in `src/lib/storefront/embed.ts`), so
  Framer and Webnode pages ask for a test on a real site before publishing.
- **Builder plans** (official help centres, checked 2026-11-05): Squarespace
  scripts/iframes in Code blocks need Core, Plus or Advanced; Ajax loading is
  7.0 only. Webflow Code Embed needs a paid site plan. Carrd embeds need Pro
  Standard or higher. WordPress.com: "tags like iframe and script require a
  paid plan with hosting features activated". Webnode HTML is a premium
  feature for projects created after 26 June 2023, called "HTML" in EN and CS.
  Wix free address `siteprefix.wixsite.com/siteaddress`; Framer free domains
  framer.website/.photos/.media/.wiki. Not stated anywhere official: Wix and
  Framer plan rules for embeds, Framer/Webnode iframe rendering.
- **Orders** (`orders.json`): only Square Share checkout creates orders; the
  empty state says sales by own link or email will not show. No manual orders.
- **Discounts** (`discounts.json`, `src/lib/discounts/public.ts`,
  `src/components/product-page/SalePrice.tsx`): Sale (automatic) or Discount
  code; amount or percent; sales show on storefront tiles and product pages
  regardless of checkout; codes are typed at checkout, so unusable today. The
  crossed-out price note follows the 30-day prior price (`productPage.json`
  `sale.*`); the percentage shows only when proven against it.
- **Analytics** (`analytics.json`, `src/lib/analytics/record.ts`): storefront
  views, product clicks and product page views work now; sales and checkout
  views need checkout; IP and user agent hashed (salted SHA-256), raw values
  not stored. Email signups and bookings are listed but those widgets are
  unshipped. Page included on every plan; CSV export plan-gated.
- **Notifications** (`notifications.json`, `settings.json` `notifications`):
  in-app only while email is off. The RingingBell corner art is not used on a
  live settings card (only the dev gallery), so the docs page has none.
- **CSV import** (`src/lib/products/csv.ts`, `src/components/products/ProductImport.tsx`):
  Title and Price both required; skip reasons noTitle, titleTooLong (200),
  noPrice, priceZero, duplicateTitle (case-insensitive); 2 MB; rows capped at
  min(2000, plan product cap); good rows saved in one batch.
- **Downloads** (`src/lib/validation/product.ts`): ZIP, PDF, EPUB, MP3, WAV,
  MP4, JPEG, PNG, WebP, TXT up to 200 MB, contents checked against type.
  Delivery after payment exists only behind checkout. Product pages still say
  "Delivered as a download after purchase." while checkout is off: flagged.
- **Safety and compliance** (`products.json`, `src/lib/validation/product.ts`):
  manufacturer name/address/email (required once any field is filled), EU
  responsible person fields, identifier (80), warnings (2000); hidden for
  downloads.
- **EU law** (secondary copies, EUR-Lex did not load): GPSR (EU) 2023/988
  Art. 19, applies from 13 December 2024; Consumer Rights Directive
  2011/83/EU Art. 6(1)(b)-(c) and Art. 2(2); E-Commerce Directive 2000/31/EC
  Art. 5; CJEU C-649/17 (no duty to set up a phone line); Czech Civil Code
  § 1811, § 1820; Czech act 387/2024 Sb. Each page says it is not legal
  advice and carries a TODO to check the wording against EUR-Lex.
