import { test, expect } from "@playwright/test";

test("mobile viewport has no horizontal overflow and menu fits", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");

  const sizes = await page.evaluate(() => ({
    scrollWidth: document.documentElement.scrollWidth,
    clientWidth: document.documentElement.clientWidth,
  }));
  expect(sizes.scrollWidth).toBeLessThanOrEqual(sizes.clientWidth + 1);

  const menuTrigger = page.locator("summary").filter({ hasText: /القائمة|Menu/i });
  await expect(menuTrigger).toBeVisible();
  await menuTrigger.click();

  const panel = page.locator(".mobile-menu-panel");
  await expect(panel).toBeVisible();
  const box = await panel.boundingBox();
  expect(box).not.toBeNull();
  if (box) {
    expect(box.x).toBeGreaterThanOrEqual(0);
    expect(box.x + box.width).toBeLessThanOrEqual(390 + 1);
    expect(box.y + box.height).toBeLessThanOrEqual(844 + 1);
  }
});
