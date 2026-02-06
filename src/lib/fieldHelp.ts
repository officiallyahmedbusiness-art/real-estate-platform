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
    `ده حقل ${label}.`,
    purpose,
    "فكرته إننا نسجل المعلومة بشكل واضح يساعد الفريق.",
    ["اكتب المعلومة بوضوح.", "راجع الإملاء.", "اتأكد إنها مناسبة للسياق."],
    example,
    rules
  );
}

function numberHelp(label: string, purpose: string, example?: string, rules?: string[]) {
  return makeHelp(
    label,
    `ده حقل رقمي لـ ${label}.`,
    purpose,
    "الرقم لازم يكون دقيق عشان الحسابات والفرز.",
    ["اكتب رقم صحيح.", "اتأكد من الوحدة.", "سيبه فاضي لو مش مطلوب."],
    example,
    rules
  );
}

function selectHelp(label: string, purpose: string, example?: string) {
  return makeHelp(
    label,
    `اختار القيمة المناسبة لـ ${label}.`,
    purpose,
    "الاختيارات الموحدة بتسهل التقارير والمتابعة.",
    ["اختار من القائمة.", "لو مش متأكد اختار الأقرب.", "تقدر تعدل لاحقًا."],
    example
  );
}

function dateHelp(label: string, purpose: string, example?: string) {
  return makeHelp(
    label,
    `حدد تاريخ ${label}.`,
    purpose,
    "التاريخ بيساعدنا ننظم المتابعة.",
    ["اختار اليوم والشهر والسنة.", "اتأكد من التاريخ الصحيح.", "سيبه فاضي لو مش مطلوب."],
    example
  );
}

function datetimeHelp(label: string, purpose: string, example?: string) {
  return makeHelp(
    label,
    `حدد تاريخ ووقت ${label}.`,
    purpose,
    "التوقيت بيساعد في التنظيم والمتابعة.",
    ["اختار اليوم والوقت.", "اتأكد من المنطقة الزمنية.", "راجع الموعد قبل الحفظ."],
    example
  );
}

function phoneHelp(label: string, purpose: string, example?: string) {
  return makeHelp(
    label,
    `اكتب رقم ${label}.`,
    purpose,
    "بنستخدمه للتواصل السريع.",
    ["اكتب الرقم بدون مسافات.", "اتأكد من صحته.", "استخدم صيغة واضحة."],
    example,
    ["مثال: 01000000000"]
  );
}

function emailHelp(label: string, purpose: string, example?: string) {
  return makeHelp(
    label,
    `اكتب بريد ${label}.`,
    purpose,
    "بنستخدمه للتواصل وإرسال الروابط.",
    ["لازم يحتوي على @.", "بدون مسافات.", "راجع الإملاء."],
    example,
    ["مثال: name@example.com"]
  );
}

function urlHelp(label: string, purpose: string, example?: string) {
  return makeHelp(
    label,
    `اكتب رابط ${label}.`,
    purpose,
    "الرابط الصحيح يضمن فتح الصفحة بسهولة.",
    ["اكتب الرابط كامل.", "يفضل يبدأ بـ https://.", "اختبره سريعًا."],
    example
  );
}

function fileHelp(label: string, purpose: string, rules?: string[]) {
  return makeHelp(
    label,
    `ارفع ملف ${label}.`,
    purpose,
    "الملف بيساعدنا نكمل البيانات أو نعرضها.",
    ["اتأكد من حجم الملف.", "اختار الصيغة المطلوبة.", "تقدر تستبدله لاحقًا."],
    undefined,
    rules
  );
}

function toggleHelp(label: string, purpose: string) {
  return makeHelp(
    label,
    `اختيار تشغيل/إيقاف لـ ${label}.`,
    purpose,
    "بيحدد حالة واضحة بسرعة.",
    ["فعّله لو ينطبق.", "سيبه مقفول لو مش مطلوب.", "تقدر تعدل لاحقًا."]
  );
}

const FIELD_HELP_KEYS = [
  "account.profile.full_name",
  "account.profile.phone",
  "admin.approvals.status",
  "admin.pii.reject.reason",
  "admin.ads.body_ar",
  "admin.ads.body_en",
  "admin.ads.cta_label_ar",
  "admin.ads.cta_label_en",
  "admin.ads.cta_url",
  "admin.ads.status",
  "admin.ads.title_ar",
  "admin.ads.title_en",
  "admin.homepage.media.is_published",
  "admin.homepage.media.poster",
  "admin.homepage.media.sort_order",
  "admin.homepage.media.title",
  "admin.homepage.media.type",
  "admin.homepage.media.url",
  "admin.homepage.metrics.is_published",
  "admin.homepage.metrics.label_ar",
  "admin.homepage.metrics.label_en",
  "admin.homepage.metrics.sort_order",
  "admin.homepage.metrics.value",
  "admin.homepage.projects.cta_url",
  "admin.homepage.projects.currency",
  "admin.homepage.projects.image_url",
  "admin.homepage.projects.is_published",
  "admin.homepage.projects.location_ar",
  "admin.homepage.projects.location_en",
  "admin.homepage.projects.sort_order",
  "admin.homepage.projects.starting_price",
  "admin.homepage.projects.title_ar",
  "admin.homepage.projects.title_en",
  "admin.partners.developer_id",
  "admin.partners.is_active",
  "admin.partners.logo_url",
  "admin.partners.name",
  "admin.partners.name_ar",
  "admin.partners.name_en",
  "admin.partners.role",
  "admin.partners.sort_order",
  "admin.partners.user_id",
  "admin.review.note",
  "admin.review.submission_status",
  "admin.settings.office_address",
  "admin.settings.working_hours",
  "admin.settings.response_sla",
  "admin.settings.logo",
  "admin.settings.whatsapp_number",
  "admin.settings.primary_phone",
  "admin.settings.secondary_phone",
  "admin.settings.contact_email",
  "admin.settings.instagram_url",
  "admin.settings.facebook_url",
  "admin.settings.tiktok_url",
  "admin.settings.youtube_url",
  "admin.settings.linkedin_url",
  "admin.settings.whatsapp_message_template",
  "admin.settings.whatsapp_message_language",
  "admin.users.role",
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
  "team.activate.code",
  "careers.admin.status",
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
  "developer.project.project_code",
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
  "filters.transaction",
  "filters.priceMin",
  "filters.priceMax",
  "filters.areaMin",
  "filters.areaMax",
  "filters.amenities",
  "home.hero.search.transaction",
  "home.hero.search.area",
  "home.hero.search.budget",
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

const LABEL_PLACEHOLDER = "{{label}}";

const defaultHelpForKey = (key: string): FieldHelpEntry => {
  void key;
  return makeHelp(
    LABEL_PLACEHOLDER,
    "\u062f\u0647 \u062d\u0642\u0644 \u0644\u062a\u0633\u062c\u064a\u0644 \u0628\u064a\u0627\u0646\u0627\u062a \u0645\u0647\u0645\u0629.",
    "\u0627\u0643\u062a\u0628 \u0627\u0644\u0645\u0639\u0644\u0648\u0645\u0629 \u0628\u0634\u0643\u0644 \u0648\u0627\u0636\u062d \u0639\u0634\u0627\u0646 \u0627\u0644\u0646\u0638\u0627\u0645 \u064a\u0634\u062a\u063a\u0644 \u0635\u062d.",
    "\u0627\u0644\u0641\u0643\u0631\u0629 \u0625\u0646\u0646\u0627 \u0646\u062c\u0645\u0639 \u0628\u064a\u0627\u0646\u0627\u062a \u062f\u0642\u064a\u0642\u0629 \u0648\u0645\u0641\u0647\u0648\u0645\u0629.",
    ["\u0627\u0643\u062a\u0628 \u0627\u0644\u0642\u064a\u0645\u0629 \u0628\u0648\u0636\u0648\u062d.", "\u0631\u0627\u062c\u0639 \u0627\u0644\u0628\u064a\u0627\u0646\u0627\u062a \u0642\u0628\u0644 \u0627\u0644\u062d\u0641\u0638.", "\u0627\u062a\u0623\u0643\u062f \u0625\u0646\u0647\u0627 \u0635\u062d\u064a\u062d\u0629."],
    "\u0645\u062b\u0627\u0644: \u0642\u064a\u0645\u0629 \u062a\u0648\u0636\u064a\u062d\u064a\u0629",
    ["\u0627\u062a\u0631\u0643\u0647 \u0641\u0627\u0636\u064a \u0644\u0648 \u0645\u0634 \u0645\u0637\u0644\u0648\u0628."]
  );
};

const PURPOSE_BY_PREFIX: Record<string, string> = {
  "account.profile": "\u062a\u062c\u0647\u064a\u0632 \u0628\u064a\u0627\u0646\u0627\u062a \u0627\u0644\u062d\u0633\u0627\u0628 \u0644\u0644\u062a\u0648\u0627\u0635\u0644.",
  "admin.approvals": "\u062a\u062d\u062f\u064a\u062f \u062d\u0627\u0644\u0629 \u0627\u0644\u0646\u0634\u0631 \u0644\u0644\u0648\u062d\u062f\u0627\u062a.",
  "admin.pii": "\u0645\u0631\u0627\u062c\u0639\u0629 \u0637\u0644\u0628\u0627\u062a \u062a\u0639\u062f\u064a\u0644 \u0627\u0644\u0628\u064a\u0627\u0646\u0627\u062a \u0627\u0644\u062d\u0633\u0627\u0633\u0629.",
  "admin.partners": "\u0625\u062f\u0627\u0631\u0629 \u0628\u064a\u0627\u0646\u0627\u062a \u0627\u0644\u0634\u0631\u0643\u0627\u0621 \u0648\u0631\u0628\u0637 \u0627\u0644\u062d\u0633\u0627\u0628\u0627\u062a.",
  "admin.settings": "\u062a\u062d\u062f\u064a\u062b \u0645\u0639\u0644\u0648\u0645\u0627\u062a \u0627\u0644\u0634\u0631\u0643\u0629 \u0648\u0642\u0646\u0648\u0627\u062a \u0627\u0644\u062a\u0648\u0627\u0635\u0644.",
  "admin.review": "\u062a\u0646\u0638\u064a\u0645 \u0645\u0631\u0627\u062c\u0639\u0629 \u0627\u0644\u0637\u0644\u0628\u0627\u062a \u0642\u0628\u0644 \u0627\u0644\u0646\u0634\u0631.",
  "admin.users": "\u062a\u062d\u062f\u064a\u062f \u0635\u0644\u0627\u062d\u064a\u0627\u062a \u0627\u0644\u0645\u0633\u062a\u062e\u062f\u0645\u064a\u0646.",
  "admin.ads": "\u0645\u0631\u0627\u062c\u0639\u0629 \u0627\u0644\u062d\u0645\u0644\u0627\u062a \u0642\u0628\u0644 \u0627\u0644\u0646\u0634\u0631.",
  "admin.homepage": "\u062a\u062d\u062f\u064a\u062b \u0645\u062d\u062a\u0648\u0649 \u0627\u0644\u0635\u0641\u062d\u0629 \u0627\u0644\u0631\u0626\u064a\u0633\u064a\u0629.",
  "attachments.item": "\u062a\u0646\u0638\u064a\u0645 \u0645\u0631\u0641\u0642\u0627\u062a \u0627\u0644\u0639\u0642\u0627\u0631 \u0627\u0644\u0645\u0639\u0631\u0648\u0636\u0629.",
  "attachments.upload": "\u0631\u0641\u0639 \u0645\u0631\u0641\u0642\u0627\u062a \u062c\u062f\u064a\u062f\u0629 \u0644\u0644\u0639\u0642\u0627\u0631.",
  auth: "\u062a\u0633\u062c\u064a\u0644 \u0627\u0644\u062f\u062e\u0648\u0644 \u0648\u062a\u0623\u0645\u064a\u0646 \u0627\u0644\u062d\u0633\u0627\u0628.",
  "team.activate": "\u062a\u0641\u0639\u064a\u0644 \u062d\u0633\u0627\u0628 \u0641\u0631\u064a\u0642 \u0627\u0644\u0639\u0645\u0644 \u0648\u0627\u0644\u062a\u062d\u0642\u0642 \u0645\u0646 \u0627\u0644\u062f\u0639\u0648\u0629.",
  "careers.apply": "\u062a\u062c\u0645\u064a\u0639 \u0628\u064a\u0627\u0646\u0627\u062a \u0627\u0644\u062a\u0642\u062f\u064a\u0645 \u0644\u0644\u0648\u0638\u064a\u0641\u0629.",
  "careers.admin": "\u0645\u062a\u0627\u0628\u0639\u0629 \u062d\u0627\u0644\u0629 \u0637\u0644\u0628 \u0627\u0644\u062a\u0648\u0638\u064a\u0641.",
  "crm.activities": "\u062a\u0633\u062c\u064a\u0644 \u0623\u0646\u0634\u0637\u0629 \u0627\u0644\u062a\u0648\u0627\u0635\u0644 \u0648\u0627\u0644\u0645\u062a\u0627\u0628\u0639\u0629.",
  "crm.customers": "\u062d\u0641\u0638 \u0628\u064a\u0627\u0646\u0627\u062a \u0627\u0644\u0639\u0645\u0644\u0627\u0621 \u0648\u0627\u062d\u062a\u064a\u0627\u062c\u0627\u062a\u0647\u0645.",
  "crm.filter": "\u0641\u0644\u062a\u0631\u0629 \u0627\u0644\u0646\u062a\u0627\u0626\u062c \u0628\u0633\u0631\u0639\u0629.",
  "crm.lead": "\u0645\u062a\u0627\u0628\u0639\u0629 \u0627\u0644\u0637\u0644\u0628\u0627\u062a \u0648\u062a\u0648\u062b\u064a\u0642 \u0627\u0644\u062a\u0648\u0627\u0635\u0644.",
  "crm.sources": "\u0625\u062f\u0627\u0631\u0629 \u0645\u0635\u0627\u062f\u0631 \u0627\u0644\u062d\u0645\u0644\u0627\u062a.",
  "crm.spend": "\u062a\u0633\u062c\u064a\u0644 \u0645\u0635\u0631\u0648\u0641\u0627\u062a \u0627\u0644\u062d\u0645\u0644\u0627\u062a.",
  "crm.visits": "\u062a\u0646\u0638\u064a\u0645 \u0632\u064a\u0627\u0631\u0627\u062a \u0627\u0644\u0645\u0639\u0627\u064a\u0646\u0629.",
  "crm.search": "\u0641\u0644\u062a\u0631\u0629 \u0627\u0644\u0646\u062a\u0627\u0626\u062c \u0628\u0633\u0631\u0639\u0629.",
  "developer.ads": "\u062a\u062c\u0647\u064a\u0632 \u062d\u0645\u0644\u0629 \u0625\u0639\u0644\u0627\u0646\u064a\u0629 \u0642\u0627\u0628\u0644\u0629 \u0644\u0644\u0646\u0634\u0631.",
  "developer.leads": "\u0645\u062a\u0627\u0628\u0639\u0629 \u0637\u0644\u0628\u0627\u062a \u0627\u0644\u0639\u0645\u0644\u0627\u0621.",
  "developer.listing": "\u062a\u062c\u0645\u064a\u0639 \u0628\u064a\u0627\u0646\u0627\u062a \u0627\u0644\u0639\u0642\u0627\u0631 \u0644\u0644\u0646\u0634\u0631.",
  "developer.media": "\u0625\u0636\u0627\u0641\u0629 \u0648\u0633\u0627\u0626\u0637 \u0644\u0644\u0639\u0642\u0627\u0631 \u0623\u0648 \u0627\u0644\u0645\u0634\u0631\u0648\u0639.",
  "developer.project": "\u062a\u062c\u0645\u064a\u0639 \u0628\u064a\u0627\u0646\u0627\u062a \u0627\u0644\u0645\u0634\u0631\u0648\u0639 \u0644\u0644\u0639\u0631\u0636.",
  filters: "\u0641\u0644\u062a\u0631\u0629 \u0646\u062a\u0627\u0626\u062c \u0627\u0644\u0628\u062d\u062b \u0639\u0646 \u0627\u0644\u0639\u0642\u0627\u0631\u0627\u062a.",
  "home.callback": "\u0637\u0644\u0628 \u0645\u0643\u0627\u0644\u0645\u0629 \u0645\u0646 \u0627\u0644\u0641\u0631\u064a\u0642.",
  "home.request": "\u0625\u0631\u0633\u0627\u0644 \u0637\u0644\u0628 \u0639\u0642\u0627\u0631 \u0645\u0646\u0627\u0633\u0628.",
  "home.search": "\u0628\u062d\u062b \u0633\u0631\u064a\u0639 \u0639\u0646 \u0627\u0644\u0639\u0642\u0627\u0631\u0627\u062a.",
  lead: "\u0625\u0631\u0633\u0627\u0644 \u0637\u0644\u0628 \u0627\u0647\u062a\u0645\u0627\u0645 \u0628\u0627\u0644\u0639\u0642\u0627\u0631.",
  "owner.audit": "\u0641\u0644\u062a\u0631\u0629 \u0633\u062c\u0644 \u0627\u0644\u0639\u0645\u0644\u064a\u0627\u062a.",
  "owner.delete": "\u062a\u0623\u0643\u064a\u062f \u0639\u0645\u0644\u064a\u0629 \u0627\u0644\u062d\u0630\u0641 \u0627\u0644\u0646\u0647\u0627\u0626\u064a.",
  "owner.settings": "\u062a\u062d\u062f\u064a\u062b \u0628\u064a\u0627\u0646\u0627\u062a \u0627\u0644\u062a\u0648\u0627\u0635\u0644 \u0627\u0644\u0631\u0633\u0645\u064a\u0629.",
  "owner.unlock": "\u0641\u062a\u062d \u0635\u0644\u0627\u062d\u064a\u0627\u062a \u0627\u0644\u0645\u0627\u0644\u0643.",
  "owner.users": "\u062f\u0639\u0648\u0629 \u0645\u0633\u062a\u062e\u062f\u0645 \u0648\u062a\u062d\u062f\u064a\u062f \u062f\u0648\u0631\u0647.",
  "staff.filter": "\u0641\u0644\u062a\u0631\u0629 \u0648\u062d\u062f\u0627\u062a \u0627\u0644\u0641\u0631\u064a\u0642.",
  "staff.import": "\u0627\u0633\u062a\u064a\u0631\u0627\u062f \u0628\u064a\u0627\u0646\u0627\u062a \u0627\u0644\u0648\u062d\u062f\u0627\u062a.",
  "staff.listing": "\u062a\u062c\u0647\u064a\u0632 \u0628\u064a\u0627\u0646\u0627\u062a \u0625\u0639\u0627\u062f\u0629 \u0627\u0644\u0628\u064a\u0639 \u0644\u0644\u062a\u0633\u0648\u064a\u0642.",
  "staff.search": "\u0641\u0644\u062a\u0631\u0629 \u0646\u062a\u0627\u0626\u062c \u0627\u0644\u0648\u062d\u062f\u0627\u062a \u0628\u0633\u0631\u0639\u0629.",
};

const EXAMPLE_BY_FIELD: Record<string, string> = {
  phone: "01000000000",
  phone_raw: "01000000000",
  phone_e164: "+201000000000",
  email: "name@example.com",
  price: "2500000",
  budget_min: "1000000",
  budget_max: "2500000",
  budgetMin: "1000000",
  budgetMax: "2500000",
  size_m2: "120",
  meters: "120",
  beds: "3",
  baths: "2",
  commission: "2.5",
  sort_order: "1",
  floor: "5",
  url: "https://example.com",
  cta_url: "https://example.com",
  asset_url: "https://example.com/media.jpg",
  poster_url: "https://example.com/poster.jpg",
  logo_url: "https://example.com/logo.png",
  image_url: "https://example.com/image.jpg",
};

const EXAMPLE_BY_KEY: Record<string, string> = {
  "owner.delete.confirm": "DELETE",
  "owner.unlock.token": "OWNER-1234",
  "admin.partners.user_id": "UUID",
  "staff.listing.agent_user_id": "UUID",
  "crm.sources.slug": "facebook-ads",
  "developer.listing.listing_code": "HR-001",
  "developer.listing.unit_code": "U-101",
  "staff.listing.listing_code": "HR-001",
  "staff.listing.unit_code": "U-101",
  "developer.project.project_code": "PR-001",
};

const RULES_BY_KEY: Record<string, string[]> = {
  "auth.password": ["\u0639\u0644\u0649 \u0627\u0644\u0623\u0642\u0644 6 \u0623\u062d\u0631\u0641."],
  "auth.passwordConfirm": ["\u0644\u0627\u0632\u0645 \u064a\u0637\u0627\u0628\u0642 \u0643\u0644\u0645\u0629 \u0627\u0644\u0645\u0631\u0648\u0631."],
  "owner.delete.confirm": ["\u0627\u0643\u062a\u0628 \u0643\u0644\u0645\u0629 DELETE \u0628\u0627\u0644\u0625\u0646\u062c\u0644\u064a\u0632\u064a."],
  "owner.unlock.token": ["\u0627\u0646\u0633\u062e \u0627\u0644\u0631\u0645\u0632 \u0643\u0645\u0627 \u0647\u0648."],
  "admin.partners.user_id": ["UUID \u0641\u0642\u0637."],
  "staff.listing.agent_user_id": ["UUID \u0644\u0644\u0645\u0646\u062f\u0648\u0628 \u0644\u0648 \u0645\u062a\u0648\u0641\u0631."],
  "crm.sources.slug": ["\u0628\u062f\u0648\u0646 \u0645\u0633\u0627\u0641\u0627\u062a.", "\u062d\u0631\u0648\u0641 \u0635\u063a\u064a\u0631\u0629 \u0648- \u0641\u0642\u0637."],
};

const TOGGLE_FIELDS = new Set(["is_active", "primary", "published", "requested", "elevator", "kitchen", "is_published"]);
const FILE_FIELDS = new Set(["file", "images", "cv", "logo"]);
const EMAIL_FIELDS = new Set(["email", "contact_email"]);
const PHONE_FIELDS = new Set([
  "phone",
  "phone_raw",
  "phone_e164",
  "owner_phone",
  "whatsappNumber",
  "whatsapp_number",
  "primary_phone",
  "secondary_phone",
]);
const URL_FIELDS = new Set([
  "url",
  "logo_url",
  "asset_url",
  "poster_url",
  "cta_url",
  "facebook",
  "facebook_url",
  "instagram",
  "instagram_url",
  "linkedin",
  "linkedin_url",
  "tiktok",
  "tiktok_url",
  "youtube",
  "youtube_url",
  "whatsappLink",
  "image_url",
  "poster",
]);
const DATETIME_FIELDS = new Set(["next_action_at", "scheduled_at", "occurred_at", "next_followup_at"]);
const DATE_FIELDS = new Set([
  "from",
  "to",
  "month",
  "intake_date",
  "last_owner_contact_at",
  "next_owner_followup_at",
]);
const NUMBER_FIELDS = new Set([
  "amount",
  "price",
  "budget_max",
  "budget_min",
  "budgetMax",
  "budgetMin",
  "beds",
  "baths",
  "size_m2",
  "meters",
  "commission",
  "sort_order",
  "floor",
  "minPrice",
  "maxPrice",
  "priceMin",
  "priceMax",
  "areaMin",
  "areaMax",
  "starting_price",
]);
const SELECT_FIELDS = new Set([
  "status",
  "role",
  "intent",
  "purpose",
  "type",
  "currency",
  "assigned",
  "assigned_to",
  "source",
  "transaction",
  "amenities",
  "sort",
  "submission_status",
  "lead_source",
  "unit_status",
  "ad_channel",
  "target",
  "view",
  "outcome",
  "category",
  "developer_id",
  "project_id",
  "listing_id",
  "listing",
  "lead",
  "customer",
  "actor",
  "entity",
  "action",
  "channel",
  "contactTime",
  "format",
  "lostReason",
  "lost_reason",
  "overdue",
  "whatsapp_message_language",
]);

type HelpType =
  | "toggle"
  | "file"
  | "email"
  | "phone"
  | "url"
  | "datetime"
  | "date"
  | "number"
  | "select"
  | "text";

function purposeForKey(key: string) {
  const parts = key.split(".");
  const prefixTwo = parts.length >= 2 ? `${parts[0]}.${parts[1]}` : parts[0] ?? key;
  return PURPOSE_BY_PREFIX[prefixTwo] ?? PURPOSE_BY_PREFIX[parts[0]] ?? "\u0641\u0644\u062a\u0631\u0629 \u0627\u0644\u0646\u062a\u0627\u0626\u062c \u0628\u0633\u0631\u0639\u0629.";
}

function typeForKey(key: string): HelpType {
  const segment = key.split(".").pop() ?? key;
  if (TOGGLE_FIELDS.has(segment)) return "toggle";
  if (FILE_FIELDS.has(segment)) return "file";
  if (EMAIL_FIELDS.has(segment)) return "email";
  if (PHONE_FIELDS.has(segment)) return "phone";
  if (URL_FIELDS.has(segment)) return "url";
  if (DATETIME_FIELDS.has(segment)) return "datetime";
  if (DATE_FIELDS.has(segment)) return "date";
  if (NUMBER_FIELDS.has(segment)) return "number";
  if (SELECT_FIELDS.has(segment)) return "select";
  return "text";
}

function buildHelp(key: string): FieldHelpEntry {
  const purpose = purposeForKey(key);
  const segment = key.split(".").pop() ?? key;
  const example = EXAMPLE_BY_KEY[key] ?? EXAMPLE_BY_FIELD[segment];
  const rules = RULES_BY_KEY[key];
  const label = LABEL_PLACEHOLDER;

  switch (typeForKey(key)) {
    case "toggle":
      return toggleHelp(label, purpose);
    case "file":
      return fileHelp(label, purpose, rules);
    case "email":
      return emailHelp(label, purpose, example);
    case "phone":
      return phoneHelp(label, purpose, example);
    case "url":
      return urlHelp(label, purpose, example);
    case "datetime":
      return datetimeHelp(label, purpose, example);
    case "date":
      return dateHelp(label, purpose, example);
    case "number":
      return numberHelp(label, purpose, example, rules);
    case "select":
      return selectHelp(label, purpose, example);
    default:
      return textHelp(label, purpose, example, rules);
  }
}

export const FIELD_HELP: Record<string, FieldHelpEntry> = Object.fromEntries(
  FIELD_HELP_KEYS.map((key) => [key, buildHelp(key)])
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
  toggleHelp,
};
