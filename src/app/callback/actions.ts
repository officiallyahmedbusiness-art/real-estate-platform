"use server";

import { headers } from "next/headers";
import { randomUUID } from "crypto";
import { createSupabaseServerClient } from "@/lib/supabaseServer";
import { normalizeEgyptPhone } from "@/lib/phone";
import { checkRateLimit } from "@/lib/rateLimit";
import { buildWhatsAppLink, buildWhatsAppMessageEncoded, getBrandForLocale } from "@/lib/whatsapp/message";
import { getServerLocale } from "@/lib/i18n.server";
import { createT } from "@/lib/i18n";
import { getSiteSettings } from "@/lib/settings";

const contactMethodSet = new Set(["whatsapp", "call", "email"]);
const contactTimeSet = new Set(["morning", "afternoon", "evening", "any"]);
const garbageRegex = /\?{3,}/;

export type CallbackActionState = {
  ok: boolean;
  error: "rate_limit" | "invalid" | "server" | null;
  submitted: boolean;
  requestId?: string | null;
  whatsappLink?: string | null;
};

async function getRequestMeta() {
  const headerStore = await headers();
  const ip =
    headerStore.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    headerStore.get("x-real-ip") ??
    "unknown";
  const ua = headerStore.get("user-agent") ?? "unknown";
  return { ip, ua };
}

function hasGarbage(value: string) {
  return garbageRegex.test(value) || value.includes("ï¿½");
}

export async function createCallbackAction(
  prevState: CallbackActionState,
  formData: FormData
): Promise<CallbackActionState> {
  void prevState;
  const honeypot = String(formData.get("company") ?? "").trim();
  if (honeypot) {
    return { ok: true, error: null, submitted: true };
  }

  const { ip, ua } = await getRequestMeta();
  const rate = checkRateLimit(`callback:${ip}:${ua}`, 8, 60 * 60 * 1000);
  if (!rate.allowed) {
    return { ok: false, error: "rate_limit", submitted: true };
  }

  const name = String(formData.get("name") ?? "").trim();
  const phone = String(formData.get("phone") ?? "").trim();
  const contact_method = String(formData.get("contact_method") ?? "").trim();
  const preferred_time = String(formData.get("preferred_time") ?? "").trim();
  const preferred_day = String(formData.get("preferred_day") ?? "").trim();
  const reason = String(formData.get("reason") ?? "").trim();

  const fields = [name, phone, contact_method, preferred_time, preferred_day, reason];
  if (fields.some((value) => hasGarbage(value))) {
    return { ok: false, error: "invalid", submitted: true };
  }

  if (name.length < 2 || name.length > 80) return { ok: false, error: "invalid", submitted: true };
  if (phone.length < 7 || phone.length > 30) return { ok: false, error: "invalid", submitted: true };
  if (!contactMethodSet.has(contact_method)) return { ok: false, error: "invalid", submitted: true };
  if (!contactTimeSet.has(preferred_time)) return { ok: false, error: "invalid", submitted: true };
  if (preferred_day.length > 60) return { ok: false, error: "invalid", submitted: true };
  if (reason.length > 400) return { ok: false, error: "invalid", submitted: true };

  const normalizedPhone = normalizeEgyptPhone(phone);
  if (!normalizedPhone) return { ok: false, error: "invalid", submitted: true };

  const requestId = randomUUID();
  const notesParts = [
    `contact_method=${contact_method}`,
    preferred_day ? `preferred_day=${preferred_day}` : null,
  ].filter(Boolean);

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.from("leads").insert({
    id: requestId,
    listing_id: null,
    user_id: null,
    name,
    phone,
    phone_normalized: normalizedPhone,
    phone_e164: normalizedPhone,
    email: null,
    message: reason || null,
    preferred_contact_time: preferred_time,
    notes: notesParts.length > 0 ? notesParts.join(" | ") : null,
    source: "callback",
    lead_source: "callback",
    status: "new",
  });

  if (error) {
    return { ok: false, error: "server", submitted: true };
  }

  let whatsappLink: string | null = null;
  if (contact_method === "whatsapp") {
    const settings = await getSiteSettings();
    if (settings.whatsapp_number) {
      const locale = await getServerLocale();
      const t = createT(locale);
      const template = t("callback.whatsapp.template");
      const encoded = buildWhatsAppMessageEncoded(
        { brand: getBrandForLocale(locale), ref: requestId },
        template,
        locale
      );
      whatsappLink = buildWhatsAppLink(settings.whatsapp_number, encoded);
    }
  }

  return { ok: true, error: null, submitted: true, requestId, whatsappLink };
}
