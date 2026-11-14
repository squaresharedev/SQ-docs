# Writing guide for Square Share docs

This guide is for anyone adding or editing pages in `content/docs`. Read it before writing a new page.

## File locations

English pages go in `content/docs/en/<section>/<slug>.mdx`.
Czech pages go in `content/docs/cs/<section>/<slug>.mdx`.

The section folder names are the same in both locales. Czech slugs use Czech words, for example:

| English slug | Czech slug |
| --- | --- |
| add-storefront-to-website | pridat-vyloku-na-web |
| add-purchase-button | pridat-tlacitko-pro-nakup |

Use lowercase kebab-case for all slugs in both locales.

## Frontmatter

Every page must have these five fields, and may add a sixth, `navTitle`. No others:

```yaml
title: How do I do the thing?
navTitle: Do the thing
description: You do the thing by doing this. Max 155 characters.
translationKey: my-page-slug
lastUpdated: 2026-11-02
draft: true
```

| Field | Rules |
| --- | --- |
| `title` | The question a user would type into a search engine or an AI assistant, ending in `?`. Every page, hubs included. It is the H1, the `<title>` and the headline in search results. No H1 in the body; the framework renders the title from this field. |
| `navTitle` | Optional. The short label in the sidebar and the last breadcrumb, at most 30 characters, such as `Add a product`. Use the dashboard's own word where there is one (`Orders`, `Allowed domains`). Without it both show the title. |
| `description` | The answer to the title, in one or two sentences, max 155 characters (Google cuts longer ones). Start with the answer itself: "Go to Settings, then...", "Nothing today.", "Yes." Never with "How to", "What", "Jak" or "Co", and never a list of what the page covers. Take the facts from the page's AnswerBlock. If it contains a colon, wrap the whole value in double quotes. |
| `translationKey` | Lowercase kebab-case. Must match exactly between the EN and CS files for the same page. Used for hreflang. |
| `lastUpdated` | ISO date of the last meaningful content change. Format `YYYY-MM-DD`. |
| `draft` | Boolean. Always `true` for new pages. Only a human changes it to `false`. |

No extra frontmatter keys. The build fails on unknown keys.

## Draft flow

A page with `draft: true`:
- Renders locally with a Draft banner.
- Gets a `noindex` meta tag.
- Is excluded from the sitemap, `llms.txt`, `llms-full.txt`, and hreflang links.

A page only appears in hreflang (and is treated as published) when both the EN and the CS translations of that `translationKey` have `draft: false`. Set both at the same time.

Only a human sets `draft: false`. Never set it in code or automation.

## meta.json

Each section folder has a `meta.json` that controls the sidebar:

```json
{ "title": "Section title", "defaultOpen": true, "pages": ["slug-one", "slug-two"] }
```

`pages` lists slugs in the order they appear in the sidebar, without the `.mdx` extension. When you add a new page, add its slug to the right `meta.json`.

## translationKey pairing

Each EN page and its CS counterpart share the same `translationKey`. The value must be identical in both files. If you add a new EN page you must create the matching CS file (even a stub with `draft: true`) and give both files the same `translationKey` before either can be published.

## Components

### AnswerBlock

Every page has exactly one `AnswerBlock`, placed right after the frontmatter closing `---`. The block contains one paragraph of 40 to 60 words. The lint fails outside that range.

```mdx
<AnswerBlock>

Write 40 to 60 words here. Answer the title question directly.

</AnswerBlock>
```

Blank lines inside the tags are required.

### GlossaryList

`<GlossaryList />` renders every term from `content/glossary.ts`.

`<GlossaryList terms="storefront embed purchase-button" />` renders a chosen subset. Keys are space-separated and must match the `key` fields in `glossary.ts`.

Use the full list on the Glossary page only. Use a chosen subset under "Key terms" sections.

### SectionCards

For the docs home page only. Wrap a Markdown list where each item has a link line and a description line with no blank line between them. Each card shows the icon of the page it links to (from `lib/icons.tsx`, by translationKey), so there is nothing to set:

```mdx
<SectionCards>

- [Section name](/en/section/slug)
  One sentence describing what is in this section.

</SectionCards>
```

### Blocks and pictures

These give pages the look of the homepage and the dashboard. Each one wraps
ordinary Markdown, so the `.md` version keeps the content.

| Component | What it does | In the `.md` version |
| --- | --- | --- |
| `<Steps>` | Wraps an ordered list; draws numbered step blocks. Use it for procedures. | The list |
| `<Snippet>` | Wraps a fenced code block the reader copies into their site; draws the dashboard's flowing green border. | The code block |
| `<Buttons>` | Wraps one paragraph of links; draws them as buttons (first solid, the rest outlined; external links get an up-right arrow). | The links |
| `<SetupMap>` | Wraps an ordered list; draws the dashboard's "Get set up" line beside it, as a new account sees it. Write each item as a bold label, a line break, then one sentence. Only for the dashboard's own setup steps. | The list |

Leave a blank line after every opening tag and before every closing tag, as
with AnswerBlock.

Each page's sidebar icon comes from `lib/icons.tsx`, keyed by translationKey;
add a new page's key there. A few pages also carry one of the dashboard's
animated settings pictures in the top right corner of their header
(`lib/corner-art.ts`). Only add one where the picture means what the page is
about, and where the dashboard shows the same picture: the receipt (billing)
sits on Payments and payouts, the route (the Shipping card) on Shipping and
returns, the code reels (the two-factor card) on Two-factor authentication.
Most pages have none.

Cards have the same thin border on all four sides. Do not give one edge its
own colour or weight (a thick coloured line down the left, say).

### Markdown version

Every page has a "View as Markdown" button. It opens the raw file at
`<page URL>.md`: plain text, no page design around it, the same file AI tools
read.

### Code blocks

Fenced code blocks with a title attribute. The copy button is automatic.

````
```html title="Snippet title"
<div>code here</div>
```
````

Use `text` as the language for prompt templates or other plain-text blocks.

### Internal links

Use absolute paths:

```md
[Link text](/en/section/slug)
[Glossary: storefront](/en/reference/glossary#storefront)
```

Glossary anchor IDs match the `key` field in `glossary.ts`.

### What not to use

Do not use tabs, accordions, or any component that hides content. Everything must be visible HTML.

## TODO(adrian) convention

When a fact needs confirming before a page can be published, add an MDX comment:

```mdx
{/* TODO(adrian): What needs confirming, and where to find the answer. */}
```

Use this instead of guessing. Never invent a URL, price, or product detail that is not in `RECON.md`.

## Writing rules

These rules apply to all English content in `content/docs/en`. A lint script at `pnpm content:lint` checks the mechanical ones and fails the build.

### No dashes

No em dash (the long one) and no en dash (the medium one) anywhere in content. Use a period, comma, colon, or parentheses instead.

### Banned words and phrases (English)

The following words and phrases are banned in any case:

delve, seamless, seamlessly, effortless, effortlessly, unlock, unleash, elevate, empower, game-changer, cutting-edge, revolutionize, robust, leverage, harness, embark, journey, landscape, tapestry, "in today's fast-paced", "whether you're", "it's not just", "look no further", "dive in", "let's explore", "in conclusion", "we exist to", "take it to the next level"

Also avoid:

- Rhetorical questions as openers.
- Triple-adjective stacks.
- Filler intros ("Welcome to...", "In this guide you will...").
- Summary outros ("In summary...", "Now you know how to...").
- "ours/yours" flip constructions.

### Banned words and phrases (Czech)

The following words and phrases are banned in Czech content:

bezproblémově, bez námahy, odemkněte, posuňte na další úroveň, v dnešní uspěchané době, revoluční, ponořme se

The no-dash rule applies to Czech content as well.

### Prices and fees

Never write prices, percentages, or the words fee, fees, or commission. No currency amounts of any kind.

The exceptions are the Payments and payouts hub (`payments-and-payouts/index.mdx`, `platby-a-vyplaty/index.mdx`), which states what Square Share charges, and the VAT page (`vat-and-taxes.mdx`, `dph-a-dane.mdx`), which quotes official thresholds. Every amount there comes from the Store code or from Adrian, and carries a `TODO(adrian)` until it is live.

### Future features

Never describe an unshipped feature in the present tense. Future features appear only in "What's coming next?" sections, in future tense, with no dates.

### Stripe

Do not present Stripe as a selling point. State the fact that payments go through the seller's own Stripe account when relevant.

### Terminology

| Use | Never use |
| --- | --- |
| purchase button | buy button, buy-button |
| storefront | store, shop |
| embed | widget (in prose) |
| dashboard | admin panel |
| Square Share | SquareShare, Squareshare |

Brand names are always "Square Share" (two words, consistent capitalisation).

### Tone and structure

- Plain, direct, short sentences.
- Instructional, not marketing. No slogans.
- The title is the question a user would type. The first two or three sentences of the AnswerBlock answer it.
- Use numbered steps for procedures.
- Use tables for comparisons.
- Use specific facts instead of adjectives.

## Running the lint

```
pnpm content:lint
```

The lint checks frontmatter against the schema in `lib/frontmatter.ts`, word counts in AnswerBlocks, banned words and phrases, no-dash rule, and deprecated glossary synonyms. Fix all failures before marking a page as non-draft.
