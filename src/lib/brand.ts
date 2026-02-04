export const BRAND_AR_NAME = "هارت" + "\u0686";
export const BRAND_AR_NAME_FALLBACK = "هارتج";
export const BRAND_EN_NAME = "HRTAJ";

export function getBrandArName() {
  if (typeof document === "undefined") return BRAND_AR_NAME;
  const flag = document.documentElement.getAttribute("data-brand-ar-fallback");
  return flag === "1" ? BRAND_AR_NAME_FALLBACK : BRAND_AR_NAME;
}
