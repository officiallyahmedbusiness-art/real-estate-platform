"use client";

import { ShareButton } from "@/components/listings/ShareButton";
import { Button } from "@/components/ui";
import { FavoriteButton } from "@/components/favorites/FavoriteButton";
import { CompareButton } from "@/components/compare/CompareButton";
import { track, buildListingAnalyticsPayload } from "@/lib/analytics";
import { buildWhatsAppLink, buildWhatsAppMessageEncoded, getBrandForLocale } from "@/lib/whatsapp/message";
import type { Locale } from "@/lib/i18n";
import { formatPrice } from "@/lib/format";

export function ListingActionButtons({
  listing,
  whatsappNumber,
  whatsappTemplate,
  callNumber,
  shareUrl,
  locale,
  labels,
  enableCompare,
}: {
  listing: {
    id: string;
    title: string;
    price?: number | null;
    currency?: string | null;
    area?: string | null;
    city?: string | null;
    size_m2?: number | null;
  };
  whatsappNumber?: string | null;
  whatsappTemplate?: string | null;
  callNumber?: string | null;
  shareUrl: string;
  locale: Locale;
  labels: {
    whatsapp: string;
    call: string;
    share: string;
    favoriteAdd: string;
    favoriteRemove: string;
    compareAdd: string;
    compareRemove: string;
    compareLimit: string;
  };
  enableCompare: boolean;
}) {
  const priceText =
    typeof listing.price === "number"
      ? formatPrice(listing.price, listing.currency ?? "EGP", locale)
      : undefined;
  const whatsappMessage = buildWhatsAppMessageEncoded(
    {
      brand: getBrandForLocale(locale),
      listing_url: shareUrl,
      listing_title: listing.title,
      price: priceText ?? listing.price ?? undefined,
      area: listing.area ?? undefined,
      city: listing.city ?? undefined,
    },
    whatsappTemplate,
    locale
  );
  const whatsappLink = buildWhatsAppLink(whatsappNumber ?? null, whatsappMessage);
  const callLink = callNumber ? `tel:${callNumber.replace(/\s+/g, "")}` : null;

  return (
    <div className="listing-card-actions">
      {whatsappLink ? (
        <a
          href={whatsappLink}
          target="_blank"
          rel="noreferrer"
          onClick={() => track("whatsapp_click", buildListingAnalyticsPayload(listing))}
        >
          <Button size="sm">{labels.whatsapp}</Button>
        </a>
      ) : null}
      {callLink ? (
        <a href={callLink} onClick={() => track("call_click", buildListingAnalyticsPayload(listing))}>
          <Button size="sm" variant="secondary">
            {labels.call}
          </Button>
        </a>
      ) : null}
      <ShareButton url={shareUrl} label={labels.share} analytics={buildListingAnalyticsPayload(listing)} />
      <FavoriteButton listing={listing} labels={{ add: labels.favoriteAdd, remove: labels.favoriteRemove }} />
      {enableCompare ? (
        <CompareButton
          listing={listing}
          labels={{ add: labels.compareAdd, remove: labels.compareRemove, limit: labels.compareLimit }}
        />
      ) : null}
    </div>
  );
}
