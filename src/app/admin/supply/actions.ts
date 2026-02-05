"use server";

import { revalidatePath } from "next/cache";
import { createSupabaseServerClient } from "@/lib/supabaseServer";
import { requireRole } from "@/lib/auth";
import { isUuid } from "@/lib/validators";

const statusSet = new Set(["new", "in_review", "contacted", "approved", "rejected"]);

export async function updateDeveloperSupplyAction(formData: FormData) {
  await requireRole(["owner", "admin"], "/admin/supply");
  const requestId = String(formData.get("request_id") ?? "");
  const status = String(formData.get("status") ?? "");
  const internal_notes = String(formData.get("internal_notes") ?? "").trim();

  if (!isUuid(requestId) || !statusSet.has(status)) return;

  const supabase = await createSupabaseServerClient();
  await supabase
    .from("supply_developer_requests")
    .update({ status, internal_notes: internal_notes || null })
    .eq("id", requestId);

  revalidatePath("/admin/supply");
}

export async function updateOwnerSupplyAction(formData: FormData) {
  await requireRole(["owner", "admin"], "/admin/supply");
  const requestId = String(formData.get("request_id") ?? "");
  const status = String(formData.get("status") ?? "");
  const internal_notes = String(formData.get("internal_notes") ?? "").trim();

  if (!isUuid(requestId) || !statusSet.has(status)) return;

  const supabase = await createSupabaseServerClient();
  await supabase
    .from("supply_owner_requests")
    .update({ status, internal_notes: internal_notes || null })
    .eq("id", requestId);

  revalidatePath("/admin/supply");
}
