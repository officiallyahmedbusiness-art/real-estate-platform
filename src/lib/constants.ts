export const PURPOSE_OPTIONS = [
  { value: "sale", label: "للبيع" },
  { value: "rent", label: "للإيجار" },
  { value: "new-development", label: "مشروع جديد" },
] as const;

export const PROPERTY_TYPES = [
  "شقة",
  "فيلا",
  "تاون هاوس",
  "دوبلكس",
  "بنتهاوس",
  "شاليه",
  "أرض",
] as const;

export const SORT_OPTIONS = [
  { value: "newest", label: "الأحدث" },
  { value: "price_asc", label: "السعر: الأقل أولًا" },
  { value: "price_desc", label: "السعر: الأعلى أولًا" },
] as const;

export const FEATURE_CATEGORIES = [
  { title: "شقق للإيجار", purpose: "rent" },
  { title: "عقارات للبيع", purpose: "sale" },
  { title: "مشاريع جديدة", purpose: "new-development" },
] as const;
