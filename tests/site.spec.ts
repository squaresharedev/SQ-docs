import { expect, test, type Page } from "@playwright/test";
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
  const trigger = page.locator("header [data-search-full]");
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

    // Results are role=option rows whose id is "fd-search-option-<page URL>[-<hit index>]".
    const ids = await items.evaluateAll((rows) => rows.map((row) => row.id));
    expect(ids.length).toBeGreaterThan(0);
    for (const id of ids) {
      const url = id.replace(/^fd-search-option-/, "").replace(/-\d+$/, "");
      expect(url === prefix.slice(0, -1) || url.startsWith(prefix), `result ${id} is not under ${prefix}`).toBe(true);
    }
  });
}

test("Control+K opens search", async ({ page }) => {
  await page.goto("/en");
  await page.waitForLoadState("networkidle");
  await page.keyboard.press("Control+k");
  await expect(page.getByRole("dialog")).toBeVisible();
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
