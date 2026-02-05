import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabaseServer";
import { isUuid } from "@/lib/validators";

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

  const role = profile?.role ?? "staff";
  if (role !== "owner" && role !== "admin") {
    return NextResponse.json({ ok: false, error: "forbidden" }, { status: 403 });
  }

  let payload: Record<string, unknown>;
  try {
    payload = (await request.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ ok: false, error: "invalid_input" }, { status: 400 });
  }

  const rowId = clean(payload.id);
  const tableName = clean(payload.table_name);
  const action = clean(payload.action);
  const confirm = clean(payload.confirm).toUpperCase();

  if (!isUuid(rowId)) {
    return NextResponse.json({ ok: false, error: "invalid_input" }, { status: 400 });
  }
  if (!tableName || !["leads", "customers"].includes(tableName)) {
    return NextResponse.json({ ok: false, error: "invalid_input" }, { status: 400 });
  }
  if (!action || !["hard_delete_request", "soft_delete", "update_pii"].includes(action)) {
    return NextResponse.json({ ok: false, error: "invalid_input" }, { status: 400 });
  }
  if (confirm !== "DELETE") {
    return NextResponse.json({ ok: false, error: "invalid_confirm" }, { status: 400 });
  }

  const requestPayload = payload.payload && typeof payload.payload === "object" ? payload.payload : {};

  const { error: insertError } = await supabase.from("pii_change_requests").insert({
    table_name: tableName,
    row_id: rowId,
    requested_by: data.user.id,
    action,
    payload: requestPayload,
  });

  if (insertError) {
    return NextResponse.json({ ok: false, error: "insert_failed" }, { status: 400 });
  }

  return NextResponse.json({ ok: true });
}

