import { test, expect } from "@playwright/test";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

let listingId: string | null = null;

async function fetchListingId() {
  if (!SUPABASE_URL || !SUPABASE_KEY) return null;
  const url = `${SUPABASE_URL}/rest/v1/listings?select=id&status=eq.published&limit=1`;
  const res = await fetch(url, {
    headers: {
      apikey: SUPABASE_KEY,
      Authorization: `Bearer ${SUPABASE_KEY}`,
    },
  });
  if (!res.ok) return null;
  const data = (await res.json()) as Array<{ id: string }>;
  return data[0]?.id ?? null;
}

test.beforeAll(async () => {
  listingId = await fetchListingId();
});

test("gallery works on mobile and watermark is visible", async ({ page }) => {
  test.skip(!listingId, "No published listing available for gallery test.");
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(`/listing/${listingId}`);
  await expect(page.locator(".gallery-track")).toBeVisible();
  await expect(page.locator(".media-watermark").first()).toBeVisible();
});

test("no horizontal overflow at 320px", async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 720 });
  await page.goto("/");
  const hasOverflow = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth + 1);
  expect(hasOverflow).toBeFalsy();
});
