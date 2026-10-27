import { expect, test } from "@playwright/test";

const publicRoutes = [
  ["/", "Good times."],
  ["/games", "The game shelf."],
  ["/games/charades", "Charades"],
  ["/finder", "A shortlist,"],
  ["/online", "The table goes"],
  ["/online/trivia", "Party Trivia"],
  ["/online/trivia/room/ABCDEF", /Room ABCDEF|Sign in to take your seat/],
  ["/how-it-works", "What this site"],
  ["/setup", "Connect the backend."],
  ["/login", /Sign in/],
  ["/signup", "Create an account"],
  ["/forgot-password", "Reset your password"],
  ["/reset-password", "Choose a new password"],
  ["/dashboard", /Your dashboard|Sign in/],
] as const;

for (const [path, heading] of publicRoutes) {
  test(`${path} renders without console or page errors`, async ({ page }) => {
    const consoleErrors: string[] = [];
    page.on("console", (message) => {
      if (message.type() === "error") consoleErrors.push(message.text());
    });
    page.on("pageerror", (error) => consoleErrors.push(error.message));

    const response = await page.goto(path);
    expect(response?.status()).toBe(200);
    await expect(page.locator("h1")).toContainText(heading);
    await expect(page.locator("header")).toBeVisible();
    await expect(page.locator("footer")).toBeVisible();
    expect(consoleErrors, consoleErrors.join("\n")).toEqual([]);
  });
}

test("the setup page exposes the linked environment and migration sections", async ({ page }) => {
  await page.goto("/setup");

  await expect(page.locator("#env")).toBeVisible();
  await expect(page.locator("#migrations")).toBeVisible();
  await expect(page.locator("#env")).toContainText("Fill in the environment");
  await expect(page.locator("#migrations")).toContainText("Apply both migrations");
});

test("the homepage images load after scrolling", async ({ page }) => {
  await page.goto("/", { waitUntil: "networkidle" });

  const howImage = page.locator('img[alt*="concentrating"]');
  await howImage.scrollIntoViewIfNeeded();
  await expect
    .poll(() => howImage.evaluate((image) => (image as HTMLImageElement).naturalWidth))
    .toBeGreaterThan(0);

  const heroImage = page.locator('img[alt*="high-fiving"]');
  await expect
    .poll(() => heroImage.evaluate((image) => (image as HTMLImageElement).naturalWidth))
    .toBeGreaterThan(0);
});

test("the skip link moves focus targets to the main content", async ({ page }) => {
  await page.goto("/");
  await page.keyboard.press("Tab");
  const skipLink = page.getByRole("link", { name: "Skip to content" });
  await expect(skipLink).toBeFocused();
  await expect(skipLink).toHaveAttribute("href", "#main-content");
  await expect(page.locator("main#main-content")).toHaveCount(1);
});

test("unknown routes use the designed 404 page", async ({ page }) => {
  const response = await page.goto("/not-a-real-page");
  expect(response?.status()).toBe(404);
  await expect(page.getByRole("heading", { level: 1 })).toContainText("This page wandered off.");
  await expect(page.getByRole("link", { name: "Browse the games" })).toBeVisible();
});

test("the header mobile menu opens, traps visual focus and closes with Escape", async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto("/");
  const menuButton = page.getByRole("button", { name: "Open menu" });
  await expect(menuButton).toBeVisible();
  await menuButton.click();
  await expect(page.getByRole("button", { name: "Close menu" }).first()).toHaveAttribute("aria-expanded", "true");
  const mobileNav = page.getByRole("navigation", { name: "Mobile" });
  await expect(mobileNav).toBeVisible();
  await expect(mobileNav.getByRole("link", { name: "Offline games" })).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(menuButton).toBeVisible();
  await expect(mobileNav).toHaveCount(0);
});

test("an offline game page contains instructions and a working route back", async ({ page }) => {
  await page.goto("/games/charades");
  await expect(page.getByRole("heading", { level: 1, name: "Charades" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "How to play Charades" })).toBeVisible();
  await page.getByRole("link", { name: "All games" }).click();
  await expect(page).toHaveURL(/\/games$/);
  await expect(page.getByRole("heading", { level: 1 })).toContainText("The game shelf.");
});
