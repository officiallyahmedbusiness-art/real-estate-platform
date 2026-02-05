"use server";

import { headers } from "next/headers";
import { createSupabaseServerClient } from "@/lib/supabaseServer";
import { normalizeEgyptPhone } from "@/lib/phone";
import { checkRateLimit } from "@/lib/rateLimit";
import { parseSupplyDeveloperInput, parseSupplyOwnerInput } from "@/lib/validators";
import { buildWhatsAppLink, buildWhatsAppMessageEncoded, getBrandForLocale } from "@/lib/whatsapp/message";
import { getSiteSettings } from "@/lib/settings";
import { getServerLocale } from "@/lib/i18n.server";
import { createT } from "@/lib/i18n";
import { randomUUID } from "crypto";

const BUCKET = "supply-uploads";
const MAX_FILE_SIZE_MB = 25;
const MAX_FILE_SIZE = MAX_FILE_SIZE_MB * 1024 * 1024;

export type SupplyActionState = {
  ok: boolean;
  error: "rate_limit" | "invalid" | "upload" | "server" | null;
  submitted: boolean;
  requestId?: string | null;
  contactMethod?: string | null;
  whatsappLink?: string | null;
};

function sanitizeFilename(name: string) {
  const normalized = name.replace(/\s+/g, "-").replace(/[^a-zA-Z0-9._-]/g, "");
  const trimmed = normalized.replace(/-+/g, "-").replace(/^[-.]+|[-.]+$/g, "");
  return trimmed || "upload";
}

function guessFileType(file: File) {
  const type = file.type || "";
  if (type.startsWith("image/")) return "image";
  if (type === "application/pdf") return "pdf";
  if (type.startsWith("video/")) return "video";
  return "other";
}

type UploadResult = {
  uploads: Array<{ path: string; url: string | null; type: string; name: string; size: number }>;
  error: "upload" | null;
};

async function uploadSupplyFiles(
  supabase: Awaited<ReturnType<typeof createSupabaseServerClient>>,
  files: File[],
  prefix: string
): Promise<UploadResult> {
  const uploads: Array<{ path: string; url: string | null; type: string; name: string; size: number }> =
    [];

  for (const file of files) {
    if (file.size === 0) continue;
    if (file.size > MAX_FILE_SIZE) {
      return { uploads: [], error: "upload" };
    }

    const safeName = sanitizeFilename(file.name);
    const path = `${prefix}/${Date.now()}-${safeName}`;
    const { error } = await supabase.storage.from(BUCKET).upload(path, file, {
      upsert: false,
      contentType: file.type || "application/octet-stream",
    });
    if (error) {
      return { uploads: [], error: "upload" };
    }

    uploads.push({
      path,
      url: null,
      type: guessFileType(file),
      name: file.name || safeName,
      size: file.size,
    });
  }

  return { uploads, error: null };
}

async function buildSupplyWhatsappLink(requestId: string, contactMethod: string) {
  if (contactMethod !== "whatsapp") return null;
  const settings = await getSiteSettings();
  if (!settings.whatsapp_number) return null;

  const locale = await getServerLocale();
  const t = createT(locale);
  const template = t("supply.whatsapp.template");
  const encoded = buildWhatsAppMessageEncoded(
    { brand: getBrandForLocale(locale), ref: requestId },
    template,
    locale
  );
  return buildWhatsAppLink(settings.whatsapp_number, encoded);
}

async function getRequestMeta() {
  const headerStore = await headers();
  const ip =
    headerStore.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    headerStore.get("x-real-ip") ??
    "unknown";
  const ua = headerStore.get("user-agent") ?? "unknown";
  return { ip, ua };
}

export async function createDeveloperSupplyAction(
  prevState: SupplyActionState,
  formData: FormData
): Promise<SupplyActionState> {
  void prevState;
  const honeypot = String(formData.get("company") ?? "").trim();
  if (honeypot) {
    return { ok: true, error: null, submitted: true };
  }

  const { ip, ua } = await getRequestMeta();
  const rate = checkRateLimit(`supply-dev:${ip}:${ua}`, 6, 60 * 60 * 1000);
  if (!rate.allowed) {
    return { ok: false, error: "rate_limit", submitted: true };
  }

  const payload = {
    company_name: String(formData.get("company_name") ?? ""),
    contact_person_name: String(formData.get("contact_person_name") ?? ""),
    role_title: String(formData.get("role_title") ?? ""),
    phone: String(formData.get("phone") ?? ""),
    email: String(formData.get("email") ?? ""),
    contact_method: String(formData.get("contact_method") ?? ""),
    preferred_time: String(formData.get("preferred_time") ?? ""),
    preferred_day: String(formData.get("preferred_day") ?? ""),
    preferred_contact_notes: String(formData.get("preferred_contact_notes") ?? ""),
    contact_reason: String(formData.get("contact_reason") ?? ""),
    city: String(formData.get("city") ?? ""),
    projects_summary: String(formData.get("projects_summary") ?? ""),
    inventory_type: String(formData.get("inventory_type") ?? ""),
    unit_count_estimate: String(formData.get("unit_count_estimate") ?? ""),
    brochure_url: String(formData.get("brochure_url") ?? ""),
    cooperation_terms_interest: String(formData.get("cooperation_terms_interest") ?? ""),
  };

  const parsed = parseSupplyDeveloperInput(payload);
  if (!parsed) {
    return { ok: false, error: "invalid", submitted: true };
  }

  const normalizedPhone = normalizeEgyptPhone(parsed.phone);
  if (!normalizedPhone) {
    return { ok: false, error: "invalid", submitted: true };
  }

  const supabase = await createSupabaseServerClient();
  const requestId = randomUUID();

  const files = formData
    .getAll("attachments")
    .filter((item): item is File => item instanceof File);
  const { uploads, error: uploadError } = await uploadSupplyFiles(
    supabase,
    files,
    `developer/${requestId}`
  );
  if (uploadError) {
    return { ok: false, error: "upload", submitted: true };
  }

  const { error } = await supabase.from("supply_developer_requests").insert({
    id: requestId,
    company_name: parsed.company_name,
    contact_person_name: parsed.contact_person_name,
    role_title: parsed.role_title,
    phone: parsed.phone,
    email: parsed.email,
    contact_method: parsed.contact_method,
    preferred_time: parsed.preferred_time,
    preferred_day: parsed.preferred_day,
    preferred_contact_notes: parsed.preferred_contact_notes,
    contact_reason: parsed.contact_reason,
    city: parsed.city,
    projects_summary: parsed.projects_summary,
    inventory_type: parsed.inventory_type,
    unit_count_estimate: parsed.unit_count_estimate,
    brochure_url: parsed.brochure_url,
    attachments: uploads.length > 0 ? uploads : null,
    cooperation_terms_interest: parsed.cooperation_terms_interest,
  });

  if (error) {
    return { ok: false, error: "server", submitted: true };
  }

  const whatsappLink = await buildSupplyWhatsappLink(requestId, parsed.contact_method);
  return {
    ok: true,
    error: null,
    submitted: true,
    requestId,
    contactMethod: parsed.contact_method,
    whatsappLink,
  };
}

export async function createOwnerSupplyAction(
  prevState: SupplyActionState,
  formData: FormData
): Promise<SupplyActionState> {
  void prevState;
  const honeypot = String(formData.get("company") ?? "").trim();
  if (honeypot) {
    return { ok: true, error: null, submitted: true };
  }

  const { ip, ua } = await getRequestMeta();
  const rate = checkRateLimit(`supply-owner:${ip}:${ua}`, 6, 60 * 60 * 1000);
  if (!rate.allowed) {
    return { ok: false, error: "rate_limit", submitted: true };
  }

  const payload = {
    owner_type: String(formData.get("owner_type") ?? ""),
    full_name: String(formData.get("full_name") ?? ""),
    phone: String(formData.get("phone") ?? ""),
    email: String(formData.get("email") ?? ""),
    contact_method: String(formData.get("contact_method") ?? ""),
    preferred_time: String(formData.get("preferred_time") ?? ""),
    preferred_day: String(formData.get("preferred_day") ?? ""),
    contact_reason: String(formData.get("contact_reason") ?? ""),
    property_type: String(formData.get("property_type") ?? ""),
    purpose: String(formData.get("purpose") ?? ""),
    area: String(formData.get("area") ?? ""),
    address_notes: String(formData.get("address_notes") ?? ""),
    size_m2: String(formData.get("size_m2") ?? ""),
    rooms: String(formData.get("rooms") ?? ""),
    baths: String(formData.get("baths") ?? ""),
    price_expectation: String(formData.get("price_expectation") ?? ""),
    ready_to_show: String(formData.get("ready_to_show") ?? ""),
    media_link: String(formData.get("media_link") ?? ""),
    notes: String(formData.get("notes") ?? ""),
  };

  const parsed = parseSupplyOwnerInput(payload);
  if (!parsed) {
    return { ok: false, error: "invalid", submitted: true };
  }

  const normalizedPhone = normalizeEgyptPhone(parsed.phone);
  if (!normalizedPhone) {
    return { ok: false, error: "invalid", submitted: true };
  }

  const supabase = await createSupabaseServerClient();
  const requestId = randomUUID();

  const files = formData
    .getAll("photos")
    .filter((item): item is File => item instanceof File);
  const { uploads, error: uploadError } = await uploadSupplyFiles(
    supabase,
    files,
    `owner/${requestId}`
  );
  if (uploadError) {
    return { ok: false, error: "upload", submitted: true };
  }

  const { error } = await supabase.from("supply_owner_requests").insert({
    id: requestId,
    owner_type: parsed.owner_type,
    full_name: parsed.full_name,
    phone: parsed.phone,
    email: parsed.email,
    contact_method: parsed.contact_method,
    preferred_time: parsed.preferred_time,
    preferred_day: parsed.preferred_day,
    contact_reason: parsed.contact_reason,
    property_type: parsed.property_type,
    purpose: parsed.purpose,
    area: parsed.area,
    address_notes: parsed.address_notes,
    size_m2: parsed.size_m2,
    rooms: parsed.rooms,
    baths: parsed.baths,
    price_expectation: parsed.price_expectation,
    ready_to_show: parsed.ready_to_show,
    photos: uploads.length > 0 ? uploads : null,
    media_link: parsed.media_link,
    notes: parsed.notes,
  });

  if (error) {
    return { ok: false, error: "server", submitted: true };
  }

  const whatsappLink = await buildSupplyWhatsappLink(requestId, parsed.contact_method);
  return {
    ok: true,
    error: null,
    submitted: true,
    requestId,
    contactMethod: parsed.contact_method,
    whatsappLink,
  };
}
