import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";
import { openPage, THEMES } from "./helpers.ts";
import { PAGES } from "./pages.ts";

const EN = "/en/what-is-square-share";
const CS = "/cs/co-je-square-share";

test.beforeEach(({}, testInfo) => {
  test.skip(testInfo.project.name !== "desktop", "site-wide checks run once, at desktop size");
});

test.describe("language switcher", () => {
  test("the switcher links are in the raw HTML", async ({ request }) => {
    for (const [from, to] of [
      [EN, CS],
      [CS, EN],
    ] as const) {
      const html = await (await request.get(from)).text();
      const nav = /<nav aria-label="(?:Language|Jazyk)"[\s\S]*?<\/nav>/.exec(html)?.[0] ?? "";
      expect(nav, `no language <nav> in the raw HTML of ${from}`).not.toBe("");
      expect(nav).toContain(`href="${to}"`);
      expect(nav).toContain(`href="${from}"`);
    }
  });

  test("EN to CS lands on the paired page", async ({ page }) => {
    await page.goto(EN);
    const nav = page.locator("header").getByRole("navigation", { name: "Language" });
    await nav.locator('a[hreflang="cs"]').click();
    await expect(page).toHaveURL(new RegExp(`${CS}$`));
    await expect(page.locator("html")).toHaveAttribute("lang", "cs");
  });

  test("CS to EN lands on the paired page", async ({ page }) => {
    await page.goto(CS);
    const nav = page.locator("header").getByRole("navigation", { name: "Jazyk" });
    await nav.locator('a[hreflang="en"]').click();
    await expect(page).toHaveURL(new RegExp(`${EN}$`));
    await expect(page.locator("html")).toHaveAttribute("lang", "en");
  });
});

/** A word of at least four letters from the page title, for when the preferred term is not indexed yet. */
async function fallbackTerm(page: Page): Promise<string> {
  const title = (await page.locator("h1").first().innerText()).trim();
  return title.split(/\s+/).find((word) => word.replace(/[^\p{L}]/gu, "").length >= 4) ?? title;
}

async function openSearch(page: Page): Promise<void> {
  // The dashboard's search field: a button that opens the palette.
  const trigger = page.locator('header button[aria-haspopup="dialog"]').first();
  await expect(trigger).toBeVisible();
  await trigger.click();
  await expect(page.getByRole("dialog")).toBeVisible();
}

async function searchFor(page: Page, term: string): Promise<void> {
  const input = page.getByRole("dialog").getByRole("combobox");
  await input.fill(term);
  await page.waitForLoadState("networkidle");
}

for (const [home, term, prefix] of [
  ["/en", "storefront", "/en/"],
  ["/cs", "výloha", "/cs/"],
] as const) {
  test(`search on ${home} finds results under ${prefix}`, async ({ page }) => {
    await page.goto(home);
    await page.waitForLoadState("networkidle");
    await openSearch(page);
    const dialog = page.getByRole("dialog");
    const items = dialog.getByRole("option");

    await searchFor(page, term);
    const found = await items.first().waitFor({ state: "visible", timeout: 3000 }).then(
      () => true,
      () => false,
    );
    if (!found) {
      // The content may still be thin: search for a word from the page title.
      await searchFor(page, await fallbackTerm(page));
    }
    await expect(items.first()).toBeVisible();

    // Picking the first result opens a page in the same language: one under
    // the prefix, or a heading on the locale home itself (/en#heading).
    await items.first().click();
    await expect(page).toHaveURL(new RegExp(`//[^/]+(${prefix}|${home}([#?]|$))`));
    await expect(page.getByRole("dialog")).toHaveCount(0);
  });
}

test("Control+K opens search", async ({ page }) => {
  await page.goto("/en");
  await page.waitForLoadState("networkidle");
  await page.keyboard.press("Control+k");
  await expect(page.getByRole("dialog")).toBeVisible();
});

async function expectNoSeriousAxe(page: Page, include?: string): Promise<void> {
  const builder = new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"]);
  const results = await (include ? builder.include(include) : builder).analyze();
  const serious = results.violations.filter((violation) => violation.impact === "serious" || violation.impact === "critical");
  const report = serious
    .map((violation) => `[${violation.impact}] ${violation.id}: ${violation.nodes.map((node) => node.target.join(" ")).join(", ")}`)
    .join("\n");
  expect(serious, report).toEqual([]);
}

// The palette only exists while open, so the per-page axe checks never see it.
for (const theme of THEMES) {
  test(`axe: the open search palette (${theme})`, async ({ page }) => {
    await openPage(page, "/en", theme);
    await openSearch(page);
    await searchFor(page, "storefront");
    await expect(page.getByRole("dialog").getByRole("option").first()).toBeVisible();
    await expectNoSeriousAxe(page, '[role="dialog"]');
  });
}

test("the sidebar ends with the legal pages, in both languages", async ({ page }) => {
  for (const [url, label] of [
    [EN, "Legal"],
    [CS, "Právní informace"],
  ] as const) {
    await page.goto(url);
    const sidebar = page.locator("#nd-sidebar");
    await expect(sidebar.locator("[data-radix-scroll-area-viewport] > div > p")).toHaveText(label);
    // The last four sidebar links, in the footer's order, all on squareshare.eu.
    const hrefs = await sidebar.locator("a[data-active]").evaluateAll((links) => links.slice(-4).map((a) => a.getAttribute("href")));
    expect(hrefs).toEqual([
      "https://squareshare.eu/legal/privacy-policy/",
      "https://squareshare.eu/legal/cookie-policy/",
      "https://squareshare.eu/terms",
      "https://squareshare.eu/accessibility",
    ]);
  }
});

test.describe("Markdown negotiation through the Worker", () => {
  test("Accept: text/markdown returns the .md version", async ({ request }) => {
    const response = await request.get(EN, { headers: { Accept: "text/markdown" } });
    expect(response.status()).toBe(200);
    expect(response.headers()["content-type"]).toBe("text/markdown; charset=utf-8");
    expect(response.headers()["vary"]).toMatch(/accept/i);
    expect((await response.text()).startsWith("# ")).toBe(true);
  });

  test("without the header the same URL is HTML", async ({ request }) => {
    const response = await request.get(EN);
    expect(response.status()).toBe(200);
    expect(response.headers()["content-type"]).toMatch(/^text\/html/);
    expect(response.headers()["vary"]).toMatch(/accept/i);
  });

  test("every page negotiates", async ({ request }) => {
    const failures: string[] = [];
    for (const docPage of PAGES) {
      const response = await request.get(docPage.url, { headers: { Accept: "text/markdown" } });
      const type = response.headers()["content-type"] ?? "";
      if (response.status() !== 200 || !type.startsWith("text/markdown")) failures.push(`${docPage.url}: ${response.status()} ${type}`);
    }
    expect(failures, failures.join("\n")).toEqual([]);
  });
});
