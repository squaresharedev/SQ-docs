import type { ConsoleMessage, Page } from "@playwright/test";

export type Theme = "light" | "dark";
export const THEMES: readonly Theme[] = ["light", "dark"];

/** next-themes reads localStorage["theme"] before first paint. */
export async function setTheme(page: Page, theme: Theme): Promise<void> {
  await page.addInitScript((value) => {
    try {
      window.localStorage.setItem("theme", value);
    } catch {
      // storage can be blocked; the test then fails on the html.dark assertion
    }
  }, theme);
}

/** Collects console errors and uncaught page errors. */
export function watchErrors(page: Page): { messages: string[] } {
  const messages: string[] = [];
  page.on("console", (message: ConsoleMessage) => {
    if (message.type() !== "error") return;
    const where = message.location().url;
    messages.push(`console.error: ${message.text()}${where ? ` (${where})` : ""}`);
  });
  page.on("pageerror", (error) => {
    messages.push(`pageerror: ${error.message}`);
  });
  return { messages };
}

/**
 * Waits until the page stops moving: network idle, web fonts loaded and every
 * finite CSS animation or transition finished. Infinite animations (spinners)
 * are ignored, they would never end.
 */
export async function settle(page: Page): Promise<void> {
  await page.waitForLoadState("networkidle");
  await page.evaluate(async () => {
    await document.fonts.ready;
    for (let round = 0; round < 5; round += 1) {
      const running = document
        .getAnimations()
        .filter((animation) => animation.playState === "running" && animation.effect?.getComputedTiming().iterations !== Infinity);
      if (running.length === 0) break;
      await Promise.all(running.map((animation) => animation.finished.catch(() => undefined)));
    }
    await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));
  });
}

/** Opens a page with a theme preset and waits for it to settle. */
export async function openPage(page: Page, url: string, theme: Theme): Promise<void> {
  await setTheme(page, theme);
  await page.goto(url);
  await settle(page);
}
