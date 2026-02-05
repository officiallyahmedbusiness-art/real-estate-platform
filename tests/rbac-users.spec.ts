import { test, expect } from "@playwright/test";
import { createClient } from "@supabase/supabase-js";

const hasEnv =
  Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY) &&
  Boolean(process.env.E2E_OWNER_EMAIL) &&
  Boolean(process.env.E2E_OWNER_PASSWORD) &&
  Boolean(process.env.E2E_ADMIN_EMAIL) &&
  Boolean(process.env.E2E_ADMIN_PASSWORD) &&
  Boolean(process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL) &&
  Boolean(process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const anonKey =
  process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

async function signIn(email: string, password: string) {
  const client = createClient(url, anonKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
  const { data, error } = await client.auth.signInWithPassword({ email, password });
  if (error || !data?.session) throw error ?? new Error("Missing session");
  return client;
}

const describeBlock = hasEnv ? test.describe : test.describe.skip;

describeBlock("RBAC owner immutability", () => {
  test("admin cannot touch owner; admin can update non-owner roles", async () => {
    const service = createClient(url, serviceKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    const admin = await signIn(
      process.env.E2E_ADMIN_EMAIL as string,
      process.env.E2E_ADMIN_PASSWORD as string
    );

    const ownerEmail = process.env.E2E_OWNER_EMAIL as string;
    const { data: ownerProfile } = await service
      .from("profiles")
      .select("id, role")
      .eq("email", ownerEmail)
      .maybeSingle();

    expect(ownerProfile?.role).toBe("owner");

    const { error: adminOwnerUpdate } = await admin
      .from("profiles")
      .update({ phone: "01099999999" })
      .eq("id", ownerProfile?.id ?? "");
    expect(adminOwnerUpdate).toBeTruthy();

    const { error: adminOwnerDelete } = await admin
      .from("profiles")
      .delete()
      .eq("id", ownerProfile?.id ?? "");
    expect(adminOwnerDelete).toBeTruthy();

    const email = `test.user.${Date.now()}@example.com`;
    const password = `Test${Date.now()}!`;
    let userId = "";

    try {
      const { data: created, error: createError } = await service.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
      });
      expect(createError).toBeNull();
      userId = created?.user?.id ?? "";
      expect(userId).toBeTruthy();

      await service.from("profiles").upsert({
        id: userId,
        email,
        role: "staff",
      });

      const { error: adminPromote } = await admin
        .from("profiles")
        .update({ role: "admin" })
        .eq("id", userId);
      expect(adminPromote).toBeNull();

      const { error: adminMakeOwner } = await admin
        .from("profiles")
        .update({ role: "owner" })
        .eq("id", userId);
      expect(adminMakeOwner).toBeTruthy();
    } finally {
      if (userId) {
        await service.auth.admin.deleteUser(userId);
        await service.from("profiles").delete().eq("id", userId);
      }
    }
  });
});
