import { test, expect } from "@playwright/test";
import { createClient } from "@supabase/supabase-js";

const hasEnv = Boolean(
  process.env.SUPABASE_SERVICE_ROLE_KEY &&
  (process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL)
);

const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

const fakeStrings = ["مدينة نصر", "عباس العقاد", "10 ص", "9 م", "10 دقائق"];

const describeBlock = hasEnv ? test.describe : test.describe.skip;

test("public pages do not show fake trust strings", async ({ page }) => {
  await page.goto("/");
  const body = (await page.textContent("body")) || "";
  fakeStrings.forEach((str) => expect(body).not.toContain(str));

  await page.goto("/listings");
  const listingsBody = (await page.textContent("body")) || "";
  fakeStrings.forEach((str) => expect(listingsBody).not.toContain(str));
});

describeBlock("settings-driven company info", () => {
  test("renders company info when provided", async ({ page }) => {
    const admin = createClient(supabaseUrl, serviceKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    const keys = ["office_address", "working_hours", "response_sla"];
    const { data: existing } = await admin.from("site_settings").select("key,value").in("key", keys);
    const backup = new Map((existing ?? []).map((row) => [row.key, row.value]));

    const payload = [
      { key: "office_address", value: "عنوان تجريبي" },
      { key: "working_hours", value: "يوميًا من 10 ص إلى 6 م" },
      { key: "response_sla", value: "نرد خلال 30 دقيقة" },
    ];

    try {
      await admin.from("site_settings").upsert(payload, { onConflict: "key" });
      await page.goto("/");
      await expect(page.locator("body")).toContainText("عنوان تجريبي");
      await expect(page.locator("body")).toContainText("يوميًا من 10 ص إلى 6 م");
      await expect(page.locator("body")).toContainText("نرد خلال 30 دقيقة");
    } finally {
      for (const key of keys) {
        const value = backup.get(key) ?? null;
        if (value === null || value === undefined) {
          await admin.from("site_settings").delete().eq("key", key);
        } else {
          await admin.from("site_settings").upsert({ key, value }, { onConflict: "key" });
        }
      }
    }
  });
});
