import { test, expect, type Page, type Route } from "@playwright/test";
import { createClient } from "@supabase/supabase-js";

test.use({ locale: "ar-EG" });

const mockListings = [
  {
    id: "11111111-1111-1111-1111-111111111111",
    title: "شقة في المعادي",
    price: 2500000,
    currency: "EGP",
    city: "القاهرة",
    area: "المعادي",
    beds: 3,
    baths: 2,
    size_m2: 140,
    purpose: "sale",
    type: "apartment",
    amenities: [],
    listing_images: [],
  },
  {
    id: "22222222-2222-2222-2222-222222222222",
    title: "فيلا في الشيخ زايد",
    price: 7200000,
    currency: "EGP",
    city: "الجيزة",
    area: "الشيخ زايد",
    beds: 5,
    baths: 4,
    size_m2: 320,
    purpose: "sale",
    type: "villa",
    amenities: [],
    listing_images: [],
  },
];

const hasEnv = Boolean(
  process.env.SUPABASE_SERVICE_ROLE_KEY &&
    (process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL)
);

const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

async function mockListingsByIds(page: Page) {
  await page.route("**/api/listings/by-ids", async (route: Route) => {
    await route.fulfill({
      status: 200,
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ listings: mockListings }),
    });
  });
}

test("guest favorites persist across reload", async ({ page }) => {
  await mockListingsByIds(page);
  await page.goto("/saved");
  await page.evaluate(() => {
    localStorage.setItem("hrtaj:favorites:v1", JSON.stringify(["11111111-1111-1111-1111-111111111111"]));
  });
  await page.reload();
  await expect(page.locator("text=شقة في المعادي")).toBeVisible();

  await page.locator(".favorite-button").first().click();
  await expect(page.getByText(/مفيش عقارات محفوظة/)).toBeVisible();

  await page.reload();
  await expect(page.getByText(/مفيش عقارات محفوظة/)).toBeVisible();
});

test("compare bar appears after selecting two listings", async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem(
      "hrtaj:favorites:v1",
      JSON.stringify([
        "11111111-1111-1111-1111-111111111111",
        "22222222-2222-2222-2222-222222222222",
      ])
    );
    localStorage.setItem("hrtaj:compare:v1", JSON.stringify([]));
  });
  await mockListingsByIds(page);
  await page.goto("/saved");

  const buttons = page.locator(".compare-button");
  await expect(buttons).toHaveCount(2);
  await buttons.nth(0).click();
  await buttons.nth(1).click();

  const bar = page.locator(".compare-bar");
  await expect(bar).toBeVisible();
  await expect(bar).toContainText("(2)");
});

test("saved search creates and replays query string", async ({ page }) => {
  await page.goto("/listings?transaction=rent&city=%D8%A7%D9%84%D9%82%D8%A7%D9%87%D8%B1%D8%A9");

  await page.locator("button", { hasText: /حفظ البحث|Save search/i }).click();
  const modalInput = page.locator(".modal-panel input");
  await expect(modalInput).toBeVisible();
  await modalInput.fill("بحث القاهرة");
  await page.locator(".modal-panel button", { hasText: /حفظ البحث|Save search/i }).click();

  await page.goto("/saved-searches");
  await expect(page.locator("text=بحث القاهرة")).toBeVisible();

  await page.locator("a", { hasText: /تشغيل|Run/i }).first().click();
  await expect(page).toHaveURL(/transaction=rent/);
});

test("whatsapp click fires analytics without PII", async ({ page }) => {
  test.skip(!hasEnv, "Needs service role key to seed WhatsApp number");
  await page.addInitScript(() => {
    localStorage.setItem("hrtaj:favorites:v1", JSON.stringify(["11111111-1111-1111-1111-111111111111"]));
  });
  await mockListingsByIds(page);

  const admin = createClient(supabaseUrl, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
  const key = "whatsapp_number";
  const { data: existing } = await admin.from("site_settings").select("value").eq("key", key).maybeSingle();
  try {
    await admin.from("site_settings").upsert({ key, value: "+201001112233" }, { onConflict: "key" });
    await page.goto("/saved");

    await page.evaluate(() => {
      window.__hrtajEvents = [];
    });

    const whatsappButton = page
      .locator(".listing-card-actions a", { hasText: /واتساب|WhatsApp/i })
      .first();
    await expect(whatsappButton).toBeVisible();
    await whatsappButton.click();

    await page.waitForTimeout(100);
    const events = await page.evaluate(() => window.__hrtajEvents || []);
    const event = events.find((item: { event: string }) => item.event === "whatsapp_click");
    expect(event).toBeTruthy();
    if (!event) {
      throw new Error("Missing whatsapp_click event");
    }
    const payload = event.payload || {};
    expect(payload.phone).toBeUndefined();
    expect(payload.message).toBeUndefined();
    expect(payload.email).toBeUndefined();
  } finally {
    if (existing?.value) {
      await admin.from("site_settings").upsert({ key, value: existing.value }, { onConflict: "key" });
    } else {
      await admin.from("site_settings").delete().eq("key", key);
    }
  }
});

test("locale switch changes dir without hydration errors", async ({ page }) => {
  const errors: string[] = [];
  page.on("console", (msg) => {
    if (msg.type() === "error" || msg.type() === "warning") {
      errors.push(msg.text());
    }
  });

  await page.goto("/");
  await page.locator("button:visible", { hasText: /English|الإنجليزية|الانجليزية/i }).first().click();
  await page.waitForLoadState("networkidle");

  const dir = await page.getAttribute("html", "dir");
  const lang = await page.getAttribute("html", "lang");
  expect(dir).toBe("ltr");
  expect(lang).toBe("en");

  const hydrationError = errors.some((msg) => /hydration|did not match/i.test(msg));
  expect(hydrationError).toBeFalsy();
});
