import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabaseServer";

export const dynamic = "force-dynamic";

export async function POST() {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.auth.getUser();

  if (error || !data?.user) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }

  const user = data.user;
  await supabase.from("profiles").upsert(
    {
      id: user.id,
      role: "user",
      full_name:
        (user.user_metadata?.full_name as string | undefined) ??
        (user.user_metadata?.name as string | undefined) ??
        null,
      phone: user.phone ?? null,
    },
    { onConflict: "id" }
  );

  return NextResponse.json({ ok: true });
}
