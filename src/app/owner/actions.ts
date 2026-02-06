"use server";

import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { isUuid, parseRole } from "@/lib/validators";
import { requireOwnerAccess } from "@/lib/owner";
import { logAudit } from "@/lib/audit";

const OWNER_ATTEMPT_COOKIE = "owner_unlock_attempts";
const OWNER_ATTEMPT_WINDOW_MS = 10 * 60 * 1000;
const OWNER_ATTEMPT_MAX = 5;

function clean(value: FormDataEntryValue | null) {
  return typeof value === "string" ? value.trim() : "";
}

type AttemptState = { count: number; first: number; last: number };

function decodeAttempts(raw: string | undefined): AttemptState | null {
  if (!raw) return null;
  try {
    const json = Buffer.from(raw, "base64").toString("utf8");
    const parsed = JSON.parse(json) as AttemptState;
    if (!parsed || typeof parsed.count !== "number" || typeof parsed.first !== "number") {
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

function encodeAttempts(state: AttemptState) {
  return Buffer.from(JSON.stringify(state), "utf8").toString("base64");
}

export async function unlockOwnerAction(formData: FormData) {
  const nextPath = clean(formData.get("next")) || "/owner/users";
  const tokenInput = clean(formData.get("owner_token"));
  const secret = (process.env.OWNER_SECRET ?? "").trim();
  const now = Date.now();
  const cookieStore = await cookies();

  if (!secret) {
    redirect(`/owner?next=${encodeURIComponent(nextPath)}&error=missing`);
  }

  const current = decodeAttempts(cookieStore.get(OWNER_ATTEMPT_COOKIE)?.value ?? undefined);
  const inWindow = current && now - current.first <= OWNER_ATTEMPT_WINDOW_MS;
  const attemptState: AttemptState = inWindow
    ? { count: current.count, first: current.first, last: current.last }
    : { count: 0, first: now, last: now };

  if (inWindow && attemptState.count >= OWNER_ATTEMPT_MAX) {
    redirect(`/owner?next=${encodeURIComponent(nextPath)}&error=rate`);
  }

  if (!secret || tokenInput !== secret) {
    const nextState: AttemptState = {
      count: attemptState.count + 1,
      first: attemptState.first,
      last: now,
    };
    cookieStore.set(OWNER_ATTEMPT_COOKIE, encodeAttempts(nextState), {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: Math.ceil(OWNER_ATTEMPT_WINDOW_MS / 1000),
    });
    redirect(`/owner?next=${encodeURIComponent(nextPath)}&error=1`);
  }

  cookieStore.delete(OWNER_ATTEMPT_COOKIE);
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
