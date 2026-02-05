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

describeBlock("RBAC tests require env credentials", () => {
  test("admin cannot update PII; owner can", async () => {
    const service = createClient(url, serviceKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    const admin = await signIn(
      process.env.E2E_ADMIN_EMAIL as string,
      process.env.E2E_ADMIN_PASSWORD as string
    );
    const owner = await signIn(
      process.env.E2E_OWNER_EMAIL as string,
      process.env.E2E_OWNER_PASSWORD as string
    );

    const { data: customer, error: customerError } = await service
      .from("customers")
      .insert({
        full_name: "Test Customer",
        phone_raw: "+201000000001",
        phone_e164: "+201000000001",
        email: "test.customer@example.com",
        intent: "buy",
      })
      .select("id")
      .maybeSingle();

    expect(customerError).toBeNull();
    expect(customer?.id).toBeTruthy();

    const { data: lead, error: leadError } = await service
      .from("leads")
      .insert({
        customer_id: customer?.id ?? null,
        name: "Lead One",
        phone: "+201000000002",
        phone_e164: "+201000000002",
        phone_normalized: "+201000000002",
        email: "lead@example.com",
        message: "hello",
        status: "new",
        lead_source: "web",
      })
      .select("id")
      .maybeSingle();

    expect(leadError).toBeNull();
    expect(lead?.id).toBeTruthy();

    const { error: adminLeadPiiError } = await admin
      .from("leads")
      .update({ phone: "+201000000099" })
      .eq("id", lead?.id ?? "");
    expect(adminLeadPiiError).toBeTruthy();

    const { error: adminLeadStatusError } = await admin
      .from("leads")
      .update({ status: "contacted" })
      .eq("id", lead?.id ?? "");
    expect(adminLeadStatusError).toBeNull();

    const { error: adminCustomerPiiError } = await admin
      .from("customers")
      .update({ full_name: "Changed" })
      .eq("id", customer?.id ?? "");
    expect(adminCustomerPiiError).toBeTruthy();

    const { error: ownerLeadPiiError } = await owner
      .from("leads")
      .update({ phone: "+201000000088" })
      .eq("id", lead?.id ?? "");
    expect(ownerLeadPiiError).toBeNull();

    const { error: adminDeleteError } = await admin
      .from("leads")
      .delete()
      .eq("id", lead?.id ?? "");
    expect(adminDeleteError).toBeTruthy();

    await service.from("leads").delete().eq("id", lead?.id ?? "");
    await service.from("customers").delete().eq("id", customer?.id ?? "");
  });
});

