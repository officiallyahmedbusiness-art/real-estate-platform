"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Card } from "@/components/ui";
import { getRecentlyViewed, subscribeRecentlyViewed } from "@/lib/recentlyViewed/store";
import { getPublicImageUrl } from "@/lib/storage";
import { createT, type Locale } from "@/lib/i18n";
import { getClientLocale } from "@/lib/i18n.client";
import { BRAND_AR_NAME } from "@/lib/brand";

export type RecentlyViewedListing = {
  id: string;
  title: string;
  city: string;
  area: string | null;
  listing_images?: { path: string; sort: number }[] | null;
};

export function RecentlyViewedStrip({
  locale,
  title,
  empty,
}: {
  locale?: Locale;
  title: string;
  empty: string;
}) {
  const [mounted, setMounted] = useState(false);
  const [ids, setIds] = useState<string[]>([]);
  const [items, setItems] = useState<RecentlyViewedListing[]>([]);
  const [loading, setLoading] = useState(false);
  const t = useMemo(() => createT(locale || getClientLocale()), [locale]);

  useEffect(() => {
    setMounted(true);
    setIds(getRecentlyViewed());
    return subscribeRecentlyViewed(setIds);
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    async function load() {
      if (ids.length === 0) {
        setItems([]);
        return;
      }
      setLoading(true);
      try {
        const res = await fetch("/api/listings/by-ids", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ids }),
          signal: controller.signal,
        });
        if (!res.ok) throw new Error("failed");
        const data = (await res.json()) as { listings: RecentlyViewedListing[] };
        setItems(data.listings ?? []);
      } catch {
        setItems([]);
      } finally {
        setLoading(false);
      }
    }
    load();
    return () => controller.abort();
  }, [ids]);

  if (!mounted || ids.length === 0) return null;

  return (
    <section className="recently-strip">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">{title}</h2>
        {loading ? <span className="text-xs text-[var(--muted)]">{t("general.loading")}</span> : null}
      </div>
      {items.length === 0 ? (
        <Card className="p-4">
          <p className="text-sm text-[var(--muted)]">{empty}</p>
        </Card>
      ) : (
        <div className="recently-track">
          {items.map((item) => {
            const cover = [...(item.listing_images ?? [])].sort((a, b) => a.sort - b.sort)[0]?.path;
            const coverUrl = cover ? getPublicImageUrl(cover) : null;
            return (
              <Link key={item.id} href={`/listing/${item.id}`} className="recently-card">
                <div className="recently-card-media">
                  {coverUrl ? (
                    <Image
                      src={coverUrl}
                      alt={item.title}
                      fill
                      sizes="(max-width: 768px) 70vw, 240px"
                      className="object-cover"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-xs text-[var(--muted)]">
                      {t("listing.card.noImage")}
                    </div>
                  )}
                  <span className="media-watermark" aria-hidden="true">
                    {BRAND_AR_NAME}
                  </span>
                </div>
                <div className="recently-card-body">
                  <p className="line-clamp-2">{item.title}</p>
                  <p className="text-xs text-[var(--muted)]">
                    {item.city}{item.area ? ` - ${item.area}` : ""}
                  </p>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </section>
  );
}
