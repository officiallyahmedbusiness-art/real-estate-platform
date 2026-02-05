import Link from "next/link";
import Image from "next/image";
import { Badge, Card } from "@/components/ui";
import { formatPrice } from "@/lib/format";
import { getPublicImageUrl } from "@/lib/storage";
import { getPropertyTypeLabelKey, getPurposeLabelKey, type Locale } from "@/lib/i18n";
import { BRAND_AR_NAME } from "@/lib/brand";
import type { ListingCardData } from "@/components/listings/types";
import { ListingActionButtons } from "@/components/listings/ListingActionButtons";

export function ListingCard({
  listing,
  locale,
  t,
  whatsappNumber,
  whatsappTemplate,
  callNumber,
  baseUrl,
  view = "grid",
  enableCompare = true,
}: {
  listing: ListingCardData;
  locale: Locale;
  t: (key: string, params?: Record<string, string | number>) => string;
  whatsappNumber?: string | null;
  whatsappTemplate?: string | null;
  callNumber?: string | null;
  baseUrl?: string | null;
  view?: "grid" | "list";
  enableCompare?: boolean;
}) {
  const images = listing.listing_images ?? [];
  const cover = [...images].sort((a, b) => a.sort - b.sort)[0]?.path ?? null;
  const coverUrl = cover ? getPublicImageUrl(cover) : null;

  const isNew = Boolean(listing.is_new);

  const shareUrl = baseUrl ? `${baseUrl}/listing/${listing.id}` : `/listing/${listing.id}`;

  const layoutClass = view === "list" ? "listing-card listing-card--list" : "listing-card";

  return (
    <Card className={`${layoutClass} hrtaj-card overflow-hidden`}>
      <Link href={`/listing/${listing.id}`} className="listing-card-media">
        {coverUrl ? (
          <Image
            src={coverUrl}
            alt={listing.title}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover"
            priority={false}
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-sm text-[var(--muted)]">
            {t("listing.card.noImage")}
          </div>
        )}
        <span className="media-watermark" aria-hidden="true">
          {BRAND_AR_NAME}
        </span>
      </Link>
      <div className="listing-card-body">
        <div className="flex flex-wrap items-center gap-2">
          <Badge>{t(getPurposeLabelKey(listing.purpose))}</Badge>
          <Badge>{t(getPropertyTypeLabelKey(listing.type))}</Badge>
          {isNew ? <Badge>{t("listing.badge.new")}</Badge> : null}
          {listing.is_furnished ? <Badge>{t("listing.badge.furnished")}</Badge> : null}
        </div>
        <Link href={`/listing/${listing.id}`} className="space-y-1">
          <h3 className="listing-card-title line-clamp-2">{listing.title}</h3>
          <p className="listing-card-location">
            {listing.city}
            {listing.area ? ` - ${listing.area}` : ""}
          </p>
        </Link>
        <div className="listing-card-price">
          {formatPrice(listing.price, listing.currency, locale)}
        </div>
        <div className="listing-card-specs">
          {listing.size_m2 ? <span>{listing.size_m2} m²</span> : null}
          <span>
            {listing.beds} {t("detail.stats.rooms")}
          </span>
          <span>
            {listing.baths} {t("detail.stats.baths")}
          </span>
        </div>
        <ListingActionButtons
          listing={listing}
          whatsappNumber={whatsappNumber}
          whatsappTemplate={whatsappTemplate}
          callNumber={callNumber}
          shareUrl={shareUrl}
          locale={locale}
          enableCompare={enableCompare}
          labels={{
            whatsapp: t("listing.action.whatsapp"),
            call: t("listing.action.call"),
            share: t("listing.action.share"),
            favoriteAdd: t("favorite.add"),
            favoriteRemove: t("favorite.remove"),
            compareAdd: t("compare.add"),
            compareRemove: t("compare.remove"),
            compareLimit: t("compare.limit"),
          }}
        />
      </div>
    </Card>
  );
}
