import type { SupabaseClient } from "@supabase/supabase-js";

type ActivityPayload = {
  actor_user_id: string | null;
  action: string;
  entity: string;
  entity_id?: string | null;
  meta?: Record<string, unknown>;
};

export async function logActivity(
  supabase: SupabaseClient,
  payload: ActivityPayload
) {
  try {
    await supabase.from("activity_log").insert({
      actor_user_id: payload.actor_user_id,
      action: payload.action,
      entity: payload.entity,
      entity_id: payload.entity_id ?? null,
      meta: payload.meta ?? {},
    });
  } catch {
    // Best effort only; avoid breaking primary flow.
  }
}
