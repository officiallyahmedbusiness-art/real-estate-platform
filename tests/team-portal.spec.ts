import { test, expect } from "@playwright/test";

test.use({ locale: "ar-EG" });

test("team login link is visible on the public site", async ({ page }) => {
  await page.goto("/");
  await expect(
    page.getByRole("link", { name: /تسجيل دخول فريق العمل|Team Login/i }).first()
  ).toBeVisible();
});

test("team portal redirects unauthenticated users to /team/login", async ({ page }) => {
  await page.goto("/team");
  await expect(page).toHaveURL(/\/team\/login/);
});

test("team login page shows portal notice", async ({ page }) => {
  await page.goto("/team/login");
  await expect(page.getByText(/مخصص لفريق العمل والشركاء|Team & Partners Only/i)).toBeVisible();
});

test("no public signup route", async ({ page }) => {
  const res = await page.goto("/signup");
  expect(res?.status()).toBe(404);
});
