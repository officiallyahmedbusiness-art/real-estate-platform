"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabaseServer";
import { safeNextPath } from "@/lib/paths";
import { logAudit } from "@/lib/audit";

async function requireAdmin(nextPath: string) {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.auth.getUser();

  if (error || !data?.user) {
    const safeNext = safeNextPath(nextPath, "/admin/homepage");
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

function parseBool(value: FormDataEntryValue | null) {
  return value === "on" || value === "true";
}

function parseSort(value: FormDataEntryValue | null) {
  const num = Number(value ?? 0);
  return Number.isFinite(num) ? Math.trunc(num) : 0;
}

export async function createHeroMediaAction(formData: FormData) {
  const { supabase, userId } = await requireAdmin("/admin/homepage");
  const media_type = String(formData.get("media_type") ?? "image");
  const url = String(formData.get("url") ?? "").trim();
  if (!url) return;
  const poster_url = String(formData.get("poster_url") ?? "").trim() || null;
  const title = String(formData.get("title") ?? "").trim() || null;
  const sort_order = parseSort(formData.get("sort_order"));
  const is_published = parseBool(formData.get("is_published"));

  const { data } = await supabase.from("site_media").insert({
    placement: "hero",
    media_type,
    url,
    poster_url,
    title,
    sort_order,
    is_published,
  }).select("id").maybeSingle();
  await logAudit(supabase, {
    actor_user_id: userId,
    action: "site_media_created",
    entity_type: "site_media",
    entity_id: data?.id ?? null,
  });
  revalidatePath("/");
  revalidatePath("/admin/homepage");
}

export async function updateHeroMediaAction(formData: FormData) {
  const { supabase, userId } = await requireAdmin("/admin/homepage");
  const id = String(formData.get("id") ?? "");
  if (!id) return;
  const media_type = String(formData.get("media_type") ?? "image");
  const url = String(formData.get("url") ?? "").trim();
  const poster_url = String(formData.get("poster_url") ?? "").trim() || null;
  const title = String(formData.get("title") ?? "").trim() || null;
  const sort_order = parseSort(formData.get("sort_order"));
  const is_published = parseBool(formData.get("is_published"));

  await supabase
    .from("site_media")
    .update({ media_type, url, poster_url, title, sort_order, is_published })
    .eq("id", id);
  await logAudit(supabase, {
    actor_user_id: userId,
    action: "site_media_updated",
    entity_type: "site_media",
    entity_id: id,
  });

  revalidatePath("/");
  revalidatePath("/admin/homepage");
}

export async function deleteHeroMediaAction(formData: FormData) {
  const { supabase, userId } = await requireAdmin("/admin/homepage");
  const id = String(formData.get("id") ?? "");
  if (!id) return;
  await supabase.from("site_media").delete().eq("id", id);
  await logAudit(supabase, {
    actor_user_id: userId,
    action: "site_media_deleted",
    entity_type: "site_media",
    entity_id: id,
  });
  revalidatePath("/");
  revalidatePath("/admin/homepage");
}

export async function createMetricAction(formData: FormData) {
  const { supabase, userId } = await requireAdmin("/admin/homepage");
  const label_ar = String(formData.get("label_ar") ?? "").trim();
  const label_en = String(formData.get("label_en") ?? "").trim();
  const value = String(formData.get("value") ?? "").trim();
  if (!label_ar || !label_en || !value) return;
  const sort_order = parseSort(formData.get("sort_order"));
  const is_published = parseBool(formData.get("is_published"));

  const { data } = await supabase.from("site_metrics").insert({
    label_ar,
    label_en,
    value,
    sort_order,
    is_published,
  }).select("id").maybeSingle();
  await logAudit(supabase, {
    actor_user_id: userId,
    action: "site_metrics_created",
    entity_type: "site_metrics",
    entity_id: data?.id ?? null,
  });
  revalidatePath("/");
  revalidatePath("/admin/homepage");
}

export async function updateMetricAction(formData: FormData) {
  const { supabase, userId } = await requireAdmin("/admin/homepage");
  const id = String(formData.get("id") ?? "");
  if (!id) return;
  const label_ar = String(formData.get("label_ar") ?? "").trim();
  const label_en = String(formData.get("label_en") ?? "").trim();
  const value = String(formData.get("value") ?? "").trim();
  const sort_order = parseSort(formData.get("sort_order"));
  const is_published = parseBool(formData.get("is_published"));

  await supabase
    .from("site_metrics")
    .update({ label_ar, label_en, value, sort_order, is_published })
    .eq("id", id);
  await logAudit(supabase, {
    actor_user_id: userId,
    action: "site_metrics_updated",
    entity_type: "site_metrics",
    entity_id: id,
  });
  revalidatePath("/");
  revalidatePath("/admin/homepage");
}

export async function deleteMetricAction(formData: FormData) {
  const { supabase, userId } = await requireAdmin("/admin/homepage");
  const id = String(formData.get("id") ?? "");
  if (!id) return;
  await supabase.from("site_metrics").delete().eq("id", id);
  await logAudit(supabase, {
    actor_user_id: userId,
    action: "site_metrics_deleted",
    entity_type: "site_metrics",
    entity_id: id,
  });
  revalidatePath("/");
  revalidatePath("/admin/homepage");
}

export async function createFeaturedProjectAction(formData: FormData) {
  const { supabase, userId } = await requireAdmin("/admin/homepage");
  const title_ar = String(formData.get("title_ar") ?? "").trim();
  const title_en = String(formData.get("title_en") ?? "").trim();
  const location_ar = String(formData.get("location_ar") ?? "").trim();
  const location_en = String(formData.get("location_en") ?? "").trim();
  if (!title_ar || !title_en || !location_ar || !location_en) return;
  const starting_price = formData.get("starting_price");
  const currency = String(formData.get("currency") ?? "EGP").trim() || "EGP";
  const image_url = String(formData.get("image_url") ?? "").trim() || null;
  const cta_url = String(formData.get("cta_url") ?? "").trim() || null;
  const sort_order = parseSort(formData.get("sort_order"));
  const is_published = parseBool(formData.get("is_published"));

  const { data } = await supabase.from("featured_projects").insert({
    title_ar,
    title_en,
    location_ar,
    location_en,
    starting_price: starting_price ? Number(starting_price) : null,
    currency,
    image_url,
    cta_url,
    sort_order,
    is_published,
  }).select("id").maybeSingle();
  await logAudit(supabase, {
    actor_user_id: userId,
    action: "featured_project_created",
    entity_type: "featured_project",
    entity_id: data?.id ?? null,
  });
  revalidatePath("/");
  revalidatePath("/admin/homepage");
}

export async function updateFeaturedProjectAction(formData: FormData) {
  const { supabase, userId } = await requireAdmin("/admin/homepage");
  const id = String(formData.get("id") ?? "");
  if (!id) return;
  const title_ar = String(formData.get("title_ar") ?? "").trim();
  const title_en = String(formData.get("title_en") ?? "").trim();
  const location_ar = String(formData.get("location_ar") ?? "").trim();
  const location_en = String(formData.get("location_en") ?? "").trim();
  const starting_price = formData.get("starting_price");
  const currency = String(formData.get("currency") ?? "EGP").trim() || "EGP";
  const image_url = String(formData.get("image_url") ?? "").trim() || null;
  const cta_url = String(formData.get("cta_url") ?? "").trim() || null;
  const sort_order = parseSort(formData.get("sort_order"));
  const is_published = parseBool(formData.get("is_published"));

  await supabase
    .from("featured_projects")
    .update({
      title_ar,
      title_en,
      location_ar,
      location_en,
      starting_price: starting_price ? Number(starting_price) : null,
      currency,
      image_url,
      cta_url,
      sort_order,
      is_published,
    })
    .eq("id", id);
  await logAudit(supabase, {
    actor_user_id: userId,
    action: "featured_project_updated",
    entity_type: "featured_project",
    entity_id: id,
  });
  revalidatePath("/");
  revalidatePath("/admin/homepage");
}

export async function deleteFeaturedProjectAction(formData: FormData) {
  const { supabase, userId } = await requireAdmin("/admin/homepage");
  const id = String(formData.get("id") ?? "");
  if (!id) return;
  await supabase.from("featured_projects").delete().eq("id", id);
  await logAudit(supabase, {
    actor_user_id: userId,
    action: "featured_project_deleted",
    entity_type: "featured_project",
    entity_id: id,
  });
  revalidatePath("/");
  revalidatePath("/admin/homepage");
}
