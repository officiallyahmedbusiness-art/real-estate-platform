"use server";

import { revalidatePath } from "next/cache";
import { createSupabaseServerClient } from "@/lib/supabaseServer";
import { requireOwnerAccess } from "@/lib/owner";
import { isUuid } from "@/lib/validators";

function clean(value: FormDataEntryValue | null) {
  return typeof value === "string" ? value.trim() : "";
}

export async function approvePiiChangeAction(formData: FormData) {
  await requireOwnerAccess("/admin/approvals");
  const supabase = await createSupabaseServerClient();

  const requestId = clean(formData.get("request_id"));
  if (!isUuid(requestId)) return;

  await supabase.rpc("approve_pii_change", { request_id: requestId });
  revalidatePath("/admin/approvals");
}

export async function rejectPiiChangeAction(formData: FormData) {
  await requireOwnerAccess("/admin/approvals");
  const supabase = await createSupabaseServerClient();

  const requestId = clean(formData.get("request_id"));
  const reason = clean(formData.get("reason"));
  if (!isUuid(requestId)) return;

  await supabase.rpc("reject_pii_change", { request_id: requestId, reason: reason || null });
  revalidatePath("/admin/approvals");
}

