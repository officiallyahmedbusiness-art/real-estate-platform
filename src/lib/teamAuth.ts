import { redirect } from "next/navigation";
import type { User } from "@supabase/supabase-js";
import { createSupabaseServerClient } from "@/lib/supabaseServer";
import { safeNextPath } from "@/lib/paths";
import type { AppRole, ProfileRow } from "@/lib/auth";
import { getProfile } from "@/lib/auth";

export async function requireTeamRole(
  roles: AppRole | AppRole[],
  nextPath: string
): Promise<{
  user: User;
  profile: ProfileRow | null;
  role: AppRole;
}> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.auth.getUser();

  if (error || !data?.user) {
    const safeNext = safeNextPath(nextPath, "/team");
    redirect(`/team/login?next=${encodeURIComponent(safeNext)}`);
  }

  const profile = await getProfile(data.user.id);
  const allowed = Array.isArray(roles) ? roles : [roles];
  const role = profile?.role as AppRole | undefined;

  if (!role || !allowed.includes(role)) {
    redirect("/dashboard?unauthorized=1");
  }

  return { user: data.user, profile, role };
}
