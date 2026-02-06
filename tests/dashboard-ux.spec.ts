import { test, expect, type Page } from "@playwright/test";
import { createClient } from "@supabase/supabase-js";
import { randomUUID } from "crypto";

const hasEnv =
  Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY) &&
  Boolean(process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL) &&
  Boolean(process.env.E2E_ADMIN_EMAIL) &&
  Boolean(process.env.E2E_ADMIN_PASSWORD) &&
  Boolean(process.env.E2E_OWNER_EMAIL) &&
  Boolean(process.env.E2E_OWNER_PASSWORD) &&
  Boolean(process.env.OWNER_SECRET);

const describeBlock = hasEnv ? test.describe : test.describe.skip;

const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
const adminEmail = process.env.E2E_ADMIN_EMAIL || "";
const adminPassword = process.env.E2E_ADMIN_PASSWORD || "";
const ownerEmail = process.env.E2E_OWNER_EMAIL || "";
const ownerPassword = process.env.E2E_OWNER_PASSWORD || "";
const ownerSecret = process.env.OWNER_SECRET || "";

async function signIn(page: Page, email: string, password: string) {
  await page.goto("/team/login");
  await page.getByLabel(/Email|البريد/i).fill(email);
  await page.getByLabel(/Password|كلمة المرور/i).fill(password);
  await page.getByRole("button", { name: /تسجيل الدخول|Sign in/i }).click();
  await page.waitForURL(/\/team/);
}

async function unlockOwner(page: Page) {
  await page.goto("/owner");
  await page.getByLabel(/مفتاح|Owner key/i).fill(ownerSecret);
  await page.getByRole("button", { name: /فتح اللوحة|Unlock/i }).click();
  await page.waitForURL(/\/owner/);
}

async function expectNoCorruption(page: Page) {
  const bodyText = await page.evaluate(() => document.body.innerText || "");
  expect(bodyText).not.toMatch(/\?{3,}/);
  expect(bodyText).not.toMatch(/\b(?:admin|crm|owner|team)\.[a-z]/);
}

describeBlock("Dashboard UX + permissions", () => {
  test.describe.configure({ mode: "serial" });
  let service: ReturnType<typeof createClient> | null = null;

  function getService() {
    if (!service) {
      throw new Error("Supabase service client unavailable");
    }
    return service;
  }

  let leadId = "";
  let leadName = "";
  let createdListingId: string | null = null;

  test.beforeAll(async () => {
    service = createClient(url, serviceKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    const svc = getService();

    const { data: listingRow } = await svc.from("listings").select("id").limit(1).maybeSingle();
    let listingId = listingRow?.id ?? "";

    if (!listingId) {
      const { data: ownerData } = await svc.auth.admin.getUserByEmail(ownerEmail);
      const ownerId = ownerData?.user?.id ?? "";
      if (!ownerId) {
        throw new Error("Missing owner user for e2e listing creation");
      }
      const { data: created, error } = await svc
        .from("listings")
        .insert({
          owner_user_id: ownerId,
          title: `E2E Listing ${Date.now()}`,
          type: "apartment",
          purpose: "sale",
          price: 1,
          currency: "EGP",
          city: "Test City",
          area: "Test Area",
          address: "Test Address",
          beds: 1,
          baths: 1,
          size_m2: 1,
          description: "E2E listing",
          amenities: [],
          status: "draft",
        })
        .select("id")
        .maybeSingle();
      if (error || !created?.id) {
        throw error ?? new Error("Failed to create listing");
      }
      listingId = created.id;
      createdListingId = created.id;
    }

    leadId = randomUUID();
    leadName = `E2E Lead ${Date.now()}`;
    const { error: leadError } = await svc.from("leads").insert({
      id: leadId,
      listing_id: listingId,
      name: leadName,
      phone: "01000000000",
      status: "new",
      lead_source: "web",
      source: "web",
    });
    if (leadError) {
      throw leadError;
    }
  });

  test.afterAll(async () => {
    if (!service) return;
    if (leadId) {
      await service.from("leads").delete().eq("id", leadId);
    }
    if (createdListingId) {
      await service.from("listings").delete().eq("id", createdListingId);
    }
  });

  test("admin dashboard renders clean + partner link uses search", async ({ page }) => {
    await signIn(page, adminEmail, adminPassword);

    await page.goto("/admin");
    await expectNoCorruption(page);

    await page.goto("/admin/partners-supply");
    await expectNoCorruption(page);
    await expect(page.locator('input[name="user_id_search"]')).toBeVisible();
    await expect(
      page.locator('input[name="user_id"]:not([type="hidden"])')
    ).toHaveCount(0);
  });

  test("admin can archive but cannot delete leads", async ({ page }) => {
    await signIn(page, adminEmail, adminPassword);
    await page.goto("/admin/crm/requests");

    const card = page.locator("[data-lead-card]").filter({ hasText: leadName });
    await expect(card).toBeVisible();

    await expect(card.getByRole("button", { name: /Delete|حذف/i })).toHaveCount(0);

    const archiveButton = card.getByRole("button", { name: /Archive|أرشفة/i });
    await expect(archiveButton).toBeVisible();
    await archiveButton.click();
    const svc = getService();
    await expect.poll(async () => {
      const { data: updated } = await svc
        .from("leads")
        .select("status")
        .eq("id", leadId)
        .maybeSingle();
      return updated?.status ?? "";
    }).toBe("archived");
  });

  test("owner can delete leads", async ({ page }) => {
    await signIn(page, ownerEmail, ownerPassword);
    await unlockOwner(page);
    await page.goto("/owner/crm/requests");

    const card = page.locator("[data-lead-card]").filter({ hasText: leadName });
    await expect(card).toBeVisible();

    await card.getByRole("button", { name: /Delete|حذف/i }).click();
    await page.getByLabel(/تأكيد|Confirmation/i).fill("DELETE");
    await page.getByRole("button", { name: /Confirm|تأكيد/i }).click();
    const svc = getService();
    await expect.poll(async () => {
      const { data: remaining } = await svc
        .from("leads")
        .select("id")
        .eq("id", leadId)
        .maybeSingle();
      return remaining ?? null;
    }).toBeNull();
  });

  test("no horizontal overflow on admin pages (390/320)", async ({ page }) => {
    await signIn(page, adminEmail, adminPassword);

    for (const width of [390, 320]) {
      await page.setViewportSize({ width, height: 900 });
      await page.goto("/admin/crm/requests");
      const adminOverflow = await page.evaluate(
        () => document.documentElement.scrollWidth > document.documentElement.clientWidth + 1
      );
      expect(adminOverflow).toBeFalsy();
    }
  });

  test("no horizontal overflow on owner pages (390/320)", async ({ page }) => {
    await signIn(page, ownerEmail, ownerPassword);
    await unlockOwner(page);

    for (const width of [390, 320]) {
      await page.setViewportSize({ width, height: 900 });
      await page.goto("/owner");
      const ownerOverflow = await page.evaluate(
        () => document.documentElement.scrollWidth > document.documentElement.clientWidth + 1
      );
      expect(ownerOverflow).toBeFalsy();
    }
  });
});
