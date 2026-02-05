"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { createSupabaseServerClient } from "@/lib/supabaseServer";
import { safeNextPath } from "@/lib/paths";
import { isUuid, parseLeadInput, parsePublicLeadInput } from "@/lib/validators";
import { normalizeEgyptPhone } from "@/lib/phone";
import { checkRateLimit } from "@/lib/rateLimit";
import { logAudit } from "@/lib/audit";

async function upsertCustomer({
  supabase,
  name,
  phoneRaw,
  phoneE164,
  email,
  intent,
  preferredArea,
  budgetMin,
  budgetMax,
  source,
}: {
  supabase: Awaited<ReturnType<typeof createSupabaseServerClient>>;
  name: string;
  phoneRaw: string | null;
  phoneE164: string | null;
  email?: string | null;
  intent?: string | null;
  preferredArea?: string | null;
  budgetMin?: number | null;
  budgetMax?: number | null;
  source?: string | null;
}) {
  if (!phoneE164) return null;
  const { data } = await supabase
    .from("customers")
    .upsert(
      {
        full_name: name || null,
        phone_raw: phoneRaw,
        phone_e164: phoneE164,
        email: email || null,
        lead_source: source || null,
        intent: intent || null,
        preferred_areas: preferredArea ? [preferredArea] : null,
        budget_min: budgetMin ?? null,
        budget_max: budgetMax ?? null,
      },
      { onConflict: "phone_e164" }
    )
    .select("id")
    .maybeSingle();
  return data?.id ?? null;
}

export type LeadActionState = {
  ok: boolean;
  error: "rate_limit" | "invalid" | "server" | null;
  submitted: boolean;
};

export async function toggleFavoriteAction(listingId: string, nextPath: string) {
  if (!isUuid(listingId)) return;

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.auth.getUser();

  if (error || !data?.user) {
    const safeNext = safeNextPath(nextPath, "/listings");
    redirect(`/auth?next=${encodeURIComponent(safeNext)}`);
  }

  const userId = data.user.id;
  const { data: existing } = await supabase
    .from("favorites")
    .select("listing_id")
    .eq("user_id", userId)
    .eq("listing_id", listingId)
    .maybeSingle();

  if (existing) {
    await supabase.from("favorites").delete().eq("user_id", userId).eq("listing_id", listingId);
  } else {
    await supabase.from("favorites").insert({ user_id: userId, listing_id: listingId });
  }

  revalidatePath("/listings");
  revalidatePath(`/listing/${listingId}`);
}

async function handleLeadForm(formData: FormData): Promise<LeadActionState> {
  const honeypot = String(formData.get("company") ?? "").trim();
  if (honeypot) {
    return { ok: true, error: null, submitted: true };
  }

  const headerStore = await headers();
  const ip =
    headerStore.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    headerStore.get("x-real-ip") ??
    "unknown";
  const ua = headerStore.get("user-agent") ?? "unknown";
  const rate = checkRateLimit(`lead:${ip}:${ua}`, 10, 60_000);
  if (!rate.allowed) {
    const supabase = await createSupabaseServerClient();
    const { data } = await supabase.auth.getUser();
    if (data?.user) {
      await logAudit(supabase, {
        actor_user_id: data.user.id,
        action: "lead_blocked_rate_limit",
        entity_type: "lead",
        metadata: { ip, ua, retry_after_ms: rate.retryAfterMs },
      });
    }
    return { ok: false, error: "rate_limit", submitted: true };
  }

  const payload = {
    listingId: String(formData.get("listingId") ?? ""),
    name: String(formData.get("name") ?? ""),
    phone: String(formData.get("phone") ?? ""),
    email: String(formData.get("email") ?? ""),
    message: String(formData.get("message") ?? ""),
    source: String(formData.get("source") ?? "web"),
  };

  const parsed = parseLeadInput(payload);
  if (!parsed) {
    return { ok: false, error: "invalid", submitted: true };
  }

  const supabase = await createSupabaseServerClient();
  const { data } = await supabase.auth.getUser();

  const normalized = normalizeEgyptPhone(parsed.phone);
  const customerId = await upsertCustomer({
    supabase,
    name: parsed.name,
    phoneRaw: parsed.phone ?? null,
    phoneE164: normalized,
    email: parsed.email ?? null,
    source: parsed.source || "web",
  });

  const { error: leadError } = await supabase.from("leads").insert({
    listing_id: parsed.listingId,
    user_id: data?.user?.id ?? null,
    customer_id: customerId,
    name: parsed.name,
    phone: parsed.phone || null,
    phone_normalized: normalized,
    phone_e164: normalized,
    email: parsed.email || null,
    message: parsed.message || null,
    source: parsed.source || "web",
    lead_source: parsed.source || "web",
    status: "new",
  });

  if (leadError) {
    return { ok: false, error: "server", submitted: true };
  }

  revalidatePath(`/listing/${parsed.listingId}`);
  return { ok: true, error: null, submitted: true };
}

export async function createLeadAction(formData: FormData) {
  await handleLeadForm(formData);
}

export async function createLeadActionWithState(
  prevState: LeadActionState,
  formData: FormData
): Promise<LeadActionState> {
  void prevState;
  return handleLeadForm(formData);
}

export async function createPublicRequestAction(formData: FormData) {
  const honeypot = String(formData.get("company") ?? "").trim();
  if (honeypot) {
    return;
  }

  const headerStore = await headers();
  const ip =
    headerStore.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    headerStore.get("x-real-ip") ??
    "unknown";
  const ua = headerStore.get("user-agent") ?? "unknown";
  const rate = checkRateLimit(`public-lead:${ip}:${ua}`, 10, 60_000);
  if (!rate.allowed) {
    const supabase = await createSupabaseServerClient();
    const { data } = await supabase.auth.getUser();
    if (data?.user) {
      await logAudit(supabase, {
        actor_user_id: data.user.id,
        action: "public_lead_blocked_rate_limit",
        entity_type: "lead",
        metadata: { ip, ua, retry_after_ms: rate.retryAfterMs },
      });
    }
    return;
  }

  const payload = {
    name: String(formData.get("name") ?? ""),
    phone: String(formData.get("phone") ?? ""),
    email: String(formData.get("email") ?? ""),
    intent: String(formData.get("intent") ?? ""),
    preferred_area: String(formData.get("preferred_area") ?? ""),
    budget_min: String(formData.get("budget_min") ?? ""),
    budget_max: String(formData.get("budget_max") ?? ""),
    preferred_contact_time: String(formData.get("preferred_contact_time") ?? ""),
    notes: String(formData.get("notes") ?? ""),
    source: String(formData.get("source") ?? "web"),
  };

  const parsed = parsePublicLeadInput(payload);
  if (!parsed) return;

  const supabase = await createSupabaseServerClient();
  const { data } = await supabase.auth.getUser();

  const normalized = normalizeEgyptPhone(parsed.phone);
  const customerId = await upsertCustomer({
    supabase,
    name: parsed.name,
    phoneRaw: parsed.phone,
    phoneE164: normalized,
    email: parsed.email ?? null,
    intent: parsed.intent,
    preferredArea: parsed.preferred_area,
    budgetMin: parsed.budget_min,
    budgetMax: parsed.budget_max,
    source: parsed.source || "web",
  });

  await supabase.from("leads").insert({
    listing_id: null,
    user_id: data?.user?.id ?? null,
    customer_id: customerId,
    name: parsed.name,
    phone: parsed.phone,
    phone_normalized: normalized,
    phone_e164: normalized,
    email: parsed.email ?? null,
    intent: parsed.intent,
    preferred_area: parsed.preferred_area,
    budget_min: parsed.budget_min,
    budget_max: parsed.budget_max,
    preferred_contact_time: parsed.preferred_contact_time,
    notes: parsed.notes,
    source: parsed.source || "web",
    lead_source: parsed.source || "web",
    status: "new",
  });

  revalidatePath("/");
}
