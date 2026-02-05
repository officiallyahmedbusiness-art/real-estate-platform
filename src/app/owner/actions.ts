"use server";

import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { isUuid, parseRole } from "@/lib/validators";
import { requireOwnerAccess } from "@/lib/owner";
import { logAudit } from "@/lib/audit";

function clean(value: FormDataEntryValue | null) {
  return typeof value === "string" ? value.trim() : "";
}

export async function unlockOwnerAction(formData: FormData) {
  const nextPath = clean(formData.get("next")) || "/owner/users";
  const tokenInput = clean(formData.get("owner_token"));
  const secret = process.env.OWNER_SECRET ?? "";

  if (!secret || tokenInput !== secret) {
    redirect(`/owner?next=${encodeURIComponent(nextPath)}&error=1`);
  }

  const cookieStore = await cookies();
  cookieStore.set("owner_token", secret, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 6,
  });

  redirect(nextPath);
}

export async function updateOwnerRoleAction(formData: FormData) {
  const nextPath = "/owner/users";
  const { supabase, userId: actorId } = await requireOwnerAccess(nextPath);
  const userId = clean(formData.get("user_id"));
  const role = parseRole(formData.get("role"));
  if (!isUuid(userId) || !role) return;
  if (role === "owner" && userId !== actorId) return;

  await supabase.from("profiles").update({ role }).eq("id", userId);
  const hdrs = await headers();
  await logAudit(supabase, {
    actor_user_id: actorId,
    action: "role_updated",
    entity_type: "profile",
    entity_id: userId,
    metadata: { role },
    ip: hdrs.get("x-forwarded-for"),
    user_agent: hdrs.get("user-agent"),
  });

  revalidatePath(nextPath);
}
