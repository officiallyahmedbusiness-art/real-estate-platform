import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabaseServer";
import { logAudit } from "@/lib/audit";

export const dynamic = "force-dynamic";

export async function POST() {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.auth.getUser();

  if (error || !data?.user) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }

  const user = data.user;
  const { data: existing } = await supabase
    .from("profiles")
    .select("id, role")
    .eq("id", user.id)
    .maybeSingle();

  const payload = {
    full_name:
      (user.user_metadata?.full_name as string | undefined) ??
      (user.user_metadata?.name as string | undefined) ??
      null,
    phone: user.phone ?? null,
    email: user.email ?? null,
    last_sign_in_at: user.last_sign_in_at ?? null,
  };

  if (existing?.id) {
    await supabase.from("profiles").update(payload).eq("id", user.id);
    return NextResponse.json({ ok: true, updated: true });
  }

  await supabase.from("profiles").insert({
    id: user.id,
    role: "staff",
    ...payload,
  });

  await logAudit(supabase, {
    actor_user_id: user.id,
    action: "profile_created",
    entity_type: "profile",
    entity_id: user.id,
  });

  return NextResponse.json({ ok: true, created: true });
}
