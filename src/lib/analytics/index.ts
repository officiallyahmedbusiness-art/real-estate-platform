export type AnalyticsPayload = Record<string, string | number | boolean | null | undefined>;

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
    fbq?: (...args: unknown[]) => void;
    __hrtajEvents?: Array<{ event: string; payload: AnalyticsPayload }>;
  }
}

function sanitizePayload(payload: AnalyticsPayload) {
  const cleaned: Record<string, string | number | boolean> = {};
  Object.entries(payload).forEach(([key, value]) => {
    if (value === undefined || value === null) return;
    cleaned[key] = value as string | number | boolean;
  });
  return cleaned;
}

export function track(event: string, payload: AnalyticsPayload = {}) {
  if (typeof window === "undefined") return;
  const cleaned = sanitizePayload(payload);

  const send = () => {
    window.__hrtajEvents = window.__hrtajEvents || [];
    window.__hrtajEvents.push({ event, payload: cleaned });

    if (typeof window.gtag === "function") {
      window.gtag("event", event, cleaned);
    }

    if (typeof window.fbq === "function") {
      window.fbq("trackCustom", event, cleaned);
    }

    if (process.env.NODE_ENV !== "production") {
      console.log(`[analytics] ${event}`, cleaned);
    }
  };

  setTimeout(send, 0);
}

export function buildListingAnalyticsPayload(listing: {
  id: string;
  price?: number | null;
  area?: string | null;
  city?: string | null;
  size_m2?: number | null;
}) {
  const price = listing.price ?? null;
  const priceBucket = price === null ? null : bucketNumber(price, [1000000, 2000000, 5000000, 10000000]);
  const sizeBucket = listing.size_m2 === null || listing.size_m2 === undefined
    ? null
    : bucketNumber(listing.size_m2, [60, 100, 150, 200, 300]);
  const areaSlug = (listing.area || listing.city || "").toLowerCase().replace(/\s+/g, "-");

  return {
    listing_id: listing.id,
    price_bucket: priceBucket,
    size_bucket: sizeBucket,
    area_slug: areaSlug || undefined,
  };
}

function bucketNumber(value: number, thresholds: number[]) {
  for (let i = 0; i < thresholds.length; i += 1) {
    if (value < thresholds[i]) return `<${thresholds[i]}`;
  }
  return `>=${thresholds[thresholds.length - 1]}`;
}
