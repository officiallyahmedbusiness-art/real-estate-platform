"use server";

import { revalidatePath } from "next/cache";
import { createSupabaseServerClient } from "@/lib/supabaseServer";
import { requireRole } from "@/lib/auth";
import { isUuid, parseListingInput, parseSubmissionStatus, parseUnitStatus } from "@/lib/validators";
import { logActivity } from "@/lib/activity";
import { logAudit } from "@/lib/audit";

function clean(value: FormDataEntryValue | null) {
  return typeof value === "string" ? value.trim() : "";
}

function toNumber(value: FormDataEntryValue | null) {
  const num = typeof value === "string" && value.trim() === "" ? NaN : Number(value);
  return Number.isFinite(num) ? num : null;
}

function toBoolean(value: FormDataEntryValue | null) {
  if (typeof value !== "string") return false;
  return value === "1" || value.toLowerCase() === "true" || value.toLowerCase() === "on";
}

function generateCode(prefix = "HR") {
  const stamp = new Date().toISOString().slice(0, 10).replace(/-/g, "");
  const rand = Math.floor(1000 + Math.random() * 9000);
  return `${prefix}-${stamp}-${rand}`;
}

async function requireStaff(nextPath: string) {
  const { user, role } = await requireRole(["owner", "admin", "ops", "staff", "agent"], nextPath);
  return { user, role };
}

function buildTitle(type: string, area: string | null, city: string) {
  if (type && area) return `${type} - ${area}`;
  if (type) return `${type} - ${city}`;
  return area ?? city;
}

async function resolveAgentName(
  supabase: Awaited<ReturnType<typeof createSupabaseServerClient>>,
  agentUserId: string | null,
  fallbackName: string | null
) {
  if (!agentUserId) return fallbackName;
  if (!isUuid(agentUserId)) return fallbackName;
  const { data } = await supabase
    .from("profiles")
    .select("full_name")
    .eq("id", agentUserId)
    .maybeSingle();
  return data?.full_name ?? fallbackName;
}

async function getOwnerAccess(
  supabase: Awaited<ReturnType<typeof createSupabaseServerClient>>
) {
  const { data } = await supabase.rpc("has_owner_access");
  return Boolean(data);
}

export async function createResaleListingAction(formData: FormData) {
  const { user } = await requireStaff("/staff");
  const supabase = await createSupabaseServerClient();
  const ownerAccess = await getOwnerAccess(supabase);

  const type = clean(formData.get("type"));
  const purpose = clean(formData.get("purpose")) || "sale";
  const price = formData.get("price");
  const currency = clean(formData.get("currency")) || "EGP";
  const city = clean(formData.get("city"));
  const area = clean(formData.get("area")) || null;
  const address = clean(formData.get("address")) || null;
  const beds = formData.get("beds");
  const baths = formData.get("baths");
  const size_m2 = formData.get("size_m2");
  const description = clean(formData.get("description")) || null;
  const description_ar = clean(formData.get("description_ar")) || null;
  const description_en = clean(formData.get("description_en")) || null;
  const amenities = clean(formData.get("amenities"));
  const unitStatus = parseUnitStatus(formData.get("unit_status")) ?? "available";
  const target = clean(formData.get("target")) || null;
  const requested = clean(formData.get("requested")) || target;

  const title_ar = clean(formData.get("title_ar"));
  const title_en = clean(formData.get("title_en"));
  const baseTitle = clean(formData.get("title")) || title_ar || title_en || "";
  const resolvedTitle = baseTitle || buildTitle(type, area, city);

  const listingInput = parseListingInput({
    title: resolvedTitle,
    title_ar: title_ar || null,
    title_en: title_en || null,
    type,
    purpose,
    price,
    currency,
    city,
    area,
    address,
    beds,
    baths,
    size_m2,
    description,
    description_ar,
    description_en,
    amenities,
    status: "draft",
  });

  if (!listingInput) return;

  const listingCode = clean(formData.get("listing_code")) || generateCode("HR");
  const unitCode = clean(formData.get("unit_code")) || null;
  const agentUserIdRaw = clean(formData.get("agent_user_id")) || null;
  const agentUserId = agentUserIdRaw && isUuid(agentUserIdRaw) ? agentUserIdRaw : null;
  const agentNameInput = clean(formData.get("agent_name")) || null;
  const agentName = await resolveAgentName(supabase, agentUserId, agentNameInput);

  const { data: inserted, error } = await supabase
    .from("listings")
    .insert({
      owner_user_id: user.id,
      developer_id: null,
      title: listingInput.title,
      title_ar: listingInput.title_ar,
      title_en: listingInput.title_en,
      type: listingInput.type,
      purpose: listingInput.purpose,
      price: listingInput.price,
      currency: listingInput.currency,
      city: listingInput.city,
      area: listingInput.area,
      address: listingInput.address,
      beds: listingInput.beds,
      baths: listingInput.baths,
      size_m2: listingInput.size_m2,
      description: listingInput.description,
      description_ar: listingInput.description_ar,
      description_en: listingInput.description_en,
      amenities: listingInput.amenities,
      status: "draft",
      submission_status: "draft",
      inventory_source: "resale",
      listing_code: listingCode,
      unit_code: unitCode,
      hr_owner_user_id: user.id,
      agent_user_id: agentUserId,
      agent_name: agentName,
      floor: clean(formData.get("floor")) || null,
      elevator: toBoolean(formData.get("elevator")),
      finishing: clean(formData.get("finishing")) || null,
      meters: clean(formData.get("meters")) || null,
      reception: toNumber(formData.get("reception")),
      kitchen: toBoolean(formData.get("kitchen")),
      view: clean(formData.get("view")) || null,
      building: clean(formData.get("building")) || null,
      has_images: false,
      commission: clean(formData.get("commission")) || null,
      intake_date: clean(formData.get("intake_date")) || null,
      target,
      ad_channel: clean(formData.get("ad_channel")) || null,
      requested,
      unit_status: unitStatus,
    })
    .select("id")
    .maybeSingle();

  if (error || !inserted) return;

  if (ownerAccess) {
    await supabase.from("resale_intake").insert({
      listing_id: inserted.id,
      agent_user_id: agentUserId,
      agent_name: agentName,
      owner_name: clean(formData.get("owner_name")) || null,
      owner_phone: clean(formData.get("owner_phone")) || null,
      unit_code: unitCode,
      floor: clean(formData.get("floor")) || null,
      size_m2: toNumber(size_m2),
      elevator: toBoolean(formData.get("elevator")),
      finishing: clean(formData.get("finishing")) || null,
      meters: clean(formData.get("meters")) || null,
      bedrooms: toNumber(beds),
      reception: toNumber(formData.get("reception")),
      bathrooms: toNumber(baths),
      kitchen: toBoolean(formData.get("kitchen")),
      view: clean(formData.get("view")) || null,
      building: clean(formData.get("building")) || null,
      has_images: false,
      entrance: clean(formData.get("entrance")) || null,
      commission: clean(formData.get("commission")) || null,
      intake_date: clean(formData.get("intake_date")) || null,
      target,
      ad_channel: clean(formData.get("ad_channel")) || null,
      address: address,
      area: area,
      city: city,
      price: listingInput.price,
      currency: listingInput.currency,
      notes: clean(formData.get("notes")) || null,
      owner_notes: clean(formData.get("owner_notes")) || null,
      last_owner_contact_at: clean(formData.get("last_owner_contact_at")) || null,
      last_owner_contact_note: clean(formData.get("last_owner_contact_note")) || null,
      next_owner_followup_at: clean(formData.get("next_owner_followup_at")) || null,
      created_by: user.id,
    });
  }

  await logActivity(supabase, {
    actor_user_id: user.id,
    action: "resale_created",
    entity: "listing",
    entity_id: inserted.id,
    meta: { listing_code: listingCode, inventory_source: "resale" },
  });
  await logAudit(supabase, {
    actor_user_id: user.id,
    action: "listing_created",
    entity_type: "listing",
    entity_id: inserted.id,
    metadata: { listing_code: listingCode, inventory_source: "resale" },
  });

  revalidatePath("/staff");
}

export async function updateResaleListingAction(formData: FormData) {
  const { user } = await requireStaff("/staff");
  const supabase = await createSupabaseServerClient();
  const ownerAccess = await getOwnerAccess(supabase);

  const listingId = clean(formData.get("listing_id"));
  if (!isUuid(listingId)) return;

  const type = clean(formData.get("type"));
  const purpose = clean(formData.get("purpose")) || "sale";
  const price = formData.get("price");
  const currency = clean(formData.get("currency")) || "EGP";
  const city = clean(formData.get("city"));
  const area = clean(formData.get("area")) || null;
  const address = clean(formData.get("address")) || null;
  const beds = formData.get("beds");
  const baths = formData.get("baths");
  const size_m2 = formData.get("size_m2");
  const description = clean(formData.get("description")) || null;
  const description_ar = clean(formData.get("description_ar")) || null;
  const description_en = clean(formData.get("description_en")) || null;
  const amenities = clean(formData.get("amenities"));
  const unitStatus = parseUnitStatus(formData.get("unit_status")) ?? "available";
  const target = clean(formData.get("target")) || null;
  const requested = clean(formData.get("requested")) || target;

  const title_ar = clean(formData.get("title_ar"));
  const title_en = clean(formData.get("title_en"));
  const baseTitle = clean(formData.get("title")) || title_ar || title_en || "";
  const resolvedTitle = baseTitle || buildTitle(type, area, city);

  const listingInput = parseListingInput({
    title: resolvedTitle,
    title_ar: title_ar || null,
    title_en: title_en || null,
    type,
    purpose,
    price,
    currency,
    city,
    area,
    address,
    beds,
    baths,
    size_m2,
    description,
    description_ar,
    description_en,
    amenities,
    status: "draft",
  });

  if (!listingInput) return;

  const agentUserIdRaw = clean(formData.get("agent_user_id")) || null;
  const agentUserId = agentUserIdRaw && isUuid(agentUserIdRaw) ? agentUserIdRaw : null;
  const agentNameInput = clean(formData.get("agent_name")) || null;
  const agentName = await resolveAgentName(supabase, agentUserId, agentNameInput);

  await supabase
    .from("listings")
    .update({
      title: listingInput.title,
      title_ar: listingInput.title_ar,
      title_en: listingInput.title_en,
      type: listingInput.type,
      purpose: listingInput.purpose,
      price: listingInput.price,
      currency: listingInput.currency,
      city: listingInput.city,
      area: listingInput.area,
      address: listingInput.address,
      beds: listingInput.beds,
      baths: listingInput.baths,
      size_m2: listingInput.size_m2,
      description: listingInput.description,
      description_ar: listingInput.description_ar,
      description_en: listingInput.description_en,
      amenities: listingInput.amenities,
      listing_code: clean(formData.get("listing_code")) || null,
      unit_code: clean(formData.get("unit_code")) || null,
      hr_owner_user_id: user.id,
      agent_user_id: agentUserId,
      agent_name: agentName,
      floor: clean(formData.get("floor")) || null,
      elevator: toBoolean(formData.get("elevator")),
      finishing: clean(formData.get("finishing")) || null,
      meters: clean(formData.get("meters")) || null,
      reception: toNumber(formData.get("reception")),
      kitchen: toBoolean(formData.get("kitchen")),
      view: clean(formData.get("view")) || null,
      building: clean(formData.get("building")) || null,
      commission: clean(formData.get("commission")) || null,
      intake_date: clean(formData.get("intake_date")) || null,
      target,
      ad_channel: clean(formData.get("ad_channel")) || null,
      requested,
      unit_status: unitStatus,
    })
    .eq("id", listingId);

  if (ownerAccess) {
    await supabase.from("resale_intake").upsert({
      listing_id: listingId,
      agent_user_id: agentUserId,
      agent_name: agentName,
      owner_name: clean(formData.get("owner_name")) || null,
      owner_phone: clean(formData.get("owner_phone")) || null,
      unit_code: clean(formData.get("unit_code")) || null,
      floor: clean(formData.get("floor")) || null,
      size_m2: toNumber(size_m2),
      elevator: toBoolean(formData.get("elevator")),
      finishing: clean(formData.get("finishing")) || null,
      meters: clean(formData.get("meters")) || null,
      bedrooms: toNumber(beds),
      reception: toNumber(formData.get("reception")),
      bathrooms: toNumber(baths),
      kitchen: toBoolean(formData.get("kitchen")),
      view: clean(formData.get("view")) || null,
      building: clean(formData.get("building")) || null,
      entrance: clean(formData.get("entrance")) || null,
      commission: clean(formData.get("commission")) || null,
      intake_date: clean(formData.get("intake_date")) || null,
      target,
      ad_channel: clean(formData.get("ad_channel")) || null,
      address: address,
      area: area,
      city: city,
      price: listingInput.price,
      currency: listingInput.currency,
      notes: clean(formData.get("notes")) || null,
      owner_notes: clean(formData.get("owner_notes")) || null,
      last_owner_contact_at: clean(formData.get("last_owner_contact_at")) || null,
      last_owner_contact_note: clean(formData.get("last_owner_contact_note")) || null,
      next_owner_followup_at: clean(formData.get("next_owner_followup_at")) || null,
      created_by: user.id,
    });
  }

  await logActivity(supabase, {
    actor_user_id: user.id,
    action: "resale_updated",
    entity: "listing",
    entity_id: listingId,
    meta: { inventory_source: "resale" },
  });
  await logAudit(supabase, {
    actor_user_id: user.id,
    action: "listing_updated",
    entity_type: "listing",
    entity_id: listingId,
    metadata: { inventory_source: "resale" },
  });

  revalidatePath("/staff");
  revalidatePath(`/staff/units/${listingId}`);
}

export async function duplicateResaleListingAction(formData: FormData) {
  const { user } = await requireStaff("/staff");
  const supabase = await createSupabaseServerClient();
  const ownerAccess = await getOwnerAccess(supabase);

  const listingId = clean(formData.get("listing_id"));
  if (!isUuid(listingId)) return;

  const { data: listing } = await supabase
    .from("listings")
    .select("*")
    .eq("id", listingId)
    .maybeSingle();

  if (!listing) return;

  const { data: intake } = ownerAccess
    ? await supabase.from("resale_intake").select("*").eq("listing_id", listingId).maybeSingle()
    : { data: null };

  const newListingCode = generateCode("HR");
  const newUnitCode = intake?.unit_code ? `${intake.unit_code}-copy` : null;

  const { data: inserted, error } = await supabase
    .from("listings")
    .insert({
      owner_user_id: listing.owner_user_id,
      developer_id: null,
      title: listing.title,
      title_ar: listing.title_ar,
      title_en: listing.title_en,
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
      description: listing.description,
      description_ar: listing.description_ar,
      description_en: listing.description_en,
      amenities: listing.amenities,
      status: "draft",
      submission_status: "draft",
      inventory_source: "resale",
      listing_code: newListingCode,
      unit_code: newUnitCode,
      hr_owner_user_id: listing.hr_owner_user_id,
      agent_user_id: listing.agent_user_id,
      agent_name: listing.agent_name,
      floor: listing.floor,
      elevator: listing.elevator,
      finishing: listing.finishing,
      meters: listing.meters,
      reception: listing.reception,
      kitchen: listing.kitchen,
      view: listing.view,
      building: listing.building,
      has_images: false,
      commission: listing.commission,
      intake_date: listing.intake_date,
      target: listing.target,
      ad_channel: listing.ad_channel,
      requested: listing.requested,
      unit_status: listing.unit_status ?? "available",
    })
    .select("id")
    .maybeSingle();

  if (error || !inserted) return;

  if (intake && ownerAccess) {
    await supabase.from("resale_intake").insert({
      ...intake,
      listing_id: inserted.id,
      unit_code: newUnitCode,
      created_at: undefined,
      updated_at: undefined,
    });
  }

  await logActivity(supabase, {
    actor_user_id: user.id,
    action: "resale_duplicated",
    entity: "listing",
    entity_id: inserted.id,
    meta: { source_id: listingId },
  });
  await logAudit(supabase, {
    actor_user_id: user.id,
    action: "listing_duplicated",
    entity_type: "listing",
    entity_id: inserted.id,
    metadata: { source_id: listingId },
  });

  revalidatePath("/staff");
}

export async function updateResaleSubmissionStatusAction(formData: FormData) {
  const { role } = await requireStaff("/staff");
  const supabase = await createSupabaseServerClient();
  const { data: auth } = await supabase.auth.getUser();
  const actorId = auth?.user?.id ?? null;

  const listingId = clean(formData.get("listing_id"));
  const nextStatus = parseSubmissionStatus(formData.get("submission_status"));
  if (!isUuid(listingId) || !nextStatus) return;
  if (nextStatus === "published" && role !== "admin" && role !== "owner") return;

  const now = new Date().toISOString();
  const updates: Record<string, string> = {
    submission_status: nextStatus,
  };

  if (nextStatus === "submitted") updates.submitted_at = now;
  if (nextStatus === "under_review") updates.reviewed_at = now;
  if (nextStatus === "needs_changes") updates.reviewed_at = now;
  if (nextStatus === "approved") updates.approved_at = now;
  if (nextStatus === "published") updates.published_at = now;
  if (nextStatus === "archived") updates.archived_at = now;

  if (nextStatus === "published") {
    updates.status = "published";
  } else if (nextStatus === "archived") {
    updates.status = "archived";
  } else {
    updates.status = "draft";
  }

  await supabase.from("listings").update(updates).eq("id", listingId);
  if (actorId) {
    await logActivity(supabase, {
      actor_user_id: actorId,
      action: "resale_submission_status",
      entity: "listing",
      entity_id: listingId,
      meta: { submission_status: nextStatus },
    });
    await logAudit(supabase, {
      actor_user_id: actorId,
      action: "listing_submission_status",
      entity_type: "listing",
      entity_id: listingId,
      metadata: { submission_status: nextStatus },
    });
  }
  revalidatePath("/staff");
  revalidatePath(`/staff/units/${listingId}`);
}
