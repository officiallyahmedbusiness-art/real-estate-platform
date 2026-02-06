import { test, expect } from "@playwright/test";
import { createClient } from "@supabase/supabase-js";

const hasEnv =
  Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY) &&
  Boolean(process.env.E2E_OWNER_EMAIL) &&
  Boolean(process.env.E2E_OWNER_PASSWORD) &&
  Boolean(process.env.OWNER_SECRET) &&
  Boolean(process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL) &&
  Boolean(process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL);

const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

const describeBlock = hasEnv ? test.describe : test.describe.skip;

test("team ping does not return 500", async ({ request }) => {
  const res = await request.post("/api/team/ping", { data: {} });
  expect([401, 403]).toContain(res.status());
});

describeBlock("Owner presence dashboard", () => {
  test("owner key rejects invalid token", async ({ page }) => {
    await page.goto("/owner");
    await page.getByLabel(/مفتاح|Owner key/i).fill("invalid-key");
    await page.getByRole("button", { name: /فتح اللوحة|Unlock/i }).click();
    await expect(page).toHaveURL(/error=1/);
  });

  test("owner key gate unlocks and shows presence", async ({ page }) => {
    await page.goto("/team/login");

    await page.getByLabel(/Email|البريد/i).fill(process.env.E2E_OWNER_EMAIL as string);
    await page.getByLabel(/Password|كلمة المرور/i).fill(process.env.E2E_OWNER_PASSWORD as string);
    await page.getByRole("button", { name: /تسجيل الدخول|Sign in/i }).click();

    await page.waitForURL(/\/team/);
    await page.waitForTimeout(2000);

    await page.goto("/owner");
    await page.getByLabel(/مفتاح|Owner key/i).fill(process.env.OWNER_SECRET as string);
    await page.getByRole("button", { name: /فتح اللوحة|Unlock/i }).click();

    await page.waitForURL(/\/owner/);
    await expect(
      page.getByRole("heading", { name: /لوحة المالك|Owner dashboard/i })
    ).toBeVisible();

    const service = createClient(url, serviceKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    const { data: ownerData } = await service.auth.admin.getUserByEmail(
      process.env.E2E_OWNER_EMAIL as string
    );
    const ownerId = ownerData?.user?.id;
    expect(ownerId).toBeTruthy();

    if (ownerId) {
      const { data: sessions } = await service
        .from("team_sessions")
        .select("id, last_seen_at")
        .eq("user_id", ownerId)
        .order("last_seen_at", { ascending: false })
        .limit(1);
      expect((sessions ?? []).length).toBeGreaterThan(0);
    }

    await expect(page.getByText(/متصل|Online|Idle|خامل|غير متصل/i)).toBeVisible();
  });
});
