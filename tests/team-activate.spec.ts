import { test, expect } from "@playwright/test";

const hasEnv =
  Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY) &&
  Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL);

const describeBlock = hasEnv ? test.describe : test.describe.skip;

test.use({ locale: "ar-EG" });

test("team activation page renders", async ({ page }) => {
  await page.goto("/team/activate");
  await expect(page.getByRole("heading", { name: /تفعيل|Activate/i })).toBeVisible();
  await expect(page.getByLabel(/البريد|Email/i)).toBeVisible();
  await expect(page.getByLabel(/رقم الهاتف|Phone/i)).toBeVisible();
});

describeBlock("team activation precheck", () => {
  test("precheck denies non-invited email", async ({ request }) => {
    const res = await request.post("/api/team/precheck", {
      data: {
        email: `not-invited-${Date.now()}@example.com`,
        phone: "01000000000",
      },
    });
    const payload = await res.json();
    expect(payload.ok).toBeFalsy();
    expect(payload.error).toBe("not_invited");
  });

  test("precheck denies wrong phone", async ({ request }) => {
    const email =
      process.env.E2E_ADMIN_EMAIL || process.env.E2E_OWNER_EMAIL || "owner@example.com";
    const res = await request.post("/api/team/precheck", {
      data: {
        email,
        phone: "00000000000",
      },
    });
    const payload = await res.json();
    expect(payload.ok).toBeFalsy();
    expect(["mismatch", "not_invited"]).toContain(payload.error);
  });
});

test("activation flow happy path (mocked)", async ({ page }) => {
  await page.route("**/api/team/precheck", (route) =>
    route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ ok: true }),
    })
  );
  await page.route("**/auth/v1/otp**", (route) =>
    route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({}),
    })
  );
  await page.route("**/auth/v1/verify**", (route) =>
    route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        access_token: "test",
        refresh_token: "test",
        token_type: "bearer",
        expires_in: 3600,
        user: { id: "test", email: "test@example.com" },
      }),
    })
  );
  await page.route("**/api/team/activate/complete", (route) =>
    route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ ok: true }),
    })
  );

  await page.goto("/team/activate");

  await page.getByRole("textbox", { name: /البريد|Email/i }).fill("test@example.com");
  await page.getByRole("textbox", { name: /رقم الهاتف|Phone/i }).fill("01000000000");
  const sendButton = page.getByRole("button", { name: /إرسال|Send/i });
  await expect(sendButton).toBeEnabled();
  await sendButton.click();

  const codeInput = page.getByRole("textbox", { name: /كود|code/i });
  await expect(codeInput).toBeVisible();
  await codeInput.fill("123456");
  await page.getByRole("button", { name: /تأكيد|Verify/i }).click();

  await page.getByRole("textbox", { name: /كلمة المرور|Password/i }).first().fill("password123");
  await page.getByRole("textbox", { name: /تأكيد|Confirm/i }).fill("password123");
  await page.getByRole("button", { name: /إنشاء|Create/i }).click();

  await expect(page).toHaveURL(/\/team/);
});
