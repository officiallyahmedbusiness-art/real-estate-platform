const uuidRegex =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const purposeSet = new Set(["sale", "rent", "new-development"]);
const statusSet = new Set(["draft", "published", "archived"]);
const submissionStatusSet = new Set([
  "draft",
  "submitted",
  "under_review",
  "needs_changes",
  "approved",
  "published",
  "archived",
]);
const roleSet = new Set(["owner", "admin", "ops", "staff", "agent", "developer"]);
const leadStatusSet = new Set([
  "new",
  "contacted",
  "qualified",
  "meeting_set",
  "follow_up",
  "viewing",
  "negotiation",
  "won",
  "lost",
  "viewing_scheduled",
]);
const intentSet = new Set(["buy", "rent", "invest"]);
const unitStatusSet = new Set(["available", "reserved", "sold", "rented", "off_market", "on_hold"]);

export type LeadInput = {
  listingId: string;
  name: string;
  phone?: string;
  email?: string;
  message?: string;
  source?: string;
};

export type PublicLeadInput = {
  name: string;
  phone: string;
  email?: string;
  intent: string;
  preferred_area?: string;
  budget_min?: string;
  budget_max?: string;
  preferred_contact_time?: string;
  notes?: string;
  source?: string;
};

export type ListingInput = {
  title: string;
  title_ar: string | null;
  title_en: string | null;
  type: string;
  purpose: "sale" | "rent" | "new-development";
  price: number;
  currency: string;
  city: string;
  area: string | null;
  address: string | null;
  beds: number;
  baths: number;
  size_m2: number | null;
  description: string | null;
  description_ar: string | null;
  description_en: string | null;
  amenities: string[];
  status: "draft" | "published" | "archived";
};

export type ProfileInput = {
  full_name: string;
  phone: string | null;
};

export type DeveloperInput = {
  name: string;
};

export type ProjectInput = {
  title_ar: string | null;
  title_en: string | null;
  description_ar: string | null;
  description_en: string | null;
  city: string;
  area: string | null;
  address: string | null;
};

export type MemberInput = {
  developer_id: string;
  user_id: string;
  role: string | null;
};

export function isUuid(value: string) {
  return uuidRegex.test(value);
}

function clean(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function toNumber(value: unknown) {
  const num = typeof value === "string" && value.trim() === "" ? NaN : Number(value);
  return Number.isFinite(num) ? num : null;
}

export function parseLeadInput(input: LeadInput) {
  const listingId = clean(input.listingId);
  if (!isUuid(listingId)) return null;

  const name = clean(input.name);
  if (name.length < 2 || name.length > 80) return null;

  const phone = clean(input.phone ?? "");
  const email = clean(input.email ?? "");
  const message = clean(input.message ?? "");
  const source = clean(input.source ?? "");

  if (phone && (phone.length < 7 || phone.length > 30)) return null;
  if (email && !email.includes("@")) return null;
  if (message.length > 500) return null;
  if (source.length > 40) return null;

  return {
    listingId,
    name,
    phone: phone || null,
    email: email || null,
    message: message || null,
    source: source || "web",
  };
}

export function parsePublicLeadInput(input: PublicLeadInput) {
  const name = clean(input.name);
  const phone = clean(input.phone);
  const email = clean(input.email ?? "");
  const intent = clean(input.intent);
  const preferred_area = clean(input.preferred_area ?? "");
  const preferred_contact_time = clean(input.preferred_contact_time ?? "");
  const notes = clean(input.notes ?? "");
  const source = clean(input.source ?? "");

  const budget_min = toNumber(input.budget_min);
  const budget_max = toNumber(input.budget_max);

  if (name.length < 2 || name.length > 80) return null;
  if (phone.length < 7 || phone.length > 30) return null;
  if (!intentSet.has(intent)) return null;
  if (email && !email.includes("@")) return null;
  if (preferred_area.length > 120) return null;
  if (preferred_contact_time.length > 60) return null;
  if (notes.length > 500) return null;
  if (source.length > 40) return null;
  if (budget_min !== null && budget_min < 0) return null;
  if (budget_max !== null && budget_max < 0) return null;
  if (budget_min !== null && budget_max !== null && budget_min > budget_max) return null;

  return {
    name,
    phone,
    email: email || null,
    intent,
    preferred_area: preferred_area || null,
    budget_min,
    budget_max,
    preferred_contact_time: preferred_contact_time || null,
    notes: notes || null,
    source: source || "web",
  };
}

export function parseListingInput(input: Record<string, unknown>): ListingInput | null {
  const title = clean(input.title);
  const title_ar = clean(input.title_ar);
  const title_en = clean(input.title_en);
  const type = clean(input.type);
  const purpose = clean(input.purpose);
  const currency = clean(input.currency) || "EGP";
  const city = clean(input.city);
  const area = clean(input.area);
  const address = clean(input.address);
  const description = clean(input.description);
  const description_ar = clean(input.description_ar);
  const description_en = clean(input.description_en);
  const amenitiesRaw = clean(input.amenities);
  const status = clean(input.status) || "draft";

  const price = toNumber(input.price);
  const beds = toNumber(input.beds) ?? 0;
  const baths = toNumber(input.baths) ?? 0;
  const size_m2 = toNumber(input.size_m2);

  if (!title || title.length < 5 || title.length > 120) return null;
  if (title_ar && (title_ar.length < 5 || title_ar.length > 120)) return null;
  if (title_en && (title_en.length < 5 || title_en.length > 120)) return null;
  if (!type || type.length < 2 || type.length > 40) return null;
  if (!purposeSet.has(purpose)) return null;
  if (!city || city.length < 2 || city.length > 60) return null;
  if (!price || price <= 0) return null;
  if (!statusSet.has(status)) return null;
  if (description_ar && description_ar.length > 2000) return null;
  if (description_en && description_en.length > 2000) return null;

  const amenities = amenitiesRaw
    ? amenitiesRaw.split(",").map((item) => item.trim()).filter(Boolean)
    : [];

  return {
    title,
    title_ar: title_ar || null,
    title_en: title_en || null,
    type,
    purpose: purpose as ListingInput["purpose"],
    price,
    currency,
    city,
    area: area || null,
    address: address || null,
    beds: Math.max(0, Math.min(20, beds ?? 0)),
    baths: Math.max(0, Math.min(20, baths ?? 0)),
    size_m2: size_m2 && size_m2 > 0 ? size_m2 : null,
    description: description || null,
    description_ar: description_ar || null,
    description_en: description_en || null,
    amenities,
    status: status as ListingInput["status"],
  };
}

export function parseProfileInput(input: Record<string, unknown>): ProfileInput | null {
  const full_name = clean(input.full_name);
  const phone = clean(input.phone);
  if (!full_name || full_name.length < 2 || full_name.length > 80) return null;
  if (phone && (phone.length < 7 || phone.length > 30)) return null;
  return { full_name, phone: phone || null };
}

export function parseDeveloperInput(input: Record<string, unknown>): DeveloperInput | null {
  const name = clean(input.name);
  if (!name || name.length < 2 || name.length > 120) return null;
  return { name };
}

export function parseProjectInput(input: Record<string, unknown>): ProjectInput | null {
  const title_ar = clean(input.title_ar);
  const title_en = clean(input.title_en);
  const description_ar = clean(input.description_ar);
  const description_en = clean(input.description_en);
  const city = clean(input.city);
  const area = clean(input.area);
  const address = clean(input.address);

  if (!title_ar && !title_en) return null;
  if (title_ar && (title_ar.length < 4 || title_ar.length > 140)) return null;
  if (title_en && (title_en.length < 4 || title_en.length > 140)) return null;
  if (description_ar && description_ar.length > 4000) return null;
  if (description_en && description_en.length > 4000) return null;
  if (!city || city.length < 2 || city.length > 80) return null;

  return {
    title_ar: title_ar || null,
    title_en: title_en || null,
    description_ar: description_ar || null,
    description_en: description_en || null,
    city,
    area: area || null,
    address: address || null,
  };
}

export function parseMemberInput(input: Record<string, unknown>): MemberInput | null {
  const developer_id = clean(input.developer_id);
  const user_id = clean(input.user_id);
  const role = clean(input.role);
  if (!isUuid(developer_id) || !isUuid(user_id)) return null;
  if (role && role.length > 40) return null;
  return { developer_id, user_id, role: role || null };
}

export function parseRole(input: unknown) {
  const role = clean(input);
  return roleSet.has(role)
    ? (role as "owner" | "admin" | "ops" | "staff" | "agent" | "developer")
    : null;
}

export function parseSubmissionStatus(input: unknown) {
  const status = clean(input);
  return submissionStatusSet.has(status)
    ? (status as
        | "draft"
        | "submitted"
        | "under_review"
        | "needs_changes"
        | "approved"
        | "published"
        | "archived")
    : null;
}

export function parseLeadStatus(input: unknown) {
  const status = clean(input);
  return leadStatusSet.has(status)
    ? (status as
        | "new"
        | "contacted"
        | "qualified"
        | "meeting_set"
        | "follow_up"
        | "viewing"
        | "negotiation"
        | "won"
        | "lost"
        | "viewing_scheduled")
    : null;
}

export function parseUnitStatus(input: unknown) {
  const status = clean(input);
  return unitStatusSet.has(status)
    ? (status as "available" | "sold" | "rented" | "on_hold")
    : null;
}
