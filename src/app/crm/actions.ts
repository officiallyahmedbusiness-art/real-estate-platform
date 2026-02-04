"use server";

import { createSupabaseServerClient } from "@/lib/supabaseServer";
import { requireRole } from "@/lib/auth";
import { isUuid, parseLeadStatus } from "@/lib/validators";
import { logAudit } from "@/lib/audit";

function clean(value: FormDataEntryValue | null) {
  return typeof value === "string" ? value.trim() : "";
}

const LOSS_REASON_SET = new Set(["budget", "location", "payment", "timing", "other"]);

async function requireCrmAccess(nextPath: string) {
  const { user, role } = await requireRole(["owner", "admin", "ops", "staff", "agent"], nextPath);
  return { user, role };
}

export async function updateLeadStatusAction(formData: FormData) {
  const { user, role } = await requireCrmAccess("/crm");
  if (role !== "owner") return;
  const supabase = await createSupabaseServerClient();

  const leadId = clean(formData.get("lead_id"));
  const status = parseLeadStatus(formData.get("status"));
  if (!isUuid(leadId) || !status) return;

  const updates: Record<string, unknown> = { status };
  const lostReason = clean(formData.get("lost_reason"));
  const lostReasonNote = clean(formData.get("lost_reason_note"));

  if (status === "lost") {
    if (!LOSS_REASON_SET.has(lostReason)) return;
    if (lostReason === "other" && lostReasonNote.length < 2) return;
    updates.lost_reason = lostReason;
    updates.lost_reason_note = lostReasonNote || null;
  } else {
    updates.lost_reason = null;
    updates.lost_reason_note = null;
  }

  await supabase.from("leads").update(updates).eq("id", leadId);
  await supabase.from("activity_log").insert({
    actor_user_id: user.id,
    action: "lead_status_updated",
    entity: "lead",
    entity_id: leadId,
    meta: { status, lost_reason: updates.lost_reason ?? null },
  });
}

export async function assignLeadAction(formData: FormData) {
  const { user, role } = await requireCrmAccess("/crm");
  if (role !== "owner") return;
  const supabase = await createSupabaseServerClient();

  const leadId = clean(formData.get("lead_id"));
  const assignedRaw = clean(formData.get("assigned_to"));
  const assignedTo = assignedRaw && isUuid(assignedRaw) ? assignedRaw : null;
  if (!isUuid(leadId)) return;

  await supabase.from("leads").update({ assigned_to: assignedTo }).eq("id", leadId);
  if (assignedTo) {
    await supabase.from("lead_assignments").upsert(
      {
        lead_id: leadId,
        assigned_to: assignedTo,
        assigned_by: user.id,
      },
      { onConflict: "lead_id" }
    );
  } else {
    await supabase.from("lead_assignments").delete().eq("lead_id", leadId);
  }

  await supabase.from("activity_log").insert({
    actor_user_id: user.id,
    action: "lead_assigned",
    entity: "lead",
    entity_id: leadId,
    meta: { assigned_to: assignedTo },
  });
  await logAudit(supabase, {
    actor_user_id: user.id,
    action: "lead_assigned",
    entity_type: "lead",
    entity_id: leadId,
    metadata: { assigned_to: assignedTo },
  });
}

export async function addLeadNoteAction(formData: FormData) {
  const { user, role } = await requireCrmAccess("/crm");
  if (role !== "owner") return;
  const supabase = await createSupabaseServerClient();

  const leadId = clean(formData.get("lead_id"));
  const note = clean(formData.get("note"));
  if (!isUuid(leadId) || !note) return;

  await supabase.from("lead_notes").insert({
    lead_id: leadId,
    author_user_id: user.id,
    note,
  });
  await supabase.from("activity_log").insert({
    actor_user_id: user.id,
    action: "lead_note_added",
    entity: "lead",
    entity_id: leadId,
  });
}

export async function updateLeadNextAction(formData: FormData) {
  const { user, role } = await requireCrmAccess("/crm");
  if (role !== "owner") return;
  const supabase = await createSupabaseServerClient();

  const leadId = clean(formData.get("lead_id"));
  const nextAt = clean(formData.get("next_action_at"));
  const nextNote = clean(formData.get("next_action_note"));
  if (!isUuid(leadId)) return;

  await supabase
    .from("leads")
    .update({ next_action_at: nextAt || null, next_action_note: nextNote || null })
    .eq("id", leadId);
  await supabase.from("activity_log").insert({
    actor_user_id: user.id,
    action: "lead_next_action",
    entity: "lead",
    entity_id: leadId,
  });
}

export async function updateLeadSpendAction(formData: FormData) {
  const { user, role } = await requireCrmAccess("/crm");
  if (role !== "admin" && role !== "ops" && role !== "owner") return;
  const supabase = await createSupabaseServerClient();

  const channel = clean(formData.get("channel"));
  const month = clean(formData.get("spend_month"));
  const amountRaw = clean(formData.get("amount"));
  const amount = amountRaw ? Number(amountRaw) : NaN;
  if (!channel || !month || !Number.isFinite(amount)) return;

  await supabase.from("lead_spend").upsert(
    {
      channel,
      spend_month: month,
      amount,
      created_by: user.id,
    },
    { onConflict: "channel,spend_month" }
  );
}
