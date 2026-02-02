import Link from "next/link";
import { Badge, Button } from "@/components/ui";
import { createT, type Locale } from "@/lib/i18n";

export type AdCampaignCard = {
  id: string;
  title: string;
  body: string;
  ctaLabel: string;
  ctaUrl: string;
  coverUrl: string | null;
  coverType: "image" | "video";
  posterUrl: string | null;
};

export function AdsCarousel({
  locale,
  items,
}: {
  locale: Locale;
  items: AdCampaignCard[];
}) {
  const t = createT(locale);
  if (items.length === 0) return null;
  const loop = [...items, ...items];

  return (
    <div className="ads-strip">
      <div className="ads-track">
        {loop.map((item, index) => (
          <div key={`${item.id}-${index}`} className="ads-card">
            <div className="ads-media">
              {item.coverUrl ? (
                item.coverType === "video" ? (
                  <video
                    className="h-full w-full object-cover"
                    muted
                    autoPlay
                    loop
                    playsInline
                    poster={item.posterUrl ?? undefined}
                  >
                    <source src={item.coverUrl} />
                  </video>
                ) : (
                  <img src={item.coverUrl} alt={item.title} className="h-full w-full object-cover" />
                )
              ) : (
                <div className="flex h-full items-center justify-center text-xs text-[var(--muted)]">
                  {t("general.noImage")}
                </div>
              )}
              <div className="ads-badge">
                <Badge>{t("home.ads.title")}</Badge>
              </div>
            </div>
            <div className="space-y-2">
              <p className="text-sm font-semibold">{item.title}</p>
              <p className="text-xs text-[var(--muted)] line-clamp-2">{item.body}</p>
            </div>
            <Link href={item.ctaUrl}>
              <Button size="sm" variant="secondary">
                {item.ctaLabel}
              </Button>
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}
