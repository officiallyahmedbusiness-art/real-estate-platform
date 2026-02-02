"use server";

import { createSupabaseServerClient } from "@/lib/supabaseServer";
import { requireRole } from "@/lib/auth";
import { isUuid } from "@/lib/validators";

function clean(value: FormDataEntryValue | null) {
  return typeof value === "string" ? value.trim() : "";
}

async function requireVisitAccess(nextPath: string) {
  const { user, role } = await requireRole(["owner", "admin", "ops", "staff", "agent"], nextPath);
  return { user, role };
}

export async function createVisitAction(formData: FormData) {
  const { user } = await requireVisitAccess("/crm/visits");
  const supabase = await createSupabaseServerClient();

  const listingId = clean(formData.get("listing_id"));
  const leadId = clean(formData.get("lead_id"));
  const assignedTo = clean(formData.get("assigned_to"));
  const scheduledAt = clean(formData.get("scheduled_at"));
  const notes = clean(formData.get("notes")) || null;

  if (!scheduledAt) return;

  await supabase.from("field_visits").insert({
    listing_id: isUuid(listingId) ? listingId : null,
    lead_id: isUuid(leadId) ? leadId : null,
    assigned_to: isUuid(assignedTo) ? assignedTo : null,
    created_by: user.id,
    scheduled_at: scheduledAt,
    notes,
  });
}

export async function updateVisitStatusAction(formData: FormData) {
  const { user } = await requireVisitAccess("/crm/visits");
  const supabase = await createSupabaseServerClient();

  const visitId = clean(formData.get("visit_id"));
  const status = clean(formData.get("status"));
  if (!isUuid(visitId) || !status) return;

  await supabase.from("field_visits").update({ status }).eq("id", visitId);
  await supabase.from("activity_log").insert({
    actor_user_id: user.id,
    action: "visit_status_updated",
    entity: "field_visit",
    entity_id: visitId,
    meta: { status },
  });
}

export async function updateVisitNotesAction(formData: FormData) {
  const { user } = await requireVisitAccess("/crm/visits");
  const supabase = await createSupabaseServerClient();

  const visitId = clean(formData.get("visit_id"));
  const notes = clean(formData.get("notes"));
  const outcome = clean(formData.get("outcome"));
  const nextFollowup = clean(formData.get("next_followup_at"));
  if (!isUuid(visitId)) return;

  await supabase.from("field_visits").update({
    notes: notes || null,
    outcome: outcome || null,
    next_followup_at: nextFollowup || null,
  }).eq("id", visitId);

  await supabase.from("activity_log").insert({
    actor_user_id: user.id,
    action: "visit_notes_updated",
    entity: "field_visit",
    entity_id: visitId,
  });
}
