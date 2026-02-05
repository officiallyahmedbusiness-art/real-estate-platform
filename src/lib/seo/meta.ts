import type { Metadata } from "next";
import { formatPrice } from "@/lib/format";
import { getPropertyTypeLabelKey, type Locale } from "@/lib/i18n";

export type ListingMetaInput = {
  id: string;
  title: string;
  price: number;
  currency: string;
  city: string;
  area: string | null;
  beds: number;
  baths: number;
  size_m2: number | null;
  purpose: string;
  type: string;
  amenities?: string[] | null;
};

type ListingMetaArgs = {
  listing: ListingMetaInput;
  locale: Locale;
  t: (key: string, params?: Record<string, string | number>) => string;
  baseUrl?: string | null;
  imageUrl?: string;
};

type ListingJsonLdArgs = Omit<ListingMetaArgs, "t">;

export function buildListingMetadata({
  listing,
  locale,
  t,
  baseUrl,
  imageUrl,
}: ListingMetaArgs): Metadata {
  const typeLabel = t(getPropertyTypeLabelKey(listing.type));
  const areaLabel = listing.area || listing.city;
  const priceLabel = formatPrice(listing.price, listing.currency, locale);
  const title = `${typeLabel}${areaLabel ? ` ${areaLabel}` : ""} | ${priceLabel} | ${t("brand.name")}`;
  const location = [listing.city, listing.area].filter(Boolean).join(" - ");
  const specs = [
    listing.size_m2 ? `${listing.size_m2} m²` : null,
    listing.beds ? `${listing.beds} ${t("detail.stats.rooms")}` : null,
    listing.baths ? `${listing.baths} ${t("detail.stats.baths")}` : null,
  ].filter(Boolean);
  const description = `${location}${specs.length ? ` | ${specs.join(" • ")}` : ""}`;
  const url = baseUrl ? `${baseUrl}/listing/${listing.id}` : undefined;
  const alternates = url
    ? {
        canonical: url,
        languages: {
          ar: `${url}?lang=ar`,
          en: `${url}?lang=en`,
        },
      }
    : undefined;

  return {
    title,
    description,
    alternates,
    openGraph: {
      title,
      description,
      url,
      siteName: t("brand.name"),
      type: "article",
      images: imageUrl
        ? [
            {
              url: imageUrl,
              width: 1200,
              height: 630,
              alt: listing.title,
            },
          ]
        : undefined,
    },
    twitter: {
      card: imageUrl ? "summary_large_image" : "summary",
      title,
      description,
      images: imageUrl ? [imageUrl] : undefined,
    },
  };
}

export function buildListingJsonLd({
  listing,
  locale,
  baseUrl,
  imageUrl,
}: ListingJsonLdArgs) {
  const schemaType = mapSchemaType(listing.type, locale);
  const url = baseUrl ? `${baseUrl}/listing/${listing.id}` : undefined;
  const address = {
    "@type": "PostalAddress",
    addressLocality: listing.city,
    addressRegion: listing.area ?? undefined,
  };

  const jsonLd: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "Offer",
    price: listing.price,
    priceCurrency: listing.currency,
    availability: "https://schema.org/InStock",
    url,
    itemOffered: {
      "@type": schemaType,
      name: listing.title,
      description: listing.title,
      address,
      floorSize: listing.size_m2
        ? { "@type": "QuantitativeValue", value: listing.size_m2, unitCode: "MTK" }
        : undefined,
      numberOfRooms: listing.beds,
      numberOfBathroomsTotal: listing.baths,
    },
  };

  if (imageUrl) {
    jsonLd.image = [imageUrl];
  }

  if (listing.amenities && Array.isArray(listing.amenities)) {
    jsonLd.itemOffered = {
      ...((jsonLd.itemOffered as Record<string, unknown>) ?? {}),
      amenityFeature: listing.amenities.map((amenity) => ({
        "@type": "LocationFeatureSpecification",
        name: amenity,
        value: true,
      })),
    };
  }

  return jsonLd;
}

function mapSchemaType(type: string, locale: Locale) {
  const normalized = type.toLowerCase();
  if (normalized.includes("شقة") || normalized.includes("apartment")) return "Apartment";
  if (normalized.includes("فيلا") || normalized.includes("villa")) return "House";
  if (normalized.includes("land") || normalized.includes("أرض")) return "Land";
  if (normalized.includes("office") || (locale === "ar" && normalized.includes("مكتب"))) return "Office";
  if (normalized.includes("shop") || (locale === "ar" && normalized.includes("محل"))) return "Store";
  return "Residence";
}
