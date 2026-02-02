export const PURPOSE_OPTIONS = [
  { value: "sale", labelKey: "purpose.sale" },
  { value: "rent", labelKey: "purpose.rent" },
  { value: "new-development", labelKey: "purpose.new" },
] as const;

export const PROPERTY_TYPE_OPTIONS = [
  { value: "شقة", labelKey: "propertyType.apartment" },
  { value: "فيلا", labelKey: "propertyType.villa" },
  { value: "دوبلكس", labelKey: "propertyType.duplex" },
  { value: "تاون هاوس", labelKey: "propertyType.townhouse" },
  { value: "بنتهاوس", labelKey: "propertyType.penthouse" },
  { value: "ستوديو", labelKey: "propertyType.studio" },
  { value: "أرض", labelKey: "propertyType.land" },
] as const;

export const SORT_OPTIONS = [
  { value: "newest", labelKey: "sort.newest" },
  { value: "price_asc", labelKey: "sort.priceAsc" },
  { value: "price_desc", labelKey: "sort.priceDesc" },
] as const;

export const FEATURE_CATEGORIES = [
  { titleKey: "category.rent.title", descKey: "category.rent.desc", purpose: "rent" },
  { titleKey: "category.sale.title", descKey: "category.sale.desc", purpose: "sale" },
  { titleKey: "category.new.title", descKey: "category.new.desc", purpose: "new-development" },
] as const;

export const LEAD_STATUS_OPTIONS = [
  { value: "new", labelKey: "lead.status.new" },
  { value: "contacted", labelKey: "lead.status.contacted" },
  { value: "qualified", labelKey: "lead.status.qualified" },
  { value: "meeting_set", labelKey: "lead.status.meeting_set" },
  { value: "follow_up", labelKey: "lead.status.follow_up" },
  { value: "negotiation", labelKey: "lead.status.negotiation" },
  { value: "won", labelKey: "lead.status.won" },
  { value: "lost", labelKey: "lead.status.lost" },
] as const;

export const LEAD_SOURCE_OPTIONS = [
  { value: "facebook", labelKey: "lead.source.facebook" },
  { value: "propertyfinder", labelKey: "lead.source.propertyfinder" },
  { value: "dubizzle", labelKey: "lead.source.dubizzle" },
  { value: "organic", labelKey: "lead.source.organic" },
  { value: "influencer", labelKey: "lead.source.influencer" },
  { value: "whatsapp", labelKey: "lead.source.whatsapp" },
  { value: "chatbot", labelKey: "lead.source.chatbot" },
  { value: "referral", labelKey: "lead.source.referral" },
  { value: "partner", labelKey: "lead.source.partner" },
  { value: "web", labelKey: "lead.source.web" },
] as const;

export const SUBMISSION_STATUS_OPTIONS = [
  { value: "draft", labelKey: "submission.status.draft" },
  { value: "submitted", labelKey: "submission.status.submitted" },
  { value: "under_review", labelKey: "submission.status.under_review" },
  { value: "needs_changes", labelKey: "submission.status.needs_changes" },
  { value: "approved", labelKey: "submission.status.approved" },
  { value: "published", labelKey: "submission.status.published" },
  { value: "archived", labelKey: "submission.status.archived" },
] as const;

export const UNIT_STATUS_OPTIONS = [
  { value: "available", labelKey: "staff.unitStatus.available" },
  { value: "reserved", labelKey: "staff.unitStatus.reserved" },
  { value: "sold", labelKey: "staff.unitStatus.sold" },
  { value: "rented", labelKey: "staff.unitStatus.rented" },
  { value: "off_market", labelKey: "staff.unitStatus.off_market" },
  { value: "on_hold", labelKey: "staff.unitStatus.on_hold" },
] as const;

export const MEDIA_TYPE_OPTIONS = [
  { value: "brochure", labelKey: "media.type.brochure" },
  { value: "floorplan", labelKey: "media.type.floorplan" },
  { value: "image", labelKey: "media.type.image" },
  { value: "other", labelKey: "media.type.other" },
] as const;

export const ATTACHMENT_CATEGORY_OPTIONS = [
  { value: "unit_photos", labelKey: "attachment.category.unit_photos" },
  { value: "building_entry", labelKey: "attachment.category.building_entry" },
  { value: "view", labelKey: "attachment.category.view" },
  { value: "plan", labelKey: "attachment.category.plan" },
  { value: "contract", labelKey: "attachment.category.contract" },
  { value: "owner_docs", labelKey: "attachment.category.owner_docs" },
  { value: "other", labelKey: "attachment.category.other" },
] as const;

export const ATTACHMENT_TYPE_OPTIONS = [
  { value: "image", labelKey: "attachment.type.image" },
  { value: "pdf", labelKey: "attachment.type.pdf" },
  { value: "video", labelKey: "attachment.type.video" },
  { value: "doc", labelKey: "attachment.type.doc" },
  { value: "other", labelKey: "attachment.type.other" },
] as const;
