"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { getFavorites, subscribeFavorites, setFavorites } from "@/lib/favorites/store";
import { ListingCard } from "@/components/listings/ListingCard";
import { ListingsGrid } from "@/components/listings/ListingsGrid";
import { createT, type Locale } from "@/lib/i18n";
import { getClientLocale } from "@/lib/i18n.client";

export type SavedListing = {
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
  created_at?: string | null;
  amenities?: string[] | null;
  floor?: number | null;
  listing_images?: { path: string; sort: number }[] | null;
  is_new?: boolean | null;
};

export function SavedListings({
  locale,
  whatsappNumber,
  whatsappTemplate,
  callNumber,
  enableCompare = true,
}: {
  locale: Locale;
  whatsappNumber?: string | null;
  whatsappTemplate?: string | null;
  callNumber?: string | null;
  enableCompare?: boolean;
}) {
  const [favorites, setLocalFavorites] = useState<string[]>(() => getFavorites());
  const [items, setItems] = useState<SavedListing[]>([]);
  const [loading, setLoading] = useState(true);
  const t = useMemo(() => createT(locale || getClientLocale()), [locale]);

  useEffect(() => subscribeFavorites(setLocalFavorites), []);

  useEffect(() => {
    let mounted = true;
    supabase.auth.getUser().then(async ({ data }) => {
      if (!mounted || !data.user) return;
      const { data: favs } = await supabase
        .from("favorites")
        .select("listing_id")
        .eq("user_id", data.user.id);
      if (!mounted) return;
      if (favs && favs.length) {
        const local = getFavorites();
        const merged = Array.from(new Set([...local, ...favs.map((row) => row.listing_id)]));
        setFavorites(merged);
      }
    });
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    async function load() {
      if (favorites.length === 0) {
        setItems([]);
        setLoading(false);
        return;
      }
      setLoading(true);
      try {
        const res = await fetch("/api/listings/by-ids", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ids: favorites }),
          signal: controller.signal,
        });
        if (!res.ok) throw new Error("failed");
        const data = (await res.json()) as { listings: SavedListing[] };
        setItems(data.listings ?? []);
      } catch {
        setItems([]);
      } finally {
        setLoading(false);
      }
    }
    load();
    return () => controller.abort();
  }, [favorites]);

  if (loading) {
    return <p className="text-sm text-[var(--muted)]">{t("general.loading")}</p>;
  }

  if (favorites.length === 0 || items.length === 0) {
    return <p className="text-sm text-[var(--muted)]">{t("saved.empty")}</p>;
  }

  return (
    <ListingsGrid view="grid">
      {items.map((listing) => (
        <ListingCard
          key={listing.id}
          listing={listing}
          locale={locale}
          t={t}
          whatsappNumber={whatsappNumber}
          whatsappTemplate={whatsappTemplate}
          callNumber={callNumber}
          enableCompare={enableCompare}
        />
      ))}
    </ListingsGrid>
  );
}
