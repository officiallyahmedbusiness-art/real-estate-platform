export function formatPrice(
  value: number | string | null | undefined,
  currency = "EGP"
) {
  const num = typeof value === "string" ? Number(value) : value ?? NaN;
  if (!Number.isFinite(num)) return "-";
  return new Intl.NumberFormat("ar-EG", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(num);
}

export function formatNumber(value: number | string | null | undefined) {
  const num = typeof value === "string" ? Number(value) : value ?? NaN;
  if (!Number.isFinite(num)) return "-";
  return new Intl.NumberFormat("ar-EG").format(num);
}
