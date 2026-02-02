"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabaseServer";
import {
  isUuid,
  parseListingInput,
  parseDeveloperInput,
  parseLeadStatus,
  parseMemberInput,
  parseProjectInput,
  parseRole,
  parseSubmissionStatus,
} from "@/lib/validators";
import { safeNextPath } from "@/lib/paths";
import { logActivity } from "@/lib/activity";
import { logAudit } from "@/lib/audit";

async function requireAdmin(nextPath: string) {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.auth.getUser();

  if (error || !data?.user) {
    const safeNext = safeNextPath(nextPath, "/admin");
    redirect(`/auth?next=${encodeURIComponent(safeNext)}`);
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", data.user.id)
    .maybeSingle();

  if (profile?.role !== "admin" && profile?.role !== "owner") {
    redirect("/dashboard?unauthorized=1");
  }

  return { supabase, userId: data.user.id };
}

async function requireOwner(nextPath: string) {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.auth.getUser();

  if (error || !data?.user) {
    const safeNext = safeNextPath(nextPath, "/admin");
    redirect(`/auth?next=${encodeURIComponent(safeNext)}`);
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", data.user.id)
    .maybeSingle();

  if (profile?.role !== "owner") {
    redirect("/dashboard?unauthorized=1");
  }

  return { supabase, userId: data.user.id };
}

async function requireStaff(nextPath: string) {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.auth.getUser();

  if (error || !data?.user) {
    const safeNext = safeNextPath(nextPath, "/admin");
    redirect(`/auth?next=${encodeURIComponent(safeNext)}`);
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", data.user.id)
    .maybeSingle();

  const role = profile?.role ?? "staff";
  if (role !== "admin" && role !== "ops" && role !== "owner") {
    redirect("/dashboard?unauthorized=1");
  }

  return { supabase, userId: data.user.id, role };
}

export async function updateUserRoleAction(formData: FormData) {
  const { supabase } = await requireOwner("/admin");
  const userId = String(formData.get("user_id") ?? "");
  const role = String(formData.get("role") ?? "");

  if (!isUuid(userId)) return;
  const parsedRole = parseRole(role);
  if (!parsedRole) return;
  if (parsedRole === "owner") return;

  await supabase.from("profiles").update({ role: parsedRole }).eq("id", userId);
  revalidatePath("/admin");
}

export async function createDeveloperAction(formData: FormData) {
  const { supabase } = await requireAdmin("/admin");
  const parsed = parseDeveloperInput({
    name: formData.get("name"),
  });
  if (!parsed) return;

  await supabase.from("developers").insert({ name: parsed.name });
  revalidatePath("/admin");
}

export async function addDeveloperMemberAction(formData: FormData) {
  const { supabase } = await requireAdmin("/admin");
  const parsed = parseMemberInput({
    developer_id: formData.get("developer_id"),
    user_id: formData.get("user_id"),
    role: formData.get("role"),
  });
  if (!parsed) return;

  await supabase.from("developer_members").insert({
    developer_id: parsed.developer_id,
    user_id: parsed.user_id,
    role: parsed.role || "member",
  });

  revalidatePath("/admin");
}

export async function updateListingStatusAction(formData: FormData) {
  const { supabase } = await requireAdmin("/admin");
  const { data: auth } = await supabase.auth.getUser();
  const listingId = String(formData.get("listing_id") ?? "");
  const status = String(formData.get("status") ?? "");

  if (!isUuid(listingId)) return;
  if (!["draft", "published", "archived"].includes(status)) return;

  const submission_status =
    status === "published" ? "published" : status === "archived" ? "archived" : "draft";
  await supabase
    .from("listings")
    .update({ status, submission_status })
    .eq("id", listingId);
  await logAudit(supabase, {
    actor_user_id: auth?.user?.id ?? null,
    action: status === "published" ? "listing_published" : "listing_status_updated",
    entity_type: "listing",
    entity_id: listingId,
    metadata: { status, submission_status },
  });
  revalidatePath("/admin");
  revalidatePath(`/listing/${listingId}`);
}

export async function updateLeadStatusAction(formData: FormData) {
  const { supabase, userId } = await requireStaff("/admin");
  const leadId = String(formData.get("lead_id") ?? "");
  const status = parseLeadStatus(formData.get("status"));

  if (!isUuid(leadId) || !status) return;

  await supabase.from("leads").update({ status }).eq("id", leadId);
  await supabase.from("activity_log").insert({
    actor_user_id: userId,
    action: "lead_status_updated",
    entity: "lead",
    entity_id: leadId,
    meta: { status },
  });
  await logAudit(supabase, {
    actor_user_id: userId,
    action: "lead_status_updated",
    entity_type: "lead",
    entity_id: leadId,
    metadata: { status },
  });

  revalidatePath("/admin");
}

export async function assignLeadAction(formData: FormData) {
  const { supabase, userId } = await requireStaff("/admin");
  const leadId = String(formData.get("lead_id") ?? "");
  const assignedRaw = String(formData.get("assigned_to") ?? "");
  const assignedTo = assignedRaw && isUuid(assignedRaw) ? assignedRaw : null;

  if (!isUuid(leadId)) return;

  await supabase.from("leads").update({ assigned_to: assignedTo }).eq("id", leadId);

  if (assignedTo) {
    await supabase.from("lead_assignments").upsert(
      {
        lead_id: leadId,
        assigned_to: assignedTo,
        assigned_by: userId,
      },
      { onConflict: "lead_id" }
    );
  } else {
    await supabase.from("lead_assignments").delete().eq("lead_id", leadId);
  }

  await supabase.from("activity_log").insert({
    actor_user_id: userId,
    action: "lead_assigned",
    entity: "lead",
    entity_id: leadId,
    meta: { assigned_to: assignedTo },
  });
  await logAudit(supabase, {
    actor_user_id: userId,
    action: "lead_assigned",
    entity_type: "lead",
    entity_id: leadId,
    metadata: { assigned_to: assignedTo },
  });

  revalidatePath("/admin");
}

export async function addLeadNoteAction(formData: FormData) {
  const { supabase, userId } = await requireStaff("/admin");
  const leadId = String(formData.get("lead_id") ?? "");
  const note = String(formData.get("note") ?? "").trim();

  if (!isUuid(leadId) || note.length < 3 || note.length > 500) return;

  await supabase.from("lead_notes").insert({
    lead_id: leadId,
    author_user_id: userId,
    note,
  });

  await supabase.from("activity_log").insert({
    actor_user_id: userId,
    action: "lead_note_added",
    entity: "lead",
    entity_id: leadId,
    meta: { preview: note.slice(0, 80) },
  });

  revalidatePath("/admin");
}

export async function updateListingSubmissionStatusAction(formData: FormData) {
  const { supabase, userId, role } = await requireStaff("/admin");
  const listingId = String(formData.get("listing_id") ?? "");
  const nextStatus = parseSubmissionStatus(formData.get("submission_status"));
  const note = String(formData.get("note") ?? "").trim();

  if (!isUuid(listingId) || !nextStatus) return;
  if (nextStatus === "published" && role !== "admin" && role !== "owner") return;

  const now = new Date().toISOString();
  const updates: Record<string, unknown> = {
    submission_status: nextStatus,
  };

  if (nextStatus === "submitted") updates.submitted_at = now;
  if (nextStatus === "under_review") updates.reviewed_at = now;
  if (nextStatus === "needs_changes") updates.reviewed_at = now;
  if (nextStatus === "approved") updates.approved_at = now;
  if (nextStatus === "published") {
    updates.published_at = now;
    updates.status = "published";
  }
  if (nextStatus === "archived") {
    updates.archived_at = now;
    updates.status = "archived";
  }
  if (nextStatus !== "published" && nextStatus !== "archived") {
    updates.status = "draft";
  }

  await supabase.from("listings").update(updates).eq("id", listingId);

  if (note) {
    await supabase.from("submission_notes").insert({
      entity_type: "listing",
      entity_id: listingId,
      author_user_id: userId,
      author_role: role,
      visibility: "developer",
      note,
    });
  }

  await logActivity(supabase, {
    actor_user_id: userId,
    action: "listing_submission_status",
    entity: "listing",
    entity_id: listingId,
    meta: { submission_status: nextStatus },
  });
  await logAudit(supabase, {
    actor_user_id: userId,
    action: "listing_submission_status",
    entity_type: "listing",
    entity_id: listingId,
    metadata: { submission_status: nextStatus },
  });

  revalidatePath("/admin");
  revalidatePath("/developer");
  revalidatePath(`/listing/${listingId}`);
}

export async function updateProjectSubmissionStatusAction(formData: FormData) {
  const { supabase, userId, role } = await requireStaff("/admin");
  const projectId = String(formData.get("project_id") ?? "");
  const nextStatus = parseSubmissionStatus(formData.get("submission_status"));
  const note = String(formData.get("note") ?? "").trim();

  if (!isUuid(projectId) || !nextStatus) return;
  if (nextStatus === "published" && role !== "admin" && role !== "owner") return;

  const now = new Date().toISOString();
  const updates: Record<string, unknown> = {
    submission_status: nextStatus,
  };

  if (nextStatus === "submitted") updates.submitted_at = now;
  if (nextStatus === "under_review") updates.reviewed_at = now;
  if (nextStatus === "needs_changes") updates.reviewed_at = now;
  if (nextStatus === "approved") updates.approved_at = now;
  if (nextStatus === "published") updates.published_at = now;
  if (nextStatus === "archived") updates.archived_at = now;

  await supabase.from("projects").update(updates).eq("id", projectId);

  if (note) {
    await supabase.from("submission_notes").insert({
      entity_type: "project",
      entity_id: projectId,
      author_user_id: userId,
      author_role: role,
      visibility: "developer",
      note,
    });
  }

  await logActivity(supabase, {
    actor_user_id: userId,
    action: "project_submission_status",
    entity: "project",
    entity_id: projectId,
    meta: { submission_status: nextStatus },
  });
  await logAudit(supabase, {
    actor_user_id: userId,
    action: "project_submission_status",
    entity_type: "project",
    entity_id: projectId,
    metadata: { submission_status: nextStatus },
  });

  revalidatePath("/admin");
  revalidatePath("/developer");
}

export async function addSubmissionNoteAction(formData: FormData) {
  const { supabase, userId, role } = await requireStaff("/admin");
  const entityType = String(formData.get("entity_type") ?? "");
  const entityId = String(formData.get("entity_id") ?? "");
  const note = String(formData.get("note") ?? "").trim();
  const visibility = String(formData.get("visibility") ?? "developer");

  if (!note || !isUuid(entityId)) return;
  if (!["listing", "project", "media"].includes(entityType)) return;
  if (!["developer", "internal"].includes(visibility)) return;

  await supabase.from("submission_notes").insert({
    entity_type: entityType,
    entity_id: entityId,
    author_user_id: userId,
    author_role: role,
    visibility,
    note,
  });

  await logActivity(supabase, {
    actor_user_id: userId,
    action: "submission_note",
    entity: entityType,
    entity_id: entityId,
    meta: { visibility },
  });

  revalidatePath("/admin");
  revalidatePath("/developer");
}

export async function updateListingReviewAction(formData: FormData) {
  const { supabase, userId } = await requireStaff("/admin");
  const listingId = String(formData.get("listing_id") ?? "");
  if (!isUuid(listingId)) return;

  const parsed = parseListingInput({
    title: formData.get("title"),
    title_ar: formData.get("title_ar"),
    title_en: formData.get("title_en"),
    type: formData.get("type"),
    purpose: formData.get("purpose"),
    price: formData.get("price"),
    currency: formData.get("currency"),
    city: formData.get("city"),
    area: formData.get("area"),
    address: formData.get("address"),
    beds: formData.get("beds"),
    baths: formData.get("baths"),
    size_m2: formData.get("size_m2"),
    description: formData.get("description"),
    description_ar: formData.get("description_ar"),
    description_en: formData.get("description_en"),
    amenities: formData.get("amenities"),
    status: formData.get("status"),
  });
  if (!parsed) return;

  const hrOwnerInput = String(formData.get("hr_owner_user_id") ?? "");
  const projectInput = String(formData.get("project_id") ?? "");

  await supabase
    .from("listings")
    .update({
      title: parsed.title,
      title_ar: parsed.title_ar,
      title_en: parsed.title_en,
      type: parsed.type,
      purpose: parsed.purpose,
      price: parsed.price,
      currency: parsed.currency,
      city: parsed.city,
      area: parsed.area,
      address: parsed.address,
      beds: parsed.beds,
      baths: parsed.baths,
      size_m2: parsed.size_m2,
      description: parsed.description,
      description_ar: parsed.description_ar,
      description_en: parsed.description_en,
      amenities: parsed.amenities,
      listing_code: String(formData.get("listing_code") ?? "").trim() || null,
      unit_code: String(formData.get("unit_code") ?? "").trim() || null,
      project_id: isUuid(projectInput) ? projectInput : null,
      hr_owner_user_id: isUuid(hrOwnerInput) ? hrOwnerInput : null,
    })
    .eq("id", listingId);

  await logActivity(supabase, {
    actor_user_id: userId,
    action: "listing_review_updated",
    entity: "listing",
    entity_id: listingId,
  });
  await logAudit(supabase, {
    actor_user_id: userId,
    action: "listing_updated",
    entity_type: "listing",
    entity_id: listingId,
  });

  revalidatePath("/admin");
  revalidatePath(`/listing/${listingId}`);
}

export async function updateProjectReviewAction(formData: FormData) {
  const { supabase, userId } = await requireStaff("/admin");
  const projectId = String(formData.get("project_id") ?? "");
  if (!isUuid(projectId)) return;

  const parsed = parseProjectInput({
    title_ar: formData.get("title_ar"),
    title_en: formData.get("title_en"),
    description_ar: formData.get("description_ar"),
    description_en: formData.get("description_en"),
    city: formData.get("city"),
    area: formData.get("area"),
    address: formData.get("address"),
  });
  if (!parsed) return;

  const hrOwnerInput = String(formData.get("hr_owner_user_id") ?? "");

  await supabase
    .from("projects")
    .update({
      title_ar: parsed.title_ar,
      title_en: parsed.title_en,
      description_ar: parsed.description_ar,
      description_en: parsed.description_en,
      city: parsed.city,
      area: parsed.area,
      address: parsed.address,
      project_code: String(formData.get("project_code") ?? "").trim() || null,
      hr_owner_user_id: isUuid(hrOwnerInput) ? hrOwnerInput : null,
    })
    .eq("id", projectId);

  await logActivity(supabase, {
    actor_user_id: userId,
    action: "project_review_updated",
    entity: "project",
    entity_id: projectId,
  });
  await logAudit(supabase, {
    actor_user_id: userId,
    action: "project_updated",
    entity_type: "project",
    entity_id: projectId,
  });

  revalidatePath("/admin");
}
