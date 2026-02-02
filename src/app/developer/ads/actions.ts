"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabaseServer";
import { logAudit } from "@/lib/audit";
import { isUuid } from "@/lib/validators";
import { safeNextPath } from "@/lib/paths";

async function requireDeveloperAccess(nextPath: string) {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.auth.getUser();

  if (error || !data?.user) {
    const safeNext = safeNextPath(nextPath, "/developer/ads");
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

async function ensureAdvertiserAccount(
  supabase: Awaited<ReturnType<typeof createSupabaseServerClient>>,
  developerId: string,
  userId: string,
  accountName?: string | null
) {
  const { data: existing } = await supabase
    .from("advertiser_accounts")
    .select("id")
    .eq("developer_id", developerId)
    .maybeSingle();
  if (existing?.id) return existing.id;

  const { data } = await supabase
    .from("advertiser_accounts")
    .insert({
      developer_id: developerId,
      name: accountName ?? null,
      created_by: userId,
    })
    .select("id")
    .maybeSingle();
  return data?.id ?? null;
}

export async function createCampaignAction(formData: FormData) {
  const { supabase, userId, role } = await requireDeveloperAccess("/developer/ads");

  const devInput = String(formData.get("developer_id") ?? "");
  const developerId = await resolveDeveloperId(supabase, userId, role, devInput);
  if (!developerId) return;

  const advertiserId = await ensureAdvertiserAccount(
    supabase,
    developerId,
    userId,
    String(formData.get("account_name") ?? "") || null
  );
  if (!advertiserId) return;

  const status = role === "admin" ? String(formData.get("status") ?? "draft") : "draft";

  const { data } = await supabase
    .from("ad_campaigns")
    .insert({
      advertiser_id: advertiserId,
      developer_id: developerId,
      title_ar: String(formData.get("title_ar") ?? "") || null,
      title_en: String(formData.get("title_en") ?? "") || null,
      body_ar: String(formData.get("body_ar") ?? "") || null,
      body_en: String(formData.get("body_en") ?? "") || null,
      cta_label_ar: String(formData.get("cta_label_ar") ?? "") || null,
      cta_label_en: String(formData.get("cta_label_en") ?? "") || null,
      cta_url: String(formData.get("cta_url") ?? "") || null,
      status,
    })
    .select("id")
    .maybeSingle();

  if (data?.id) {
    await logAudit(supabase, {
      actor_user_id: userId,
      action: "ad_campaign_created",
      entity_type: "ad_campaign",
      entity_id: data.id,
    });
  }

  revalidatePath("/developer/ads");
}

export async function updateCampaignAction(formData: FormData) {
  const { supabase, userId, role } = await requireDeveloperAccess("/developer/ads");
  const id = String(formData.get("id") ?? "");
  if (!isUuid(id)) return;

  const updates: Record<string, unknown> = {
    title_ar: String(formData.get("title_ar") ?? "") || null,
    title_en: String(formData.get("title_en") ?? "") || null,
    body_ar: String(formData.get("body_ar") ?? "") || null,
    body_en: String(formData.get("body_en") ?? "") || null,
    cta_label_ar: String(formData.get("cta_label_ar") ?? "") || null,
    cta_label_en: String(formData.get("cta_label_en") ?? "") || null,
    cta_url: String(formData.get("cta_url") ?? "") || null,
  };

  if (role === "admin") {
    updates.status = String(formData.get("status") ?? "") || "draft";
  }

  await supabase.from("ad_campaigns").update(updates).eq("id", id);

  await logAudit(supabase, {
    actor_user_id: userId,
    action: "ad_campaign_updated",
    entity_type: "ad_campaign",
    entity_id: id,
  });

  revalidatePath("/developer/ads");
}

export async function submitCampaignAction(formData: FormData) {
  const { supabase, userId } = await requireDeveloperAccess("/developer/ads");
  const id = String(formData.get("id") ?? "");
  if (!isUuid(id)) return;

  await supabase.from("ad_campaigns").update({ status: "submitted" }).eq("id", id);

  await logAudit(supabase, {
    actor_user_id: userId,
    action: "ad_campaign_submitted",
    entity_type: "ad_campaign",
    entity_id: id,
  });

  revalidatePath("/developer/ads");
}

export async function deleteCampaignAction(formData: FormData) {
  const { supabase, userId } = await requireDeveloperAccess("/developer/ads");
  const id = String(formData.get("id") ?? "");
  if (!isUuid(id)) return;

  await supabase.from("ad_campaigns").delete().eq("id", id);

  await logAudit(supabase, {
    actor_user_id: userId,
    action: "ad_campaign_deleted",
    entity_type: "ad_campaign",
    entity_id: id,
  });

  revalidatePath("/developer/ads");
}

export async function createAssetAction(formData: FormData) {
  const { supabase, userId } = await requireDeveloperAccess("/developer/ads");
  const campaignId = String(formData.get("campaign_id") ?? "");
  if (!isUuid(campaignId)) return;

  const { data: campaign } = await supabase
    .from("ad_campaigns")
    .select("developer_id")
    .eq("id", campaignId)
    .maybeSingle();
  if (!campaign?.developer_id) return;

  await supabase.from("ad_assets").insert({
    campaign_id: campaignId,
    developer_id: campaign.developer_id,
    media_type: String(formData.get("media_type") ?? "image"),
    url: String(formData.get("url") ?? ""),
    poster_url: String(formData.get("poster_url") ?? "") || null,
    sort_order: Number(formData.get("sort_order") ?? 0),
    is_primary: Boolean(formData.get("is_primary")),
  });

  await logAudit(supabase, {
    actor_user_id: userId,
    action: "ad_asset_created",
    entity_type: "ad_asset",
    entity_id: campaignId,
    metadata: { campaign_id: campaignId },
  });

  revalidatePath("/developer/ads");
}

export async function deleteAssetAction(formData: FormData) {
  const { supabase, userId } = await requireDeveloperAccess("/developer/ads");
  const id = String(formData.get("id") ?? "");
  if (!isUuid(id)) return;

  await supabase.from("ad_assets").delete().eq("id", id);

  await logAudit(supabase, {
    actor_user_id: userId,
    action: "ad_asset_deleted",
    entity_type: "ad_asset",
    entity_id: id,
  });

  revalidatePath("/developer/ads");
}
