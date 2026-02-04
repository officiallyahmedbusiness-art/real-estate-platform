import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createSupabaseServerClient } from "@/lib/supabaseServer";
import { isUuid } from "@/lib/validators";
import { logAudit } from "@/lib/audit";

function clean(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.auth.getUser();

  if (error || !data?.user) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", data.user.id)
    .maybeSingle();

  if (profile?.role !== "owner") {
    return NextResponse.json({ ok: false, error: "forbidden" }, { status: 403 });
  }

  const secret = process.env.OWNER_SECRET ?? "";
  if (!secret) {
    return NextResponse.json({ ok: false, error: "owner_locked" }, { status: 403 });
  }
  const token = (await cookies()).get("owner_token")?.value ?? "";
  if (token !== secret) {
    return NextResponse.json({ ok: false, error: "owner_locked" }, { status: 403 });
  }

  let payload: Record<string, unknown> = {};
  try {
    payload = (await request.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ ok: false, error: "invalid_input" }, { status: 400 });
  }

  const leadId = clean(payload.id);
  const confirm = clean(payload.confirm);
  if (!isUuid(leadId) || confirm !== "DELETE") {
    return NextResponse.json({ ok: false, error: "invalid_input" }, { status: 400 });
  }

  const { error: deleteError } = await supabase.from("leads").delete().eq("id", leadId);
  if (deleteError) {
    return NextResponse.json({ ok: false, error: "delete_failed" }, { status: 400 });
  }

  await logAudit(supabase, {
    actor_user_id: data.user.id,
    action: "lead_deleted",
    entity_type: "lead",
    entity_id: leadId,
  });

  return NextResponse.json({ ok: true });
}
