import type { SupabaseClient } from "@supabase/supabase-js";

type AuditPayload = {
  actor_user_id: string | null;
  action: string;
  entity_type: string;
  entity_id?: string | null;
  metadata?: Record<string, unknown>;
  ip?: string | null;
  user_agent?: string | null;
};

export async function logAudit(
  supabase: SupabaseClient,
  payload: AuditPayload
) {
  try {
    let metadata = payload.metadata ?? {};
    if (payload.actor_user_id && !("staff_code" in metadata)) {
      const { data } = await supabase
        .from("profiles")
        .select("staff_code")
        .eq("id", payload.actor_user_id)
        .maybeSingle();
      if (data?.staff_code) {
        metadata = { ...metadata, staff_code: data.staff_code };
      }
    }
    await supabase.from("audit_log").insert({
      actor_user_id: payload.actor_user_id,
      action: payload.action,
      entity_type: payload.entity_type,
      entity_id: payload.entity_id ?? null,
      metadata,
      ip: payload.ip ?? null,
      user_agent: payload.user_agent ?? null,
    });
  } catch {
    // Best effort only.
  }
}
