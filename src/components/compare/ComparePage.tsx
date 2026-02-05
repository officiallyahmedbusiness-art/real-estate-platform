"use client";

import { useEffect, useState } from "react";
import { getCompareIds, subscribeCompare } from "@/lib/compare/store";
import { CompareButton } from "@/components/compare/CompareButton";
import { Card } from "@/components/ui";
import { formatPrice } from "@/lib/format";
import { createT } from "@/lib/i18n";
import { getClientLocale } from "@/lib/i18n.client";

export type CompareListing = {
  id: string;
  title: string;
  price: number;
  currency: string;
  city: string;
  area: string | null;
  beds: number;
  baths: number;
  size_m2: number | null;
  floor?: number | null;
  amenities?: string[] | null;
};

export function ComparePage({ labels }: { labels: { empty: string } }) {
  const [ids, setIds] = useState<string[]>(() => getCompareIds());
  const [items, setItems] = useState<CompareListing[]>([]);
  const [loading, setLoading] = useState(true);
  const locale = getClientLocale();
  const t = createT(locale);

  useEffect(() => subscribeCompare(setIds), []);

  useEffect(() => {
    const controller = new AbortController();
    async function load() {
      if (ids.length === 0) {
        setItems([]);
        setLoading(false);
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
        const data = (await res.json()) as { listings: CompareListing[] };
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

  if (loading) {
    return (
      <Card className="p-4">
        <p className="text-sm text-[var(--muted)]">{t("general.loading")}</p>
      </Card>
    );
  }

  if (ids.length < 2 || items.length === 0) {
    return (
      <Card className="p-4">
        <p className="text-sm text-[var(--muted)]">{labels.empty}</p>
      </Card>
    );
  }

  const rows = [
    { key: "price", label: t("compare.price"), render: (item: CompareListing) => formatPrice(item.price, item.currency, locale) },
    { key: "area", label: t("compare.area"), render: (item: CompareListing) => item.area || "-" },
    { key: "size", label: t("compare.size"), render: (item: CompareListing) => item.size_m2 ? `${item.size_m2} m²` : "-" },
    { key: "beds", label: t("compare.beds"), render: (item: CompareListing) => String(item.beds) },
    { key: "baths", label: t("compare.baths"), render: (item: CompareListing) => String(item.baths) },
    { key: "floor", label: t("compare.floor"), render: (item: CompareListing) => item.floor ?? "-" },
    { key: "amenities", label: t("compare.amenities"), render: (item: CompareListing) => item.amenities?.slice(0, 4).join("، ") || "-" },
  ];

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 md:hidden">
        {items.map((item) => (
          <Card key={item.id} className="compare-card">
            <div className="flex items-start justify-between gap-2">
              <h3 className="text-base font-semibold">{item.title}</h3>
              <CompareButton
                listing={item}
                labels={{ add: t("compare.add"), remove: t("compare.remove"), limit: t("compare.limit") }}
              />
            </div>
            <div className="compare-card-rows">
              {rows.map((row) => (
                <div key={row.key} className="compare-row">
                  <span className="compare-label">{row.label}</span>
                  <span className="compare-value">{row.render(item)}</span>
                </div>
              ))}
            </div>
          </Card>
        ))}
      </div>

      <div className="hidden md:block">
        <div className="compare-table">
          <div className="compare-table-row compare-table-head">
            <div className="compare-table-cell compare-table-label" />
            {items.map((item) => (
              <div key={item.id} className="compare-table-cell">
                <div className="flex items-start justify-between gap-2">
                  <span className="text-sm font-semibold">{item.title}</span>
                  <CompareButton
                    listing={item}
                    labels={{ add: t("compare.add"), remove: t("compare.remove"), limit: t("compare.limit") }}
                  />
                </div>
              </div>
            ))}
          </div>
          {rows.map((row) => {
            const values = items.map((item) => row.render(item));
            return (
              <div key={row.key} className="compare-table-row">
                <div className="compare-table-cell compare-table-label">{row.label}</div>
                {values.map((value, idx) => (
                  <div
                    key={`${row.key}-${items[idx]?.id}`}
                    className={`compare-table-cell ${value !== values[0] ? "compare-diff" : ""}`}
                  >
                    {value}
                  </div>
                ))}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
