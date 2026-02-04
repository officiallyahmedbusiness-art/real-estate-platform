export type FieldHelpEntry = {
  label_ar: string;
  what_ar: string;
  purpose_ar: string;
  idea_ar: string;
  steps_ar: string[];
  example_ar?: string;
  rules_ar?: string[];
};

function makeHelp(
  label: string,
  what: string,
  purpose: string,
  idea: string,
  steps: string[],
  example?: string,
  rules?: string[]
): FieldHelpEntry {
  return {
    label_ar: label,
    what_ar: what,
    purpose_ar: purpose,
    idea_ar: idea,
    steps_ar: steps,
    example_ar: example,
    rules_ar: rules,
  };
}

function textHelp(label: string, purpose: string, example?: string, rules?: string[]) {
  return makeHelp(
    label,
    `هذا الحقل خاص بـ ${label}.`,
    purpose,
    "اكتب وصفًا مختصرًا وواضحًا يساعد الفريق.",
    ["اكتب قيمة واضحة.", "راجع الإملاء.", "تأكد من الصياغة."],
    example,
    rules
  );
}

function numberHelp(label: string, purpose: string, example?: string, rules?: string[]) {
  return makeHelp(
    label,
    `هذا الحقل يطلب رقمًا لـ ${label}.`,
    purpose,
    "استخدم أرقام صحيحة بدون رموز إضافية.",
    ["اكتب رقمًا صحيحًا.", "تأكد من الوحدة.", "لا تتركه فارغًا إن كان مطلوبًا."],
    example,
    rules
  );
}

function selectHelp(label: string, purpose: string, example?: string) {
  return makeHelp(
    label,
    `اختر قيمة مناسبة لـ ${label}.`,
    purpose,
    "اختر من القائمة المتاحة حسب المطلوب.",
    ["اختر قيمة واحدة.", "تأكد أنها الأقرب للواقع.", "يمكن التعديل لاحقًا."],
    example
  );
}

function dateHelp(label: string, purpose: string, example?: string) {
  return makeHelp(
    label,
    `اكتب تاريخ ${label}.`,
    purpose,
    "استخدم تاريخ صحيح بالتقويم الميلادي.",
    ["حدد التاريخ من التقويم.", "تأكد من اليوم والشهر.", "تجنب تركه فارغًا."],
    example
  );
}

function datetimeHelp(label: string, purpose: string, example?: string) {
  return makeHelp(
    label,
    `اكتب تاريخ ووقت ${label}.`,
    purpose,
    "استخدم تاريخ ووقت واضحين.",
    ["حدد اليوم والساعة.", "راجع المنطقة الزمنية.", "احفظ التغييرات."],
    example
  );
}

function phoneHelp(label: string, purpose: string, example?: string) {
  return makeHelp(
    label,
    `اكتب رقم ${label}.`,
    purpose,
    "يفضل رقم موبايل مصري صحيح.",
    ["اكتب الرقم بدون مسافات.", "تأكد من صحة الرقم.", "استخدم صيغة واضحة."],
    example,
    ["مثال: 01000000000"]
  );
}

function emailHelp(label: string, purpose: string, example?: string) {
  return makeHelp(
    label,
    `اكتب بريد ${label}.`,
    purpose,
    "تأكد من كتابة البريد بشكل صحيح.",
    ["يجب أن يحتوي على @.", "لا تضع مسافات.", "راجع الإملاء."],
    example,
    ["مثال: name@example.com"]
  );
}

function urlHelp(label: string, purpose: string, example?: string) {
  return makeHelp(
    label,
    `اكتب رابط ${label}.`,
    purpose,
    "تأكد أن الرابط يعمل ويبدأ بـ https.",
    ["اكتب الرابط كاملًا.", "تأكد من https.", "اختبر الرابط سريعًا."],
    example
  );
}

function fileHelp(label: string, purpose: string, rules?: string[]) {
  return makeHelp(
    label,
    `قم برفع ملف ${label}.`,
    purpose,
    "ارفع ملفًا بصيغة مقبولة.",
    ["تأكد من حجم الملف.", "اختر الصيغة المطلوبة.", "يمكن الاستبدال لاحقًا."],
    undefined,
    rules
  );
}

const FIELD_HELP_KEYS = [
  "account.profile.full_name",
  "account.profile.phone",
  "admin.partners.is_active",
  "admin.partners.logo_url",
  "admin.partners.name_ar",
  "admin.partners.name_en",
  "admin.partners.sort_order",
  "attachments.item.category",
  "attachments.item.note",
  "attachments.item.primary",
  "attachments.item.published",
  "attachments.item.title",
  "attachments.upload.category",
  "attachments.upload.file",
  "attachments.upload.note",
  "attachments.upload.title",
  "auth.email",
  "auth.password",
  "auth.passwordConfirm",
  "careers.apply.cv",
  "careers.apply.email",
  "careers.apply.message",
  "careers.apply.name",
  "careers.apply.phone",
  "careers.apply.role",
  "crm.activities.customer",
  "crm.activities.lead",
  "crm.activities.notes",
  "crm.activities.occurred_at",
  "crm.activities.outcome",
  "crm.activities.type",
  "crm.customers.budget_max",
  "crm.customers.budget_min",
  "crm.customers.email",
  "crm.customers.full_name",
  "crm.customers.intent",
  "crm.customers.lead_source",
  "crm.customers.phone_e164",
  "crm.customers.phone_raw",
  "crm.customers.preferred_areas",
  "crm.customers.search",
  "crm.filter.assigned",
  "crm.filter.lostReason",
  "crm.filter.overdue",
  "crm.filter.source",
  "crm.filter.status",
  "crm.lead.assigned_to",
  "crm.lead.lost_reason",
  "crm.lead.lost_reason_note",
  "crm.lead.next_action_at",
  "crm.lead.next_action_note",
  "crm.lead.note",
  "crm.lead.status",
  "crm.search",
  "crm.sources.name",
  "crm.sources.slug",
  "crm.spend.amount",
  "crm.spend.channel",
  "crm.spend.month",
  "crm.visits.assigned_to",
  "crm.visits.lead",
  "crm.visits.listing",
  "crm.visits.next_followup_at",
  "crm.visits.notes",
  "crm.visits.outcome",
  "crm.visits.scheduled_at",
  "crm.visits.status",
  "developer.ads.asset_type",
  "developer.ads.asset_url",
  "developer.ads.body_ar",
  "developer.ads.body_en",
  "developer.ads.cta_label_ar",
  "developer.ads.cta_label_en",
  "developer.ads.cta_url",
  "developer.ads.poster_url",
  "developer.ads.primary",
  "developer.ads.sort_order",
  "developer.ads.status",
  "developer.ads.title_ar",
  "developer.ads.title_en",
  "developer.leads.note",
  "developer.leads.status",
  "developer.listing.address",
  "developer.listing.amenities",
  "developer.listing.area",
  "developer.listing.baths",
  "developer.listing.beds",
  "developer.listing.city",
  "developer.listing.currency",
  "developer.listing.description",
  "developer.listing.description_ar",
  "developer.listing.description_en",
  "developer.listing.listing_code",
  "developer.listing.price",
  "developer.listing.project_id",
  "developer.listing.purpose",
  "developer.listing.size_m2",
  "developer.listing.status",
  "developer.listing.title",
  "developer.listing.title_ar",
  "developer.listing.title_en",
  "developer.listing.type",
  "developer.listing.unit_code",
  "developer.media.listing_id",
  "developer.media.project_id",
  "developer.media.type",
  "developer.media.url",
  "developer.project.address",
  "developer.project.area",
  "developer.project.city",
  "developer.project.description_ar",
  "developer.project.description_en",
  "developer.project.title_ar",
  "developer.project.title_en",
  "filters.area",
  "filters.baths",
  "filters.beds",
  "filters.city",
  "filters.maxPrice",
  "filters.minPrice",
  "filters.purpose",
  "filters.sort",
  "filters.type",
  "home.callback.email",
  "home.callback.name",
  "home.callback.phone",
  "home.request.area",
  "home.request.budgetMax",
  "home.request.budgetMin",
  "home.request.contactTime",
  "home.request.intent",
  "home.request.name",
  "home.request.notes",
  "home.request.phone",
  "home.search.area",
  "home.search.city",
  "home.search.maxPrice",
  "home.search.minPrice",
  "home.search.purpose",
  "home.search.type",
  "lead.email",
  "lead.message",
  "lead.name",
  "lead.phone",
  "owner.audit.action",
  "owner.audit.actor",
  "owner.audit.entity",
  "owner.audit.from",
  "owner.audit.to",
  "owner.delete.confirm",
  "owner.settings.email",
  "owner.settings.facebook",
  "owner.settings.instagram",
  "owner.settings.linkedin",
  "owner.settings.tiktok",
  "owner.settings.whatsappLink",
  "owner.settings.whatsappNumber",
  "owner.unlock.token",
  "owner.users.invite.email",
  "owner.users.invite.full_name",
  "owner.users.invite.phone",
  "owner.users.invite.role",
  "owner.users.role",
  "staff.filter.status",
  "staff.import.file",
  "staff.import.format",
  "staff.import.notes",
  "staff.listing.ad_channel",
  "staff.listing.address",
  "staff.listing.agent_name",
  "staff.listing.agent_user_id",
  "staff.listing.area",
  "staff.listing.baths",
  "staff.listing.beds",
  "staff.listing.building",
  "staff.listing.city",
  "staff.listing.commission",
  "staff.listing.currency",
  "staff.listing.description",
  "staff.listing.description_ar",
  "staff.listing.description_en",
  "staff.listing.elevator",
  "staff.listing.entrance",
  "staff.listing.finishing",
  "staff.listing.floor",
  "staff.listing.images",
  "staff.listing.intake_date",
  "staff.listing.kitchen",
  "staff.listing.last_owner_contact_at",
  "staff.listing.last_owner_contact_note",
  "staff.listing.listing_code",
  "staff.listing.meters",
  "staff.listing.next_owner_followup_at",
  "staff.listing.notes",
  "staff.listing.owner_name",
  "staff.listing.owner_notes",
  "staff.listing.owner_phone",
  "staff.listing.price",
  "staff.listing.purpose",
  "staff.listing.reception",
  "staff.listing.requested",
  "staff.listing.size_m2",
  "staff.listing.target",
  "staff.listing.title",
  "staff.listing.title_ar",
  "staff.listing.title_en",
  "staff.listing.type",
  "staff.listing.unit_code",
  "staff.listing.unit_status",
  "staff.listing.view",
  "staff.search",
];

const defaultHelpForKey = (key: string): FieldHelpEntry =>
  makeHelp(
    `شرح الحقل: ${key}`,
    "هذا الحقل مخصص لتسجيل بيانات مهمة.",
    "استخدمه لإضافة المعلومات الصحيحة للنظام.",
    "اكتب القيمة بدقة وبشكل مختصر.",
    ["اكتب القيمة المناسبة.", "راجع البيانات قبل الحفظ.", "تأكد من صحتها."],
    "مثال: قيمة توضيحية",
    ["اتركه فارغًا فقط إذا لم يكن مطلوبًا."]
  );

export const FIELD_HELP: Record<string, FieldHelpEntry> = FIELD_HELP_KEYS.reduce(
  (acc, key) => {
    acc[key] = defaultHelpForKey(key);
    return acc;
  },
  {} as Record<string, FieldHelpEntry>
);

export function getFieldHelp(helpKey: string): FieldHelpEntry {
  const entry = FIELD_HELP[helpKey];
  if (!entry && process.env.NODE_ENV !== "production") {
    throw new Error(`Missing field help for key: ${helpKey}`);
  }
  return entry ?? defaultHelpForKey(helpKey);
}

export const fieldHelpFactories = {
  textHelp,
  numberHelp,
  selectHelp,
  dateHelp,
  datetimeHelp,
  phoneHelp,
  emailHelp,
  urlHelp,
  fileHelp,
};
