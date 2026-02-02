export function formatPrice(
  value: number | string | null | undefined,
  currency = "EGP",
  locale: "ar" | "en" = "ar"
) {
  const num = typeof value === "string" ? Number(value) : value ?? NaN;
  if (!Number.isFinite(num)) return "-";
  const lang = locale === "en" ? "en-US" : "ar-EG";
  return new Intl.NumberFormat(lang, {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(num);
}

export function formatNumber(
  value: number | string | null | undefined,
  locale: "ar" | "en" = "ar"
) {
  const num = typeof value === "string" ? Number(value) : value ?? NaN;
  if (!Number.isFinite(num)) return "-";
  const lang = locale === "en" ? "en-US" : "ar-EG";
  return new Intl.NumberFormat(lang).format(num);
}
