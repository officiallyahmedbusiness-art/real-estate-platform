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
  "closed",
  "archived",
  "test",
  "viewing_scheduled",
]);
const intentSet = new Set(["buy", "rent", "invest"]);
const unitStatusSet = new Set(["available", "reserved", "sold", "rented", "off_market", "on_hold"]);
const contactMethodSet = new Set(["whatsapp", "call", "email"]);
const contactTimeSet = new Set(["morning", "afternoon", "evening", "any"]);
const supplyDeveloperInventorySet = new Set(["مشروع كامل", "وحدات متفرقة", "مرحلة"]);
const supplyOwnerTypeSet = new Set(["مالك", "وسيط", "مفوّض"]);
const supplyOwnerPurposeSet = new Set(["بيع", "إيجار"]);
const garbageRegex = /\?{3,}/;

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

export type SupplyDeveloperInput = {
  company_name: string;
  contact_person_name: string;
  role_title?: string;
  phone: string;
  email?: string;
  contact_method: string;
  preferred_time: string;
  preferred_day?: string;
  preferred_contact_notes?: string;
  contact_reason?: string;
  city?: string;
  projects_summary: string;
  inventory_type: string;
  unit_count_estimate?: string;
  brochure_url?: string;
  cooperation_terms_interest?: string;
};

export type SupplyOwnerInput = {
  owner_type: string;
  full_name: string;
  phone: string;
  email?: string;
  contact_method: string;
  preferred_time: string;
  preferred_day?: string;
  contact_reason?: string;
  property_type: string;
  purpose: string;
  area: string;
  address_notes?: string;
  size_m2?: string;
  rooms?: string;
  baths?: string;
  price_expectation?: string;
  ready_to_show?: string;
  media_link?: string;
  notes?: string;
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

function hasGarbage(value: string) {
  return garbageRegex.test(value) || value.includes("ï¿½");
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

  if (hasGarbage(name)) return null;
  if (hasGarbage(phone)) return null;
  if (hasGarbage(email)) return null;
  if (hasGarbage(intent)) return null;
  if (hasGarbage(preferred_area)) return null;
  if (hasGarbage(preferred_contact_time)) return null;
  if (hasGarbage(notes)) return null;
  if (hasGarbage(source)) return null;

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

export function parseSupplyDeveloperInput(input: SupplyDeveloperInput) {
  const company_name = clean(input.company_name);
  const contact_person_name = clean(input.contact_person_name);
  const role_title = clean(input.role_title ?? "");
  const phone = clean(input.phone);
  const email = clean(input.email ?? "");
  const contact_method = clean(input.contact_method);
  const preferred_time = clean(input.preferred_time);
  const preferred_day = clean(input.preferred_day ?? "");
  const preferred_contact_notes = clean(input.preferred_contact_notes ?? "");
  const contact_reason = clean(input.contact_reason ?? "");
  const city = clean(input.city ?? "");
  const projects_summary = clean(input.projects_summary);
  const inventory_type = clean(input.inventory_type);
  const brochure_url = clean(input.brochure_url ?? "");
  const cooperation_terms_interest = clean(input.cooperation_terms_interest ?? "");

  const unit_count_estimate = toNumber(input.unit_count_estimate);

  const fields = [
    company_name,
    contact_person_name,
    role_title,
    phone,
    email,
    contact_method,
    preferred_time,
    preferred_day,
    preferred_contact_notes,
    contact_reason,
    city,
    projects_summary,
    inventory_type,
    brochure_url,
    cooperation_terms_interest,
  ];
  if (fields.some((value) => hasGarbage(value))) return null;

  if (company_name.length < 2 || company_name.length > 120) return null;
  if (contact_person_name.length < 2 || contact_person_name.length > 80) return null;
  if (role_title.length > 80) return null;
  if (phone.length < 7 || phone.length > 30) return null;
  if (email && !email.includes("@")) return null;
  if (!contactMethodSet.has(contact_method)) return null;
  if (!contactTimeSet.has(preferred_time)) return null;
  if (preferred_day.length > 60) return null;
  if (preferred_contact_notes.length > 200) return null;
  if (contact_reason.length > 400) return null;
  if (city.length > 80) return null;
  if (projects_summary.length < 10 || projects_summary.length > 2000) return null;
  if (!supplyDeveloperInventorySet.has(inventory_type)) return null;
  if (unit_count_estimate !== null && unit_count_estimate < 0) return null;
  if (brochure_url.length > 300) return null;
  if (cooperation_terms_interest.length > 500) return null;

  return {
    company_name,
    contact_person_name,
    role_title: role_title || null,
    phone,
    email: email || null,
    contact_method,
    preferred_time,
    preferred_day: preferred_day || null,
    preferred_contact_notes: preferred_contact_notes || null,
    contact_reason: contact_reason || null,
    city: city || null,
    projects_summary,
    inventory_type,
    unit_count_estimate,
    brochure_url: brochure_url || null,
    cooperation_terms_interest: cooperation_terms_interest || null,
  };
}

export function parseSupplyOwnerInput(input: SupplyOwnerInput) {
  const owner_type = clean(input.owner_type);
  const full_name = clean(input.full_name);
  const phone = clean(input.phone);
  const email = clean(input.email ?? "");
  const contact_method = clean(input.contact_method);
  const preferred_time = clean(input.preferred_time);
  const preferred_day = clean(input.preferred_day ?? "");
  const contact_reason = clean(input.contact_reason ?? "");
  const property_type = clean(input.property_type);
  const purpose = clean(input.purpose);
  const area = clean(input.area);
  const address_notes = clean(input.address_notes ?? "");
  const media_link = clean(input.media_link ?? "");
  const notes = clean(input.notes ?? "");

  const size_m2 = toNumber(input.size_m2);
  const rooms = toNumber(input.rooms);
  const baths = toNumber(input.baths);
  const price_expectation = toNumber(input.price_expectation);

  const fields = [
    owner_type,
    full_name,
    phone,
    email,
    contact_method,
    preferred_time,
    preferred_day,
    contact_reason,
    property_type,
    purpose,
    area,
    address_notes,
    media_link,
    notes,
  ];
  if (fields.some((value) => hasGarbage(value))) return null;

  if (!supplyOwnerTypeSet.has(owner_type)) return null;
  if (full_name.length < 2 || full_name.length > 80) return null;
  if (phone.length < 7 || phone.length > 30) return null;
  if (email && !email.includes("@")) return null;
  if (!contactMethodSet.has(contact_method)) return null;
  if (!contactTimeSet.has(preferred_time)) return null;
  if (preferred_day.length > 60) return null;
  if (contact_reason.length > 400) return null;
  if (property_type.length < 2 || property_type.length > 60) return null;
  if (!supplyOwnerPurposeSet.has(purpose)) return null;
  if (area.length < 2 || area.length > 120) return null;
  if (address_notes.length > 200) return null;
  if (media_link.length > 300) return null;
  if (notes.length > 800) return null;
  if (size_m2 !== null && size_m2 < 0) return null;
  if (rooms !== null && rooms < 0) return null;
  if (baths !== null && baths < 0) return null;
  if (price_expectation !== null && price_expectation < 0) return null;

  return {
    owner_type,
    full_name,
    phone,
    email: email || null,
    contact_method,
    preferred_time,
    preferred_day: preferred_day || null,
    contact_reason: contact_reason || null,
    property_type,
    purpose,
    area,
    address_notes: address_notes || null,
    size_m2,
    rooms,
    baths,
    price_expectation,
    ready_to_show: input.ready_to_show === "yes" ? true : input.ready_to_show === "no" ? false : null,
    media_link: media_link || null,
    notes: notes || null,
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
        | "closed"
        | "archived"
        | "test"
        | "viewing_scheduled")
    : null;
}

export function parseUnitStatus(input: unknown) {
  const status = clean(input);
  return unitStatusSet.has(status)
    ? (status as "available" | "sold" | "rented" | "on_hold")
    : null;
}
