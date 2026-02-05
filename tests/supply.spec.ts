import { test, expect } from "@playwright/test";
import { createClient } from "@supabase/supabase-js";

test.use({ locale: "ar-EG" });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
const canCheckTables = Boolean(supabaseUrl && anonKey);
let supplyTablesReady = true;

test.beforeAll(async () => {
  if (!canCheckTables) {
    supplyTablesReady = false;
    return;
  }

  const supabase = createClient(supabaseUrl, anonKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
  const { error } = await supabase.from("supply_developer_requests").select("id").limit(1);
  if (error && /does not exist|undefined_table/i.test(error.message)) {
    supplyTablesReady = false;
  }
});

test("supply nav link routes to /supply", async ({ page }) => {
  await page.goto("/");
  const supplyLink = page.locator("a", { hasText: /توريد وحدات|Supply units/i }).first();
  await expect(supplyLink).toHaveAttribute("href", "/supply");
});

test("supply page shows developer and owner options", async ({ page }) => {
  await page.goto("/supply");
  await expect(page.getByText(/أنا مطور عقاري|I'?m a developer/i)).toBeVisible();
  await expect(page.getByText(/أنا مالك\/وسيط|I'?m an owner/i)).toBeVisible();
});

test("developer supply form submits", async ({ page }) => {
  test.skip(!supplyTablesReady, "Supply tables not available in this environment.");
  await page.goto("/supply/developer");

  await page.fill('input[name="company_name"]', "شركة اختبار");
  await page.fill('input[name="contact_person_name"]', "محمود علي");
  await page.fill('input[name="phone"]', "01000000000");
  await page.selectOption('select[name="contact_method"]', "call");
  await page.selectOption('select[name="preferred_time"]', "morning");
  await page.fill('textarea[name="projects_summary"]', "مشروع تجريبي لاختبار نموذج التوريد.");
  await page.selectOption('select[name="inventory_type"]', "مشروع كامل");

  await page.getByRole("button", { name: /إرسال طلب التوريد|Submit supply request/i }).click();
  await expect(page.getByText(/تم استلام طلبك|Request received/i)).toBeVisible();
});

test("owner supply form submits", async ({ page }) => {
  test.skip(!supplyTablesReady, "Supply tables not available in this environment.");
  await page.goto("/supply/owner");

  await page.selectOption('select[name="owner_type"]', "مالك");
  await page.fill('input[name="full_name"]', "سارة أحمد");
  await page.fill('input[name="phone"]', "01000000001");
  await page.selectOption('select[name="contact_method"]', "call");
  await page.selectOption('select[name="preferred_time"]', "morning");
  await page.selectOption('select[name="property_type"]', "شقة");
  await page.selectOption('select[name="purpose"]', "بيع");
  await page.fill('input[name="area"]', "المعادي");

  await page.getByRole("button", { name: /إرسال الوحدة|Submit unit/i }).click();
  await expect(page.getByText(/تم استلام طلبك|Request received/i)).toBeVisible();
});
