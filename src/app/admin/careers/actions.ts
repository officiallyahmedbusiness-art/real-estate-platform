"use server";

import { createSupabaseServerClient } from "@/lib/supabaseServer";
import { requireRole } from "@/lib/auth";
import { isUuid } from "@/lib/validators";

function clean(value: FormDataEntryValue | null) {
  return typeof value === "string" ? value.trim() : "";
}

export async function updateApplicationStatusAction(formData: FormData) {
  await requireRole(["owner", "admin", "ops"], "/admin/careers");
  const supabase = await createSupabaseServerClient();

  const id = clean(formData.get("id"));
  const status = clean(formData.get("status"));
  if (!isUuid(id) || !status) return;

  await supabase.from("career_applications").update({ status }).eq("id", id);
}
