import { test, expect } from "@playwright/test";

const VIEWPORTS = [
  { width: 390, height: 844 },
  { width: 320, height: 720 },
];

test("mobile viewports have no horizontal overflow and menu fits", async ({ page }) => {
  for (const viewport of VIEWPORTS) {
    await page.setViewportSize(viewport);
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
      expect(box.x + box.width).toBeLessThanOrEqual(viewport.width + 1);
      expect(box.y + box.height).toBeLessThanOrEqual(viewport.height + 1);
    }
  }
});
