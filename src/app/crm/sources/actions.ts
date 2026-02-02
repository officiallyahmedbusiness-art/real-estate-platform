"use server";

import { revalidatePath } from "next/cache";
import { createSupabaseServerClient } from "@/lib/supabaseServer";
import { requireRole } from "@/lib/auth";
import { logActivity } from "@/lib/activity";

function clean(value: FormDataEntryValue | null) {
  return typeof value === "string" ? value.trim() : "";
}

async function requireAdmin(nextPath: string) {
  const { user, role } = await requireRole(["owner", "admin"], nextPath);
  return { user, role };
}

export async function createLeadSourceAction(formData: FormData) {
  const { user } = await requireAdmin("/crm/sources");
  const supabase = await createSupabaseServerClient();

  const slug = clean(formData.get("slug"));
  const name = clean(formData.get("name"));
  if (!slug || !name) return;

  const { data: inserted } = await supabase
    .from("lead_sources")
    .insert({ slug, name, is_active: true })
    .select("id")
    .maybeSingle();

  if (inserted?.id) {
    await logActivity(supabase, {
      actor_user_id: user.id,
      action: "lead_source_created",
      entity: "lead_source",
      entity_id: inserted.id,
      meta: { slug },
    });
  }

  revalidatePath("/crm/sources");
}

export async function toggleLeadSourceAction(formData: FormData) {
  const { user } = await requireAdmin("/crm/sources");
  const supabase = await createSupabaseServerClient();

  const id = clean(formData.get("id"));
  const nextActive = clean(formData.get("is_active")) === "1";
  if (!id) return;

  await supabase.from("lead_sources").update({ is_active: nextActive }).eq("id", id);
  await logActivity(supabase, {
    actor_user_id: user.id,
    action: "lead_source_toggled",
    entity: "lead_source",
    entity_id: id,
    meta: { is_active: nextActive },
  });

  revalidatePath("/crm/sources");
}
