import { test, expect } from "@playwright/test";

test.use({ locale: "ar-EG" });

test("filters are driven by URL query params", async ({ page }) => {
  await page.goto(
    "/listings?transaction=rent&priceMin=1000000&priceMax=2500000&beds=3&view=list"
  );

  const form = page.locator("form#listing-filters-form-desktop");
  await expect(form).toBeVisible();
  await expect(form.locator('select[name="transaction"]')).toHaveValue("rent");
  await expect(form.locator('input[name="priceMin"]')).toHaveValue("1000000");
  await expect(form.locator('input[name="priceMax"]')).toHaveValue("2500000");
  await expect(form.locator('input[name="beds"]')).toHaveValue("3");
  await expect(form.locator('input[name="view"]')).toHaveValue("list");
});
