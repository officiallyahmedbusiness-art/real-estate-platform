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
    const safeNext = safeNextPath(nextPath, "/admin/ads");
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

export async function updateAdCampaignAction(formData: FormData) {
  const { supabase, userId } = await requireAdmin("/admin/ads");
  const id = String(formData.get("id") ?? "");
  if (!id) return;

  await supabase
    .from("ad_campaigns")
    .update({
      title_ar: String(formData.get("title_ar") ?? "") || null,
      title_en: String(formData.get("title_en") ?? "") || null,
      body_ar: String(formData.get("body_ar") ?? "") || null,
      body_en: String(formData.get("body_en") ?? "") || null,
      cta_label_ar: String(formData.get("cta_label_ar") ?? "") || null,
      cta_label_en: String(formData.get("cta_label_en") ?? "") || null,
      cta_url: String(formData.get("cta_url") ?? "") || null,
      status: String(formData.get("status") ?? "draft"),
    })
    .eq("id", id);

  await logAudit(supabase, {
    actor_user_id: userId,
    action: "ad_campaign_updated",
    entity_type: "ad_campaign",
    entity_id: id,
  });

  revalidatePath("/admin/ads");
}

export async function requestChangesAction(formData: FormData) {
  const { supabase, userId } = await requireAdmin("/admin/ads");
  const id = String(formData.get("id") ?? "");
  if (!id) return;

  await supabase.from("ad_campaigns").update({ status: "needs_changes" }).eq("id", id);

  await logAudit(supabase, {
    actor_user_id: userId,
    action: "ad_campaign_needs_changes",
    entity_type: "ad_campaign",
    entity_id: id,
  });

  revalidatePath("/admin/ads");
}

export async function approveCampaignAction(formData: FormData) {
  const { supabase, userId } = await requireAdmin("/admin/ads");
  const id = String(formData.get("id") ?? "");
  if (!id) return;

  await supabase.from("ad_campaigns").update({ status: "approved" }).eq("id", id);

  await logAudit(supabase, {
    actor_user_id: userId,
    action: "ad_campaign_approved",
    entity_type: "ad_campaign",
    entity_id: id,
  });

  revalidatePath("/admin/ads");
}

export async function publishCampaignAction(formData: FormData) {
  const { supabase, userId } = await requireAdmin("/admin/ads");
  const id = String(formData.get("id") ?? "");
  if (!id) return;

  await supabase.from("ad_campaigns").update({ status: "published" }).eq("id", id);

  await logAudit(supabase, {
    actor_user_id: userId,
    action: "ad_campaign_published",
    entity_type: "ad_campaign",
    entity_id: id,
  });

  revalidatePath("/admin/ads");
}

export async function archiveCampaignAction(formData: FormData) {
  const { supabase, userId } = await requireAdmin("/admin/ads");
  const id = String(formData.get("id") ?? "");
  if (!id) return;

  await supabase.from("ad_campaigns").update({ status: "archived" }).eq("id", id);

  await logAudit(supabase, {
    actor_user_id: userId,
    action: "ad_campaign_archived",
    entity_type: "ad_campaign",
    entity_id: id,
  });

  revalidatePath("/admin/ads");
}
