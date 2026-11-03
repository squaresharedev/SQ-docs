import { mkdirSync } from "node:fs";
import { join } from "node:path";
import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";
import { openPage, THEMES, watchErrors } from "./helpers.ts";
import { PAGES } from "./pages.ts";

const SCREENSHOT_DIR = join(process.cwd(), "tests", "screenshots");
const AXE_TAGS = ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"];

test.describe("page list", () => {
  test("out/ has pages in both languages", () => {
    expect(PAGES.filter((page) => page.locale === "en").length).toBeGreaterThan(0);
    expect(PAGES.filter((page) => page.locale === "cs").length).toBeGreaterThan(0);
  });
});

for (const docPage of PAGES) {
  for (const theme of THEMES) {
    test.describe(`${docPage.url} (${theme})`, () => {
      test("loads clean, fits the viewport, screenshot", async ({ page }, testInfo) => {
        const errors = watchErrors(page);
        await openPage(page, docPage.url, theme);

        const html = page.locator("html");
        if (theme === "dark") await expect(html).toHaveClass(/(^|\s)dark(\s|$)/);
        else await expect(html).not.toHaveClass(/(^|\s)dark(\s|$)/);
        await expect(page.locator("h1")).toHaveCount(1);

        if (testInfo.project.name === "mobile") {
          const sizes = await page.evaluate(() => ({
            scrollWidth: document.documentElement.scrollWidth,
            innerWidth: window.innerWidth,
          }));
          expect(sizes.scrollWidth, `horizontal overflow: scrollWidth ${sizes.scrollWidth} > innerWidth ${sizes.innerWidth}`).toBeLessThanOrEqual(sizes.innerWidth);
        }

        mkdirSync(SCREENSHOT_DIR, { recursive: true });
        await page.screenshot({
          path: join(SCREENSHOT_DIR, `${docPage.locale}-${docPage.slug}-${testInfo.project.name}-${theme}.png`),
          fullPage: true,
        });

        expect(errors.messages, errors.messages.join("\n")).toEqual([]);
      });

      test("axe: no serious or critical violations", async ({ page }, testInfo) => {
        test.skip(testInfo.project.name === "tablet", "axe runs at desktop and mobile");
        await openPage(page, docPage.url, theme);

        const results = await new AxeBuilder({ page }).withTags(AXE_TAGS).analyze();
        const serious = results.violations.filter((violation) => violation.impact === "serious" || violation.impact === "critical");
        const report = serious
          .map(
            (violation) =>
              `[${violation.impact}] ${violation.id}: ${violation.help}\n` +
              violation.nodes.map((node) => `    ${node.target.join(" ")}\n    ${node.failureSummary?.replace(/\n/g, "\n    ") ?? ""}`).join("\n"),
          )
          .join("\n");
        expect(serious, report).toEqual([]);
      });
    });
  }

  test.describe(`${docPage.url} (behaviour)`, () => {
    test.beforeEach(({}, testInfo) => {
      test.skip(testInfo.project.name !== "desktop", "behaviour checks run once, at desktop size");
    });

    test("internal links resolve", async ({ page, request, baseURL }) => {
      await page.goto(docPage.url);
      const hrefs = await page.$$eval("a[href]", (anchors) => anchors.map((anchor) => (anchor as HTMLAnchorElement).href));
      const base = new URL(baseURL ?? "http://localhost:8787");
      const siteOrigin = new URL(process.env.SITE_URL ?? "http://localhost:3100").origin;
      const targets = new Set<string>();
      for (const href of hrefs) {
        const url = new URL(href);
        if (url.origin !== base.origin && url.origin !== siteOrigin) continue;
        targets.add(`${url.pathname}${url.search}`);
      }
      expect(targets.size).toBeGreaterThan(0);
      const broken: string[] = [];
      for (const target of targets) {
        const response = await request.get(target);
        if (response.status() >= 400) broken.push(`${target} -> ${response.status()}`);
      }
      expect(broken, broken.join("\n")).toEqual([]);
    });

    test("View as Markdown opens the editor view, which links the raw .md", async ({ page, request }) => {
      await page.goto(docPage.url);
      const viewUrl = docPage.url.replace(/^\/(en|cs)/, "/$1/markdown");
      const link = page.locator(`article a[href="${viewUrl}"]`);
      await expect(link).toHaveCount(1);
      await link.click();
      await expect(page).toHaveURL(new RegExp(`${viewUrl}$`));
      // The page's real Markdown, highlighted, with its first line the title.
      await expect(page.locator(".ide-code .line").first()).toContainText("# ");
      const raw = page.locator('article a[type="text/markdown"]');
      await expect(raw).toHaveAttribute("href", docPage.markdownUrl);
      const response = await request.get(docPage.markdownUrl);
      expect(response.status()).toBe(200);
      expect(response.headers()["content-type"]).toMatch(/^text\/markdown/);
    });

    test("Copy page as Markdown puts the .md on the clipboard", async ({ page, context, request }) => {
      await context.grantPermissions(["clipboard-read", "clipboard-write"]);
      await page.goto(docPage.url);
      await page.waitForLoadState("networkidle");
      await page.locator("[data-copy-markdown]").click();
      await expect(page.locator("[data-copy-markdown]")).toContainText(docPage.locale === "cs" ? "Zkopírováno" : "Copied");
      const clipboard = await page.evaluate(() => navigator.clipboard.readText());
      const markdown = await (await request.get(docPage.markdownUrl)).text();
      expect(clipboard.replace(/\r\n/g, "\n")).toBe(markdown.replace(/\r\n/g, "\n"));
    });

    test("draft banner matches the draft flag", async ({ page }) => {
      await page.goto(docPage.url);
      const banner = page.locator("[data-draft-banner]");
      if (docPage.draft) await expect(banner).toBeVisible();
      else await expect(banner).toHaveCount(0);
    });
  });
}
