import { test, expect } from "@playwright/test";

test.use({ locale: "ar-EG" });

test("brand stays هارتچ after hydration and navigation", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator("body")).toContainText("هارتچ");

  let bodyText = await page.textContent("body");
  expect(bodyText).toContain("هارتچ");
  expect(bodyText).not.toContain("هارتج");

  await page.reload({ waitUntil: "networkidle" });
  bodyText = await page.textContent("body");
  expect(bodyText).toContain("هارتچ");
  expect(bodyText).not.toContain("هارتج");

  await page.goto("/about");
  bodyText = await page.textContent("body");
  expect(bodyText).toContain("هارتچ");
  expect(bodyText).not.toContain("هارتج");

  await page.goto("/listings");
  bodyText = await page.textContent("body");
  expect(bodyText).toContain("هارتچ");
  expect(bodyText).not.toContain("هارتج");
});
