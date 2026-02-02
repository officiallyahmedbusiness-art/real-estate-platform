"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabaseServer";
import { logActivity } from "@/lib/activity";
import { logAudit } from "@/lib/audit";
import { isUuid, parseLeadStatus, parseListingInput, parseProjectInput } from "@/lib/validators";
import { safeNextPath } from "@/lib/paths";

async function requireDeveloperAccess(nextPath: string) {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.auth.getUser();

  if (error || !data?.user) {
    const safeNext = safeNextPath(nextPath, "/developer");
    redirect(`/auth?next=${encodeURIComponent(safeNext)}`);
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", data.user.id)
    .maybeSingle();

  const role = profile?.role ?? "staff";
  if (role !== "developer" && role !== "admin" && role !== "owner") {
    redirect("/dashboard?unauthorized=1");
  }

  return { supabase, userId: data.user.id, role };
}

async function resolveDeveloperId(
  supabase: Awaited<ReturnType<typeof createSupabaseServerClient>>,
  userId: string,
  role: string,
  developerInput?: string
) {
  if (role === "admin" && developerInput && isUuid(developerInput)) {
    return developerInput;
  }
  const { data: membership } = await supabase
    .from("developer_members")
    .select("developer_id")
    .eq("user_id", userId)
    .maybeSingle();
  return membership?.developer_id ?? null;
}

export async function createListingAction(formData: FormData) {
  const { supabase, userId, role } = await requireDeveloperAccess("/developer");

  const parsed = parseListingInput({
    title: formData.get("title"),
    title_ar: formData.get("title_ar"),
    title_en: formData.get("title_en"),
    type: formData.get("type"),
    purpose: "new-development",
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

  const devInput = String(formData.get("developer_id") ?? "");
  const developerId = await resolveDeveloperId(supabase, userId, role, devInput);
  const projectId = String(formData.get("project_id") ?? "");
  if (!isUuid(projectId)) return;

  const { data: project } = await supabase
    .from("projects")
    .select("id, developer_id, owner_user_id")
    .eq("id", projectId)
    .maybeSingle();
  if (!project) return;
  if (role !== "admin") {
    const allowed =
      project.owner_user_id === userId ||
      (project.developer_id && project.developer_id === developerId);
    if (!allowed) return;
  }

  const status = role === "admin" ? parsed.status : "draft";
  const submission_status =
    status === "published" ? "published" : status === "archived" ? "archived" : "draft";

  const { data } = await supabase.from("listings").insert({
    developer_id: developerId,
    owner_user_id: userId,
    project_id: projectId,
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
    status,
    submission_status,
    inventory_source: "project",
  }).select("id").maybeSingle();

  await logAudit(supabase, {
    actor_user_id: userId,
    action: "listing_created",
    entity_type: "listing",
    entity_id: data?.id ?? null,
    metadata: { inventory_source: "project" },
  });

  revalidatePath("/developer");
}

export async function updateListingAction(formData: FormData) {
  const { supabase, role, userId } = await requireDeveloperAccess("/developer");
  const listingId = String(formData.get("listing_id") ?? "");
  if (!isUuid(listingId)) return;

  const { data: current } = await supabase
    .from("listings")
    .select("submission_status")
    .eq("id", listingId)
    .maybeSingle();

  if (role !== "admin" && !["draft", "needs_changes"].includes(current?.submission_status ?? "")) {
    return;
  }

  const parsed = parseListingInput({
    title: formData.get("title"),
    title_ar: formData.get("title_ar"),
    title_en: formData.get("title_en"),
    type: formData.get("type"),
    purpose: "new-development",
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

  const status =
    role === "admin" ? parsed.status : parsed.status === "archived" ? "archived" : "draft";
  const submission_status =
    status === "published" ? "published" : status === "archived" ? "archived" : current?.submission_status ?? "draft";

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
      status,
      submission_status,
    })
    .eq("id", listingId);
  await logAudit(supabase, {
    actor_user_id: userId,
    action: "listing_updated",
    entity_type: "listing",
    entity_id: listingId,
  });

  revalidatePath("/developer");
  revalidatePath(`/developer/listings/${listingId}`);
}

export async function deleteListingAction(formData: FormData) {
  const { supabase, role, userId } = await requireDeveloperAccess("/developer");
  const listingId = String(formData.get("listing_id") ?? "");
  if (!isUuid(listingId)) return;

  const { data: current } = await supabase
    .from("listings")
    .select("submission_status")
    .eq("id", listingId)
    .maybeSingle();

  if (role !== "admin" && !["draft", "needs_changes"].includes(current?.submission_status ?? "")) {
    return;
  }

  await supabase.from("listings").delete().eq("id", listingId);
  await logAudit(supabase, {
    actor_user_id: userId,
    action: "listing_deleted",
    entity_type: "listing",
    entity_id: listingId,
  });
  revalidatePath("/developer");
}

export async function deleteImageAction(formData: FormData) {
  const { supabase } = await requireDeveloperAccess("/developer");
  const listingId = String(formData.get("listing_id") ?? "");
  const path = String(formData.get("path") ?? "");
  if (!isUuid(listingId) || !path) return;

  await supabase.storage.from("property-images").remove([path]);
  await supabase.from("listing_images").delete().eq("listing_id", listingId).eq("path", path);

  revalidatePath(`/developer/listings/${listingId}`);
}

export async function updateLeadStatusAction(formData: FormData) {
  const { supabase, userId } = await requireDeveloperAccess("/developer");
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

  revalidatePath("/developer");
}

export async function addLeadNoteAction(formData: FormData) {
  const { supabase, userId } = await requireDeveloperAccess("/developer");
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

  revalidatePath("/developer");
}

export async function submitListingAction(formData: FormData) {
  const { supabase, userId } = await requireDeveloperAccess("/developer");
  const listingId = String(formData.get("listing_id") ?? "");
  if (!isUuid(listingId)) return;

  const { data: listing } = await supabase
    .from("listings")
    .select(
      "id, submission_status, title, title_ar, title_en, description, description_ar, description_en, type, purpose, price, currency, city, area, address, beds, baths, size_m2, amenities"
    )
    .eq("id", listingId)
    .maybeSingle();

  if (!listing) return;
  if (!["draft", "needs_changes"].includes(listing.submission_status ?? "")) return;

  const payload = {
    title: listing.title,
    title_ar: listing.title_ar,
    title_en: listing.title_en,
    description: listing.description,
    description_ar: listing.description_ar,
    description_en: listing.description_en,
    type: listing.type,
    purpose: listing.purpose,
    price: listing.price,
    currency: listing.currency,
    city: listing.city,
    area: listing.area,
    address: listing.address,
    beds: listing.beds,
    baths: listing.baths,
    size_m2: listing.size_m2,
    amenities: listing.amenities,
  };

  await supabase
    .from("listings")
    .update({
      submission_status: "submitted",
      submitted_at: new Date().toISOString(),
      developer_payload: payload,
      status: "draft",
    })
    .eq("id", listingId);

  await logActivity(supabase, {
    actor_user_id: userId,
    action: "listing_submitted",
    entity: "listing",
    entity_id: listingId,
    meta: { submission_status: "submitted" },
  });
  await logAudit(supabase, {
    actor_user_id: userId,
    action: "listing_submitted",
    entity_type: "listing",
    entity_id: listingId,
    metadata: { submission_status: "submitted" },
  });

  revalidatePath("/developer");
  revalidatePath("/admin");
}

export async function createProjectAction(formData: FormData) {
  const { supabase, userId, role } = await requireDeveloperAccess("/developer");
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

  const devInput = String(formData.get("developer_id") ?? "");
  const developerId = await resolveDeveloperId(supabase, userId, role, devInput);

  const { data } = await supabase.from("projects").insert({
    developer_id: developerId,
    owner_user_id: userId,
    title_ar: parsed.title_ar,
    title_en: parsed.title_en,
    description_ar: parsed.description_ar,
    description_en: parsed.description_en,
    city: parsed.city,
    area: parsed.area,
    address: parsed.address,
    submission_status: "draft",
  }).select("id").maybeSingle();

  await logActivity(supabase, {
    actor_user_id: userId,
    action: "project_created",
    entity: "project",
  });
  await logAudit(supabase, {
    actor_user_id: userId,
    action: "project_created",
    entity_type: "project",
    entity_id: data?.id ?? null,
  });

  revalidatePath("/developer");
}

export async function updateProjectAction(formData: FormData) {
  const { supabase, role, userId } = await requireDeveloperAccess("/developer");
  const projectId = String(formData.get("project_id") ?? "");
  if (!isUuid(projectId)) return;

  const { data: current } = await supabase
    .from("projects")
    .select("submission_status")
    .eq("id", projectId)
    .maybeSingle();

  if (role !== "admin" && !["draft", "needs_changes"].includes(current?.submission_status ?? "")) {
    return;
  }

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
    })
    .eq("id", projectId);
  await logAudit(supabase, {
    actor_user_id: userId,
    action: "project_updated",
    entity_type: "project",
    entity_id: projectId,
  });

  revalidatePath("/developer");
  revalidatePath(`/developer/projects/${projectId}`);
}

export async function submitProjectAction(formData: FormData) {
  const { supabase, userId } = await requireDeveloperAccess("/developer");
  const projectId = String(formData.get("project_id") ?? "");
  if (!isUuid(projectId)) return;

  const { data: project } = await supabase
    .from("projects")
    .select("id, submission_status, title_ar, title_en, description_ar, description_en, city, area, address")
    .eq("id", projectId)
    .maybeSingle();

  if (!project) return;
  if (!["draft", "needs_changes"].includes(project.submission_status ?? "")) return;

  const payload = {
    title_ar: project.title_ar,
    title_en: project.title_en,
    description_ar: project.description_ar,
    description_en: project.description_en,
    city: project.city,
    area: project.area,
    address: project.address,
  };

  await supabase
    .from("projects")
    .update({
      submission_status: "submitted",
      submitted_at: new Date().toISOString(),
      developer_payload: payload,
    })
    .eq("id", projectId);

  await logActivity(supabase, {
    actor_user_id: userId,
    action: "project_submitted",
    entity: "project",
    entity_id: projectId,
    meta: { submission_status: "submitted" },
  });
  await logAudit(supabase, {
    actor_user_id: userId,
    action: "project_submitted",
    entity_type: "project",
    entity_id: projectId,
    metadata: { submission_status: "submitted" },
  });

  revalidatePath("/developer");
  revalidatePath("/admin");
}

export async function createMediaSubmissionAction(formData: FormData) {
  const { supabase, userId } = await requireDeveloperAccess("/developer");
  const listingId = String(formData.get("listing_id") ?? "");
  const projectId = String(formData.get("project_id") ?? "");
  const mediaType = String(formData.get("media_type") ?? "");
  const url = String(formData.get("url") ?? "").trim();

  const validTypes = new Set(["brochure", "floorplan", "image", "other"]);
  if (!validTypes.has(mediaType)) return;
  if (!url) return;

  let developerId: string | null = null;
  if (isUuid(listingId)) {
    const { data: listing } = await supabase
      .from("listings")
      .select("developer_id")
      .eq("id", listingId)
      .maybeSingle();
    developerId = listing?.developer_id ?? null;
  }
  if (!developerId && isUuid(projectId)) {
    const { data: project } = await supabase
      .from("projects")
      .select("developer_id")
      .eq("id", projectId)
      .maybeSingle();
    developerId = project?.developer_id ?? null;
  }

  const { data } = await supabase.from("submission_media").insert({
    developer_id: developerId,
    listing_id: isUuid(listingId) ? listingId : null,
    project_id: isUuid(projectId) ? projectId : null,
    media_type: mediaType,
    url,
    submission_status: "submitted",
    submitted_by: userId,
  }).select("id").maybeSingle();

  await logActivity(supabase, {
    actor_user_id: userId,
    action: "media_submitted",
    entity: "media",
    meta: { media_type: mediaType },
  });
  await logAudit(supabase, {
    actor_user_id: userId,
    action: "media_submitted",
    entity_type: "submission_media",
    entity_id: data?.id ?? null,
    metadata: { media_type: mediaType },
  });

  revalidatePath("/developer");
  revalidatePath("/admin");
}
