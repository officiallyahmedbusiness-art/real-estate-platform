"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { subscribeFavorites, toggleFavorite, getFavorites, setFavorites } from "@/lib/favorites/store";
import { useToast } from "@/components/Toast";
import { track, buildListingAnalyticsPayload } from "@/lib/analytics";

export function FavoriteButton({
  listing,
  className = "",
  labels,
}: {
  listing: { id: string; price?: number | null; area?: string | null; city?: string | null; size_m2?: number | null };
  className?: string;
  labels: {
    add: string;
    remove: string;
  };
}) {
  const [favorites, setLocalFavorites] = useState<string[]>(() => getFavorites());
  const [userId, setUserId] = useState<string | null>(null);
  const { push } = useToast();

  useEffect(() => subscribeFavorites(setLocalFavorites), []);

  useEffect(() => {
    let mounted = true;
    supabase.auth.getUser().then(({ data }) => {
      if (!mounted) return;
      setUserId(data.user?.id ?? null);
    });
    return () => {
      mounted = false;
    };
  }, []);

  const isSaved = favorites.includes(listing.id);

  async function handleToggle() {
    const next = toggleFavorite(listing.id);
    const nextSaved = next.includes(listing.id);
    push(nextSaved ? labels.add : labels.remove);
    track("favorite_toggle", {
      action: nextSaved ? "add" : "remove",
      ...buildListingAnalyticsPayload(listing),
    });

    if (userId) {
      if (nextSaved) {
        await supabase.from("favorites").upsert({ user_id: userId, listing_id: listing.id });
      } else {
        await supabase.from("favorites").delete().eq("user_id", userId).eq("listing_id", listing.id);
      }
    }
  }

  return (
    <button
      type="button"
      onClick={handleToggle}
      className={`favorite-button ${isSaved ? "is-active" : ""} ${className}`}
      aria-pressed={isSaved}
      aria-label={isSaved ? labels.remove : labels.add}
    >
      <span aria-hidden="true">{isSaved ? "♥" : "♡"}</span>
    </button>
  );
}

export function FavoritesSyncBanner({
  labels,
}: {
  labels: { title: string; action: string; done: string };
}) {
  const [favorites, setLocalFavorites] = useState<string[]>(() => getFavorites());
  const [userId, setUserId] = useState<string | null>(null);
  const [state, setState] = useState<"idle" | "syncing" | "done">("idle");

  useEffect(() => subscribeFavorites(setLocalFavorites), []);

  useEffect(() => {
    let mounted = true;
    supabase.auth.getUser().then(({ data }) => {
      if (!mounted) return;
      setUserId(data.user?.id ?? null);
    });
    return () => {
      mounted = false;
    };
  }, []);

  if (!userId || favorites.length === 0) return null;

  async function handleSync() {
    setState("syncing");
    const payload = favorites.map((id) => ({ user_id: userId, listing_id: id }));
    if (payload.length) {
      await supabase.from("favorites").upsert(payload, { onConflict: "user_id,listing_id" });
    }
    const { data } = await supabase.from("favorites").select("listing_id").eq("user_id", userId);
    const merged = Array.from(
      new Set([...(data ?? []).map((row) => row.listing_id), ...favorites])
    );
    setFavorites(merged);
    setState("done");
    setTimeout(() => setState("idle"), 2000);
  }

  return (
    <div className="favorites-sync">
      <span>{labels.title}</span>
      <button type="button" onClick={handleSync} className="favorites-sync-button">
        {state === "done" ? labels.done : labels.action}
      </button>
    </div>
  );
}
