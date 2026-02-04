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
  const { user, role } = await requireRole(["owner"], nextPath);
  if (role !== "owner") return;

  const supabase = await createSupabaseServerClient();
  const customerId = clean(formData.get("customer_id"));
  if (!isUuid(customerId)) return;

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

  const hdrs = await headers();
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

  revalidatePath(`/crm/customers/${customerId}`);
  revalidatePath("/crm/customers");
}
