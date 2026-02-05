import { test, expect } from "@playwright/test";

const ROUTES = ["/", "/listings", "/supply", "/supply/developer", "/supply/owner", "/callback"];

test.describe("No corrupted Arabic or raw i18n keys", () => {
  for (const route of ROUTES) {
    test(`route ${route} has no ????? or home.* keys`, async ({ page }) => {
      await page.goto(route, { waitUntil: "networkidle" });
      const bodyText = await page.evaluate(() => document.body.innerText || "");
      expect(bodyText).not.toMatch(/\?{3,}/);
      expect(bodyText).not.toContain("home.");
    });
  }
});
