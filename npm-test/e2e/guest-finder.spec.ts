import { expect, test } from "@playwright/test";

test.describe("game finder", () => {
  test("URL preferences prefill the form and produce an explained shortlist", async ({ page }) => {
    await page.goto("/finder?occasion=house-party&players=6&ageGroup=13&minutes=30&format=all&style=funny");

    await expect(page.getByRole("button", { name: "House party" })).toHaveAttribute("aria-pressed", "true");
    await expect(page.getByRole("button", { name: "Teens 13+" })).toHaveAttribute("aria-pressed", "true");
    await expect(page.getByRole("button", { name: "30 min" })).toHaveAttribute("aria-pressed", "true");
    await expect(page.getByRole("button", { name: "Either way" })).toHaveAttribute("aria-pressed", "true");
    await expect(page.getByRole("button", { name: "Funny" })).toHaveAttribute("aria-pressed", "true");

    await expect(page.getByRole("heading", { name: "4 games fit the room." })).toBeVisible();
    await expect(page.getByRole("link", { name: /Charades/ })).toBeVisible();
    await expect(page.getByRole("link", { name: /Party Trivia/ })).toBeVisible();
    await expect(page.getByText("Funny energy").first()).toBeVisible();
    await expect(page.getByText(/6 people .* House party .* up to 30 min/)).toBeVisible();
  });

  test("changing format updates results without a page reload", async ({ page }) => {
    await page.goto("/finder?occasion=house-party&players=6&ageGroup=13&minutes=30&format=all&style=funny");
    await expect(page.getByRole("heading", { name: "4 games fit the room." })).toBeVisible();

    await page.getByRole("button", { name: "Online", exact: true }).click();
    await expect(page.getByRole("heading", { name: "1 game fits the room." })).toBeVisible();
    await expect(page.getByRole("link", { name: /Party Trivia/ })).toBeVisible();
    await expect(page.getByRole("link", { name: /Charades/ })).toHaveCount(0);

    await page.getByRole("button", { name: "In person" }).click();
    await expect(page.getByRole("heading", { name: "3 games fit the room." })).toBeVisible();
    await expect(page.getByRole("link", { name: /Party Trivia/ })).toHaveCount(0);
  });

  test("reset returns the finder to the documented defaults", async ({ page }) => {
    await page.goto("/finder?occasion=house-party&players=6&ageGroup=13&minutes=30&format=online&style=funny");
    await page.getByRole("button", { name: "Reset" }).first().click();
    await expect(page.getByRole("button", { name: "Casual hangout" })).toHaveAttribute("aria-pressed", "true");
    await expect(page.getByRole("button", { name: "Teens 13+" })).toHaveAttribute("aria-pressed", "true");
    await expect(page.getByRole("button", { name: "60 min" })).toHaveAttribute("aria-pressed", "true");
    await expect(page.getByRole("button", { name: "Any kind of energy" })).toHaveAttribute("aria-pressed", "true");
  });

  test("a hard-constraint miss has an honest empty state", async ({ page }) => {
    await page.goto("/finder?occasion=house-party&players=6&ageGroup=8&minutes=15&format=online&style=funny");
    await expect(page.getByRole("heading", { name: "Nothing fits all of that — yet." })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Try widening one thing." })).toBeVisible();
    await expect(page.getByRole("button", { name: "Any mood" })).toBeVisible();
  });

  test("a style with no exact match is labelled, not hidden", async ({ page }) => {
    await page.goto("/finder?occasion=house-party&players=6&ageGroup=13&minutes=30&format=online&style=strategic");
    await expect(page.getByRole("link", { name: /Party Trivia/ })).toBeVisible();
    await expect(page.getByText(/No exact strategic match for this combination/)).toBeVisible();
  });
});
