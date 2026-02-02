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
    const safeNext = safeNextPath(nextPath, "/admin/partners");
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

export async function createPartnerAction(formData: FormData) {
  const { supabase, userId } = await requireAdmin("/admin/partners");
  const name_ar = String(formData.get("name_ar") ?? "").trim();
  const name_en = String(formData.get("name_en") ?? "").trim();
  if (!name_ar || !name_en) return;
  const logo_url = String(formData.get("logo_url") ?? "").trim() || null;
  const sort_order = parseSort(formData.get("sort_order"));
  const is_active = parseBool(formData.get("is_active"));

  const { data } = await supabase
    .from("marketing_partners")
    .insert({ name_ar, name_en, logo_url, sort_order, is_active })
    .select("id")
    .maybeSingle();

  await logAudit(supabase, {
    actor_user_id: userId,
    action: "partner_created",
    entity_type: "marketing_partner",
    entity_id: data?.id ?? null,
    metadata: { name_ar, name_en },
  });
  revalidatePath("/");
  revalidatePath("/admin/partners");
}

export async function updatePartnerAction(formData: FormData) {
  const { supabase, userId } = await requireAdmin("/admin/partners");
  const id = String(formData.get("id") ?? "");
  if (!id) return;
  const name_ar = String(formData.get("name_ar") ?? "").trim();
  const name_en = String(formData.get("name_en") ?? "").trim();
  const logo_url = String(formData.get("logo_url") ?? "").trim() || null;
  const sort_order = parseSort(formData.get("sort_order"));
  const is_active = parseBool(formData.get("is_active"));

  await supabase
    .from("marketing_partners")
    .update({ name_ar, name_en, logo_url, sort_order, is_active })
    .eq("id", id);

  await logAudit(supabase, {
    actor_user_id: userId,
    action: "partner_updated",
    entity_type: "marketing_partner",
    entity_id: id,
  });
  revalidatePath("/");
  revalidatePath("/admin/partners");
}

export async function deletePartnerAction(formData: FormData) {
  const { supabase, userId } = await requireAdmin("/admin/partners");
  const id = String(formData.get("id") ?? "");
  if (!id) return;
  await supabase.from("marketing_partners").delete().eq("id", id);

  await logAudit(supabase, {
    actor_user_id: userId,
    action: "partner_deleted",
    entity_type: "marketing_partner",
    entity_id: id,
  });
  revalidatePath("/");
  revalidatePath("/admin/partners");
}
