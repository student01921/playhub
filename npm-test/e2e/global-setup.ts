import { chromium } from "@playwright/test";

const baseURL = "http://127.0.0.1:3101";

export default async function globalSetup() {
  // Warm the production server and its route chunks before four workers open
  // the same pages at once. Without this, the first concurrent request for the
  // heavier client route can spend the whole test timeout loading its bundle on
  // a cold Windows filesystem.
  const browser = await chromium.launch({ channel: "chrome", headless: true });
  const page = await browser.newPage();
  page.setDefaultNavigationTimeout(60_000);

  for (const path of ["/", "/games", "/finder", "/online", "/online/trivia", "/setup", "/login"]) {
    await page.goto(`${baseURL}${path}`, { waitUntil: "load" });
  }

  await browser.close();
}
