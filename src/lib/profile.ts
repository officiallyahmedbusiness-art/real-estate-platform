import "server-only";

import { createSupabaseServerClient } from "@/lib/supabaseServer";
import { normalizeEgyptPhone } from "@/lib/phone";

export type ProfileRecord = {
  id: string;
  email: string | null;
  phone: string | null;
  full_name: string | null;
  role: string | null;
};

function clean(value: string) {
  return value.trim();
}

export async function getProfileByEmail(email: string): Promise<ProfileRecord | null> {
  const supabase = await createSupabaseServerClient();
  const normalized = clean(email).toLowerCase();
  const { data } = await supabase
    .from("profiles")
    .select("id, email, phone, full_name, role")
    .ilike("email", normalized)
    .maybeSingle();
  return data ?? null;
}

export async function getProfileByPhone(phone: string): Promise<ProfileRecord | null> {
  const supabase = await createSupabaseServerClient();
  const raw = clean(phone);
  const normalized = normalizeEgyptPhone(raw);
  const orFilter = normalized ? `phone.eq.${raw},phone.eq.${normalized}` : `phone.eq.${raw}`;
  const { data } = await supabase
    .from("profiles")
    .select("id, email, phone, full_name, role")
    .or(orFilter)
    .maybeSingle();
  return data ?? null;
}

export async function getProfileByIdentity(identity: string): Promise<ProfileRecord | null> {
  if (identity.includes("@")) return getProfileByEmail(identity);
  return getProfileByPhone(identity);
}
