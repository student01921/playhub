import { expect, test } from "@playwright/test";

test.describe("offline game explorer", () => {
  test("search narrows the shelf and clears again", async ({ page }) => {
    await page.goto("/games");
    const search = page.getByRole("searchbox", { name: "Search games" });
    const status = page.locator('p[aria-live="polite"]').first();
    await expect(status).toHaveText("10 games");

    await search.fill("mafia");
    await expect(status).toContainText("1 game");
    await expect(page.getByRole("link", { name: /Mafia/ })).toBeVisible();

    await page.getByRole("button", { name: "Clear search" }).click();
    await expect(status).toHaveText("10 games");
    await expect(search).toHaveValue("");
  });

  test("filters combine and can be cleared", async ({ page }) => {
    await page.goto("/games");
    const status = page.locator('p[aria-live="polite"]').first();

    await page.getByRole("button", { name: "Under 30 min" }).click();
    await expect(page.getByRole("button", { name: "Under 30 min" })).toHaveAttribute("aria-pressed", "true");
    await expect(status).not.toHaveText("10 games");

    await page.getByRole("button", { name: "Family · 8+" }).click();
    await expect(page.getByRole("button", { name: "Family · 8+" })).toHaveAttribute("aria-pressed", "true");

    const filteredCount = await status.textContent();
    await page.getByRole("button", { name: "Clear all filters" }).click();
    await expect(status).toHaveText("10 games");
    expect(filteredCount).not.toBe("10 games");
  });

  test("search covers materials, not just titles", async ({ page }) => {
    await page.goto("/games");
    await page.getByRole("searchbox", { name: "Search games" }).fill("sticky notes");
    await expect(page.getByRole("link", { name: /Who Am I/ })).toBeVisible();
    await expect(page.locator('p[aria-live="polite"]').first()).toContainText("1 game");
  });

  test("a no-result combination offers a way back", async ({ page }) => {
    await page.goto("/games");
    await page.getByRole("searchbox", { name: "Search games" }).fill("zzzz-no-such-game");
    await expect(page.getByRole("heading", { name: "No games match that combination." })).toBeVisible();
    await page.getByRole("button", { name: "Clear filters" }).click();
    await expect(page.locator('p[aria-live="polite"]').first()).toHaveText("10 games");
  });

  test("occasion URLs pre-filter the explorer", async ({ page }) => {
    await page.goto("/games?occasion=sleepover");
    const status = page.locator('p[aria-live="polite"]').first();
    await expect(status).not.toHaveText("10 games");
    await expect(page.getByText("Filtered for: Sleepover")).toBeVisible();
  });
});
