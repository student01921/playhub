import { expect, test } from "@playwright/test";

const routes = ["/", "/games", "/games/charades", "/finder", "/online", "/online/trivia", "/how-it-works", "/setup", "/login"];

for (const width of [320, 768, 1440]) {
  test(`key pages fit a ${width}px viewport without horizontal overflow`, async ({ page }) => {
    await page.setViewportSize({ width, height: width === 320 ? 720 : 1000 });

    for (const path of routes) {
      const response = await page.goto(path, { waitUntil: "networkidle" });
      expect(response?.status(), path).toBe(200);

      const metrics = await page.evaluate(() => ({
        scrollWidth: document.documentElement.scrollWidth,
        clientWidth: document.documentElement.clientWidth,
        bodyScrollWidth: document.body.scrollWidth,
      }));

      expect(metrics.scrollWidth, `${path} document overflow at ${width}px`).toBeLessThanOrEqual(metrics.clientWidth + 1);
      expect(metrics.bodyScrollWidth, `${path} body overflow at ${width}px`).toBeLessThanOrEqual(metrics.clientWidth + 1);
    }
  });
}

test("primary mobile controls meet the 44px touch target", async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 720 });
  await page.goto("/");

  const menuButton = page.getByRole("button", { name: "Open menu" });
  const size = await menuButton.boundingBox();
  expect(size?.width).toBeGreaterThanOrEqual(44);
  expect(size?.height).toBeGreaterThanOrEqual(44);

  const primaryCta = page.getByRole("link", { name: "Explore the games" }).first();
  const cta = await primaryCta.boundingBox();
  expect(cta?.height).toBeGreaterThanOrEqual(44);
});

test("reduced motion collapses decorative transitions", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");

  const duration = await page
    .getByRole("link", { name: "Explore the games" })
    .first()
    .evaluate((element) => getComputedStyle(element).transitionDuration);
  expect(["0.01ms", "1e-05s"]).toContain(duration);
});

test("keyboard focus is visible on the primary navigation", async ({ page }) => {
  await page.goto("/games");
  await page.keyboard.press("Tab");
  await page.keyboard.press("Tab");
  const focusedOutline = await page.evaluate(() => {
    const element = document.activeElement as HTMLElement;
    const style = getComputedStyle(element);
    return {
      tag: element.tagName,
      outlineWidth: style.outlineWidth,
      outlineStyle: style.outlineStyle,
      boxShadow: style.boxShadow,
    };
  });
  expect(focusedOutline.tag).not.toBe("BODY");
  expect(
    focusedOutline.outlineStyle !== "none" || focusedOutline.boxShadow !== "none",
    JSON.stringify(focusedOutline),
  ).toBe(true);
});
