import Link from "next/link";
import { Badge, Card } from "@/components/ui";
import { formatPrice } from "@/lib/format";
import { getPropertyTypeLabelKey, getPurposeLabelKey } from "@/lib/i18n";
import { getPublicImageUrl } from "@/lib/storage";

type TFn = (key: string, params?: Record<string, string | number>) => string;

type ListingCard = {
  id: string;
  title: string;
  price: number;
  currency: string;
  city: string;
  area: string | null;
  purpose: string;
  type: string;
  beds: number;
  baths: number;
  listing_images: Array<{ path: string; sort: number }> | null;
};

type FeaturedListingsProps = {
  t: TFn;
  locale: "ar" | "en";
  listings: ListingCard[];
};

export function FeaturedListings({ t, locale, listings }: FeaturedListingsProps) {
  if (listings.length === 0) {
    return (
      <Card className="p-3 sm:p-4">
        <p className="text-sm text-[var(--muted)]">{t("home.featured.empty")}</p>
      </Card>
    );
  }

  return (
    <div className="grid gap-4 sm:gap-6 md:grid-cols-3">
      {listings.map((listing, index) => {
        const cover = listing.listing_images?.sort((a, b) => a.sort - b.sort)[0]?.path ?? null;
        const coverUrl = getPublicImageUrl(cover);
        return (
          <Card
            key={listing.id}
            className="group flex flex-col gap-4 fade-up hrtaj-card"
            style={{ animationDelay: `${index * 80}ms` }}
          >
            <Link href={`/listing/${listing.id}`}>
              <div className="aspect-[4/3] overflow-hidden rounded-xl bg-[var(--surface)]">
                {coverUrl ? (
                  <img
                    src={coverUrl}
                    alt={listing.title}
                    className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                    loading="lazy"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-sm text-[var(--muted)]">
                    {t("general.noImage")}
                  </div>
                )}
              </div>
            </Link>
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <Badge>{t(getPurposeLabelKey(listing.purpose))}</Badge>
                <Badge>{t(getPropertyTypeLabelKey(listing.type))}</Badge>
                <Badge>
                  {listing.beds} {t("detail.stats.rooms")} - {listing.baths} {t("detail.stats.baths")}
                </Badge>
              </div>
              <Link href={`/listing/${listing.id}`}>
                <h3 className="text-lg font-semibold hover:text-[var(--accent)] line-clamp-2">
                  {listing.title}
                </h3>
              </Link>
              <p className="text-sm text-[var(--muted)]">
                {listing.city}
                {listing.area ? ` - ${listing.area}` : ""}
              </p>
              <p className="text-lg font-semibold text-[var(--accent)]">
                {formatPrice(listing.price, listing.currency, locale)}
              </p>
            </div>
          </Card>
        );
      })}
    </div>
  );
}
