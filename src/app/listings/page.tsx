import Link from "next/link";
import { createSupabaseServerClient } from "@/lib/supabaseServer";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { Button, Card, Input, Select, Badge } from "@/components/ui";
import { formatNumber, formatPrice } from "@/lib/format";
import { getPublicImageUrl } from "@/lib/storage";
import { PROPERTY_TYPE_OPTIONS, PURPOSE_OPTIONS, SORT_OPTIONS } from "@/lib/constants";
import { createT, getPropertyTypeLabelKey, getPurposeLabelKey } from "@/lib/i18n";
import { getServerLocale } from "@/lib/i18n.server";

type SearchParams = Record<string, string | string[] | undefined>;

function getParam(searchParams: SearchParams, key: string) {
  const value = searchParams[key];
  return Array.isArray(value) ? value[0] : value ?? "";
}

function toQuery(params: SearchParams) {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (Array.isArray(value)) {
      value.filter(Boolean).forEach((item) => query.append(key, item));
      return;
    }
    if (value) query.set(key, value);
  });
  return query;
}

export default async function ListingsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const locale = await getServerLocale();
  const t = createT(locale);

  const params = await searchParams;
  const city = getParam(params, "city");
  const area = getParam(params, "area");
  const purpose = getParam(params, "purpose");
  const type = getParam(params, "type");
  const minPrice = getParam(params, "minPrice");
  const maxPrice = getParam(params, "maxPrice");
  const beds = getParam(params, "beds");
  const baths = getParam(params, "baths");
  const sort = getParam(params, "sort") || "newest";
  const view = getParam(params, "view") || "grid";
  const page = Math.max(Number(getParam(params, "page") || "1"), 1);
  const pageSize = 12;
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;
  const isList = view === "list";
  const baseQuery = toQuery(params);
  const gridQuery = new URLSearchParams(baseQuery);
  const listQuery = new URLSearchParams(baseQuery);
  gridQuery.set("view", "grid");
  listQuery.set("view", "list");

  const supabase = await createSupabaseServerClient();
  let query = supabase
    .from("listings")
    .select(
      "id, title, price, currency, city, area, beds, baths, size_m2, purpose, type, status, listing_images(path, sort)",
      { count: "exact" }
    )
    .eq("status", "published");

  if (city) query = query.ilike("city", `%${city}%`);
  if (area) query = query.ilike("area", `%${area}%`);
  if (purpose) query = query.eq("purpose", purpose);
  if (type) query = query.eq("type", type);
  if (minPrice) query = query.gte("price", Number(minPrice));
  if (maxPrice) query = query.lte("price", Number(maxPrice));
  if (beds) query = query.gte("beds", Number(beds));
  if (baths) query = query.gte("baths", Number(baths));

  if (sort === "price_asc") {
    query = query.order("price", { ascending: true });
  } else if (sort === "price_desc") {
    query = query.order("price", { ascending: false });
  } else {
    query = query.order("created_at", { ascending: false });
  }

  const { data, count } = await query.range(from, to);
  const listings = data ?? [];
  const totalCount = count ?? 0;
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
  const prevQuery = new URLSearchParams(baseQuery);
  const nextQuery = new URLSearchParams(baseQuery);
  prevQuery.set("page", String(Math.max(page - 1, 1)));
  nextQuery.set("page", String(Math.min(page + 1, totalPages)));
  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--text)]">
      <SiteHeader />
      <main className="mx-auto w-full max-w-7xl space-y-8 px-6 py-10">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="space-y-1">
            <h1 className="text-2xl font-semibold">{t("listings.title")}</h1>
            <p className="text-sm text-[var(--muted)]">
              {t("listings.results", { count: formatNumber(totalCount, locale) })}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Link href={`/listings?${gridQuery.toString()}`}>
              <Button size="sm" variant={isList ? "secondary" : "primary"}>
                {t("listings.view.grid")}
              </Button>
            </Link>
            <Link href={`/listings?${listQuery.toString()}`}>
              <Button size="sm" variant={isList ? "primary" : "secondary"}>
                {t("listings.view.list")}
              </Button>
            </Link>
          </div>
        </div>

        <Card className="space-y-4 hrtaj-card">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="space-y-1">
              <h2 className="text-lg font-semibold">{t("listings.filters.title")}</h2>
              <p className="text-sm text-[var(--muted)]">{t("listings.filters.subtitle")}</p>
            </div>
            <Badge>
              {t("listings.results", { count: formatNumber(totalCount, locale) })}
            </Badge>
          </div>
          <form className="grid gap-4 md:grid-cols-4">
            <input type="hidden" name="view" value={view} />
            <input type="hidden" name="page" value="1" />
            <Input name="city" placeholder={t("filters.city")} defaultValue={city} />
            <Input name="area" placeholder={t("filters.area")} defaultValue={area} />
            <Select name="purpose" defaultValue={purpose}>
              <option value="">{t("filters.purpose")}</option>
              {PURPOSE_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {t(option.labelKey)}
                </option>
              ))}
            </Select>
            <Select name="type" defaultValue={type}>
              <option value="">{t("filters.type")}</option>
              {PROPERTY_TYPE_OPTIONS.map((item) => (
                <option key={item.value} value={item.value}>
                  {t(item.labelKey)}
                </option>
              ))}
            </Select>
            <Input name="minPrice" placeholder={t("filters.minPrice")} defaultValue={minPrice} />
            <Input name="maxPrice" placeholder={t("filters.maxPrice")} defaultValue={maxPrice} />
            <Input name="beds" placeholder={t("filters.beds")} defaultValue={beds} />
            <Input name="baths" placeholder={t("filters.baths")} defaultValue={baths} />
            <Select name="sort" defaultValue={sort}>
              {SORT_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {t(option.labelKey)}
                </option>
              ))}
            </Select>
            <div className="md:col-span-3" />
            <Button type="submit" size="md">
              {t("listings.filters.apply")}
            </Button>
          </form>
        </Card>

        {listings.length === 0 ? (
          <Card>
            <p className="text-sm text-[var(--muted)]">{t("listings.empty")}</p>
          </Card>
        ) : (
          <div className={isList ? "grid gap-4" : "grid gap-6 md:grid-cols-2"}>
            {listings.map((listing, index) => {
              const cover =
                listing.listing_images?.sort((a, b) => a.sort - b.sort)[0]?.path ?? null;
              const coverUrl = getPublicImageUrl(cover);
              return (
                <Card
                  key={listing.id}
                  className={`group flex flex-col gap-4 fade-up hrtaj-card ${isList ? "md:flex-row" : ""}`}
                  style={{ animationDelay: `${index * 60}ms` }}
                >
                  <Link href={`/listing/${listing.id}`}>
                    <div
                      className={`overflow-hidden rounded-xl bg-[var(--surface)] ${
                        isList ? "aspect-[4/3] md:w-64" : "aspect-[16/9]"
                      }`}
                    >
                      {coverUrl ? (
                        <img
                          src={coverUrl}
                          alt={listing.title}
                          className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-sm text-[var(--muted)]">
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
                      <h3 className="text-lg font-semibold hover:text-[var(--accent)]">
                        {listing.title}
                      </h3>
                    </Link>
                    <p className="text-sm text-[var(--muted)]">
                      {listing.city}
                      {listing.area ? ` - ${listing.area}` : ""}
                    </p>
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <p className="text-xl font-semibold text-[var(--accent)]">
                        {formatPrice(listing.price, listing.currency, locale)}
                      </p>
                      {listing.size_m2 ? <Badge>{listing.size_m2} m2</Badge> : null}
                    </div>
                    <div className="flex flex-wrap items-center gap-3">
                      <Link href={`/listing/${listing.id}`}>
                        <Button size="sm" variant="secondary">
                          {t("listing.card.details")}
                        </Button>
                      </Link>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
        {totalPages > 1 ? (
          <div className="flex flex-wrap items-center justify-between gap-3">
            {page > 1 ? (
              <Link href={`/listings?${prevQuery.toString()}`}>
                <Button size="sm" variant="secondary">
                  {t("listings.pagination.prev")}
                </Button>
              </Link>
            ) : (
              <Button size="sm" variant="secondary" disabled>
                {t("listings.pagination.prev")}
              </Button>
            )}
            <span className="text-sm text-[var(--muted)]">
              {t("listings.pagination.page", { page, total: totalPages })}
            </span>
            {page < totalPages ? (
              <Link href={`/listings?${nextQuery.toString()}`}>
                <Button size="sm" variant="secondary">
                  {t("listings.pagination.next")}
                </Button>
              </Link>
            ) : (
              <Button size="sm" variant="secondary" disabled>
                {t("listings.pagination.next")}
              </Button>
            )}
          </div>
        ) : null}
      </main>
      <SiteFooter showFloating />
    </div>
  );
}



