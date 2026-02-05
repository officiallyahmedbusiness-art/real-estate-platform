import { BRAND, BRAND_AR_NAME, BRAND_EN_NAME } from "@/lib/brand";
import type { Locale } from "@/lib/i18n";

export type WhatsAppMessageParams = {
  brand?: string;
  listing_url?: string | null;
  listing_title?: string | null;
  price?: string | number | null;
  area?: string | null;
  city?: string | null;
  ref?: string | null;
  purpose?: string | null;
  property_type?: string | null;
};

const FALLBACK_AR_LISTING = "مرحبًا، أريد الاستفسار عن هذا العقار: {listing_url}";
const FALLBACK_EN_LISTING = "Hi, I'd like to inquire about this listing: {listing_url}";
const FALLBACK_AR_GENERIC = "مرحبًا، أريد الاستفسار عن خدماتكم.";
const FALLBACK_EN_GENERIC = "Hi, I'd like to inquire about your services.";

function resolveBrand(locale: Locale, override?: string) {
  if (override) return override;
  return locale === "ar" ? BRAND_AR_NAME : BRAND_EN_NAME;
}

function toStringValue(value: string | number | null | undefined) {
  if (value === null || value === undefined) return "";
  return typeof value === "number" ? String(value) : value;
}

function applyTemplate(template: string, params: Record<string, string>) {
  return template.replace(/\{(\w+)\}/g, (match, key) => {
    if (Object.prototype.hasOwnProperty.call(params, key)) {
      return params[key] ?? "";
    }
    return match;
  });
}

export function buildWhatsAppMessagePlain(
  params: WhatsAppMessageParams,
  template: string | null | undefined,
  locale: Locale
) {
  const brand = resolveBrand(locale, params.brand);
  const values = {
    brand,
    listing_url: params.listing_url ?? "",
    listing_title: params.listing_title ?? "",
    price: toStringValue(params.price),
    area: params.area ?? "",
    city: params.city ?? "",
    ref: params.ref ?? "",
    purpose: params.purpose ?? "",
    property_type: params.property_type ?? "",
  };

  const trimmed = template ? template.trim() : "";
  if (trimmed) {
    return applyTemplate(trimmed, values);
  }

  if (params.listing_url) {
    const fallback = locale === "ar" ? FALLBACK_AR_LISTING : FALLBACK_EN_LISTING;
    return applyTemplate(fallback, values);
  }

  return locale === "ar" ? FALLBACK_AR_GENERIC : FALLBACK_EN_GENERIC;
}

export function buildWhatsAppMessageEncoded(
  params: WhatsAppMessageParams,
  template: string | null | undefined,
  locale: Locale
) {
  const plain = buildWhatsAppMessagePlain(params, template, locale);
  return encodeURIComponent(plain);
}

export function buildWhatsAppLink(phoneE164: string | null | undefined, encodedMessage: string) {
  if (!phoneE164) return null;
  const digits = phoneE164.replace(/\D/g, "");
  if (!digits) return null;
  return `https://wa.me/${digits}?text=${encodedMessage}`;
}

export function getBrandForLocale(locale: Locale) {
  return locale === "ar" ? BRAND.ar : BRAND.en;
}
