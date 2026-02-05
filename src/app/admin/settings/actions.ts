"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { requireRole } from "@/lib/auth";
import { createSupabaseServerClient } from "@/lib/supabaseServer";
import { logAudit } from "@/lib/audit";
import { parseSettingsFormData } from "@/lib/settings/validation";

export type SettingsActionState = {
  ok: boolean;
  errors?: Record<string, string>;
};

const INITIAL_STATE: SettingsActionState = { ok: false };

export async function updateSettingsAction(
  _prevState: SettingsActionState,
  formData: FormData
): Promise<SettingsActionState> {
  const { user } = await requireRole(["owner", "admin"], "/admin/settings");
  const { values, errors } = parseSettingsFormData(formData);

  if (Object.keys(errors).length > 0) {
    return { ok: false, errors };
  }

  const supabase = await createSupabaseServerClient();
  const entries = Object.entries(values).map(([key, value]) => ({ key, value }));

  const { error } = await supabase.from("site_settings").upsert(entries, { onConflict: "key" });
  if (error) {
    return { ok: false, errors: { form: "save_failed" } };
  }

  const hdrs = await headers();
  await logAudit(supabase, {
    actor_user_id: user.id,
    action: "site_settings_updated",
    entity_type: "site_settings",
    metadata: { keys: entries.map((entry) => entry.key) },
    ip: hdrs.get("x-forwarded-for"),
    user_agent: hdrs.get("user-agent"),
  });

  revalidatePath("/admin/settings");
  revalidatePath("/");
  revalidatePath("/listings");
  revalidatePath("/saved");

  return { ok: true };
}

export { INITIAL_STATE as SETTINGS_INITIAL_STATE };
