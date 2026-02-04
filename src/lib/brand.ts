export const BRAND = {
  ar: "\u0647\u0627\u0631\u062a\u0686",
  en: "Hrtaj",
  domain: "hrtaj.com",
} as const;

export const BRAND_AR_NAME = BRAND.ar;
export const BRAND_EN_NAME = BRAND.en;

export function getBrandArName() {
  return BRAND.ar;
}
