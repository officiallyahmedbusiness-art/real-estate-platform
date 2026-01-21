import { redirect } from "next/navigation";
import type { User } from "@supabase/supabase-js";
import { createSupabaseServerClient } from "@/lib/supabaseServer";
import { safeNextPath } from "@/lib/paths";

export type AppRole = "user" | "developer" | "partner" | "admin";

export type ProfileRow = {
  id: string;
  role: AppRole;
  full_name: string | null;
  phone: string | null;
};

export async function getProfile(userId: string): Promise<ProfileRow | null> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("profiles")
    .select("id, role, full_name, phone")
    .eq("id", userId)
    .maybeSingle();

  if (error || !data) return null;
  return data as ProfileRow;
}

export async function requireAuth(nextPath: string): Promise<{
  user: User;
  profile: ProfileRow | null;
}> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.auth.getUser();

  if (error || !data?.user) {
    const safeNext = safeNextPath(nextPath, "/dashboard");
    redirect(`/auth?next=${encodeURIComponent(safeNext)}`);
  }

  const profile = await getProfile(data.user.id);
  return { user: data.user, profile };
}

export async function requireRole(
  roles: AppRole | AppRole[],
  nextPath: string
): Promise<{
  user: User;
  profile: ProfileRow | null;
  role: AppRole;
}> {
  const { user, profile } = await requireAuth(nextPath);
  const allowed = Array.isArray(roles) ? roles : [roles];
  const role = (profile?.role ?? "user") as AppRole;

  if (!allowed.includes(role)) {
    redirect("/dashboard?unauthorized=1");
  }

  return { user, profile, role };
}
