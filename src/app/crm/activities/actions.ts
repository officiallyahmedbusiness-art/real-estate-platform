"use server";

import { revalidatePath } from "next/cache";
import { createSupabaseServerClient } from "@/lib/supabaseServer";
import { requireRole } from "@/lib/auth";
import { isUuid } from "@/lib/validators";
import { logActivity } from "@/lib/activity";

function clean(value: FormDataEntryValue | null) {
  return typeof value === "string" ? value.trim() : "";
}

const ACTIVITY_TYPES = new Set([
  "call_attempted",
  "call_answered",
  "meeting",
  "note",
  "follow_up",
  "whatsapp",
  "email",
]);

async function requireCrmAccess(nextPath: string) {
  const { user } = await requireRole(["owner", "admin", "ops", "staff", "agent"], nextPath);
  return { user };
}

export async function createActivityAction(formData: FormData) {
  const { user } = await requireCrmAccess("/crm/activities");
  const supabase = await createSupabaseServerClient();

  const leadIdRaw = clean(formData.get("lead_id"));
  const customerIdRaw = clean(formData.get("customer_id"));
  const activityType = clean(formData.get("activity_type"));
  const outcome = clean(formData.get("outcome")) || null;
  const notes = clean(formData.get("notes")) || null;
  const occurredAt = clean(formData.get("occurred_at"));

  const leadId = leadIdRaw && isUuid(leadIdRaw) ? leadIdRaw : null;
  const customerId = customerIdRaw && isUuid(customerIdRaw) ? customerIdRaw : null;
  if (!leadId && !customerId) return;
  if (!ACTIVITY_TYPES.has(activityType)) return;

  const { data: inserted } = await supabase
    .from("lead_activities")
    .insert({
      lead_id: leadId,
      customer_id: customerId,
      activity_type: activityType,
      outcome,
      notes,
      occurred_at: occurredAt || new Date().toISOString(),
      created_by: user.id,
    })
    .select("id")
    .maybeSingle();

  if (inserted?.id) {
    await logActivity(supabase, {
      actor_user_id: user.id,
      action: "lead_activity_created",
      entity: "lead_activity",
      entity_id: inserted.id,
      meta: { lead_id: leadId, customer_id: customerId, activity_type: activityType },
    });
  }

  revalidatePath("/crm/activities");
}
