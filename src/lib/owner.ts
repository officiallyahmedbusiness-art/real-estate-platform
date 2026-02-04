import { cookies } from "next/headers";
import { redirect, notFound } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabaseServer";
import { safeNextPath } from "@/lib/paths";

export async function requireOwnerAccess(nextPath: string) {
  const secret = process.env.OWNER_SECRET ?? "";
  if (!secret) notFound();

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.auth.getUser();

  if (error || !data?.user) {
    const safeNext = safeNextPath(nextPath, "/owner");
    redirect(`/auth?next=${encodeURIComponent(safeNext)}`);
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", data.user.id)
    .maybeSingle();

  if (profile?.role !== "owner") {
    redirect("/dashboard?unauthorized=1");
  }

  const cookieStore = await cookies();
  const token = cookieStore.get("owner_token")?.value ?? "";
  if (token !== secret) {
    redirect(`/owner?next=${encodeURIComponent(nextPath)}&unlock=1`);
  }

  return { supabase, userId: data.user.id };
}

export async function requireManageUsersAccess(nextPath: string) {
  const { supabase, userId } = await requireOwnerAccess(nextPath);
  return { supabase, userId, role: "owner" };
}
