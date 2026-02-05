"use server";

import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { createSupabaseServerClient } from "@/lib/supabaseServer";
import { requireRole } from "@/lib/auth";
import { isUuid } from "@/lib/validators";
import { logAudit } from "@/lib/audit";

function clean(value: FormDataEntryValue | null) {
  return typeof value === "string" ? value.trim() : "";
}

function toNumber(value: string) {
  if (!value) return null;
  const num = Number(value);
  return Number.isFinite(num) ? num : null;
}

export async function updateCustomerAction(formData: FormData) {
  const nextPath = clean(formData.get("next_path")) || "/crm/customers";
  const { user, role } = await requireRole(["owner", "admin"], nextPath);
  const isOwner = role === "owner";

  const supabase = await createSupabaseServerClient();
  const customerId = clean(formData.get("customer_id"));
  if (!isUuid(customerId)) return;

  const { data: existing } = await supabase
    .from("customers")
    .select("full_name, phone_raw, phone_e164, email")
    .eq("id", customerId)
    .maybeSingle();
  if (!existing) return;

  const full_name = clean(formData.get("full_name")) || null;
  const phone_raw = clean(formData.get("phone_raw")) || null;
  const phone_e164 = clean(formData.get("phone_e164")) || null;
  const email = clean(formData.get("email")) || null;
  const intent = clean(formData.get("intent")) || null;
  const preferredAreasRaw = clean(formData.get("preferred_areas"));
  const preferred_areas = preferredAreasRaw
    ? preferredAreasRaw
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean)
    : null;
  const budget_min = toNumber(clean(formData.get("budget_min")));
  const budget_max = toNumber(clean(formData.get("budget_max")));
  const lead_source = clean(formData.get("lead_source")) || null;

  const piiChanges: Record<string, string | null> = {};
  if ((existing.full_name ?? "") !== (full_name ?? "")) piiChanges.full_name = full_name;
  if ((existing.phone_raw ?? "") !== (phone_raw ?? "")) piiChanges.phone_raw = phone_raw;
  if ((existing.phone_e164 ?? "") !== (phone_e164 ?? "")) piiChanges.phone_e164 = phone_e164;
  if ((existing.email ?? "") !== (email ?? "")) piiChanges.email = email;

  const nonPiiUpdates = {
    intent,
    preferred_areas,
    budget_min,
    budget_max,
    lead_source,
  };

  if (isOwner) {
    await supabase
      .from("customers")
      .update({
        full_name,
        phone_raw,
        phone_e164,
        email,
        intent,
        preferred_areas,
        budget_min,
        budget_max,
        lead_source,
      })
      .eq("id", customerId);
  } else {
    await supabase.from("customers").update(nonPiiUpdates).eq("id", customerId);
    if (Object.keys(piiChanges).length > 0) {
      await supabase.from("pii_change_requests").insert({
        table_name: "customers",
        row_id: customerId,
        requested_by: user.id,
        action: "update_pii",
        payload: piiChanges,
      });
    }
  }

  const hdrs = await headers();
  if (isOwner) {
    await logAudit(supabase, {
      actor_user_id: user.id,
      action: "customer_updated",
      entity_type: "customer",
      entity_id: customerId,
      metadata: {
        intent,
        lead_source,
      },
      ip: hdrs.get("x-forwarded-for"),
      user_agent: hdrs.get("user-agent"),
    });
  } else {
    await logAudit(supabase, {
      actor_user_id: user.id,
      action: "customer_updated_non_pii",
      entity_type: "customer",
      entity_id: customerId,
      metadata: {
        intent,
        lead_source,
        requested_pii: Object.keys(piiChanges),
      },
      ip: hdrs.get("x-forwarded-for"),
      user_agent: hdrs.get("user-agent"),
    });
  }

  revalidatePath(`/crm/customers/${customerId}`);
  revalidatePath("/crm/customers");
}
