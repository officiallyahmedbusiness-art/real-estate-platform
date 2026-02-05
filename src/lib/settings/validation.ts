export type SettingsValidationResult = {
  values: Record<string, string | null>;
  errors: Record<string, string>;
};

const MAX_LEN_SHORT = 200;
const MAX_LEN_TEMPLATE = 1000;

function clean(input: FormDataEntryValue | null) {
  return typeof input === "string" ? input.trim() : "";
}

function emptyToNull(value: string) {
  const trimmed = value.trim();
  return trimmed.length ? trimmed : null;
}

function validateLength(value: string, max: number) {
  return value.length <= max;
}

export function normalizeEgyptPhone(input: string): string | null {
  const raw = input.replace(/[\s()-]/g, "");
  if (!raw) return null;

  let digits = raw;
  if (digits.startsWith("+")) digits = digits.slice(1);
  if (digits.startsWith("0020")) digits = digits.slice(2);
  if (digits.startsWith("0")) digits = `20${digits.slice(1)}`;

  if (!digits.startsWith("20")) return null;
  if (!/^20\d{10}$/.test(digits)) return null;

  return `+${digits}`;
}

function validateEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function validateHttpsUrl(value: string, allowedHosts?: string[]) {
  try {
    const url = new URL(value);
    if (url.protocol !== "https:") return null;
    if (allowedHosts && allowedHosts.length > 0) {
      const matches = allowedHosts.some((host) =>
        url.hostname === host || url.hostname.endsWith(`.${host}`)
      );
      if (!matches) return null;
    }
    return url.toString();
  } catch {
    return null;
  }
}

export function parseSettingsFormData(formData: FormData): SettingsValidationResult {
  const errors: Record<string, string> = {};
  const values: Record<string, string | null> = {};

  const office_address = clean(formData.get("office_address"));
  if (office_address && !validateLength(office_address, MAX_LEN_SHORT)) {
    errors.office_address = "max";
  }
  values.office_address = emptyToNull(office_address);

  const working_hours = clean(formData.get("working_hours"));
  if (working_hours && !validateLength(working_hours, MAX_LEN_SHORT)) {
    errors.working_hours = "max";
  }
  values.working_hours = emptyToNull(working_hours);

  const response_sla = clean(formData.get("response_sla"));
  if (response_sla && !validateLength(response_sla, MAX_LEN_SHORT)) {
    errors.response_sla = "max";
  }
  values.response_sla = emptyToNull(response_sla);

  const logo_url = clean(formData.get("logo_url"));
  if (logo_url) {
    const parsed = validateHttpsUrl(logo_url);
    if (!parsed) {
      errors.logo_url = "url";
      values.logo_url = null;
    } else {
      values.logo_url = parsed;
    }
  } else {
    values.logo_url = null;
  }

  const whatsapp_number_raw = clean(formData.get("whatsapp_number"));
  if (whatsapp_number_raw) {
    const normalized = normalizeEgyptPhone(whatsapp_number_raw);
    if (!normalized) {
      errors.whatsapp_number = "phone";
      values.whatsapp_number = null;
    } else {
      values.whatsapp_number = normalized;
    }
  } else {
    values.whatsapp_number = null;
  }

  const primary_phone_raw = clean(formData.get("primary_phone"));
  if (primary_phone_raw) {
    const normalized = normalizeEgyptPhone(primary_phone_raw);
    if (!normalized) {
      errors.primary_phone = "phone";
      values.primary_phone = null;
    } else {
      values.primary_phone = normalized;
    }
  } else {
    values.primary_phone = null;
  }

  const secondary_phone_raw = clean(formData.get("secondary_phone"));
  if (secondary_phone_raw) {
    const normalized = normalizeEgyptPhone(secondary_phone_raw);
    if (!normalized) {
      errors.secondary_phone = "phone";
      values.secondary_phone = null;
    } else {
      values.secondary_phone = normalized;
    }
  } else {
    values.secondary_phone = null;
  }

  const contact_email = clean(formData.get("contact_email"));
  if (contact_email && !validateEmail(contact_email)) {
    errors.contact_email = "email";
    values.contact_email = null;
  } else {
    values.contact_email = emptyToNull(contact_email);
  }

  const instagram_url = clean(formData.get("instagram_url"));
  if (instagram_url) {
    const parsed = validateHttpsUrl(instagram_url, ["instagram.com"]);
    if (!parsed) errors.instagram_url = "url";
    values.instagram_url = parsed;
  } else {
    values.instagram_url = null;
  }

  const facebook_url = clean(formData.get("facebook_url"));
  if (facebook_url) {
    const parsed = validateHttpsUrl(facebook_url, ["facebook.com", "fb.com"]);
    if (!parsed) errors.facebook_url = "url";
    values.facebook_url = parsed;
  } else {
    values.facebook_url = null;
  }

  const tiktok_url = clean(formData.get("tiktok_url"));
  if (tiktok_url) {
    const parsed = validateHttpsUrl(tiktok_url, ["tiktok.com"]);
    if (!parsed) errors.tiktok_url = "url";
    values.tiktok_url = parsed;
  } else {
    values.tiktok_url = null;
  }

  const youtube_url = clean(formData.get("youtube_url"));
  if (youtube_url) {
    const parsed = validateHttpsUrl(youtube_url, ["youtube.com", "youtu.be"]);
    if (!parsed) errors.youtube_url = "url";
    values.youtube_url = parsed;
  } else {
    values.youtube_url = null;
  }

  const linkedin_url = clean(formData.get("linkedin_url"));
  if (linkedin_url) {
    const parsed = validateHttpsUrl(linkedin_url, ["linkedin.com"]);
    if (!parsed) errors.linkedin_url = "url";
    values.linkedin_url = parsed;
  } else {
    values.linkedin_url = null;
  }

  const whatsapp_message_template = clean(formData.get("whatsapp_message_template"));
  if (whatsapp_message_template && !validateLength(whatsapp_message_template, MAX_LEN_TEMPLATE)) {
    errors.whatsapp_message_template = "max";
  }
  values.whatsapp_message_template = emptyToNull(whatsapp_message_template);

  const whatsapp_message_language = clean(formData.get("whatsapp_message_language"));
  if (whatsapp_message_language && !["ar", "en"].includes(whatsapp_message_language)) {
    errors.whatsapp_message_language = "lang";
  }
  values.whatsapp_message_language = emptyToNull(whatsapp_message_language);

  return { values, errors };
}
