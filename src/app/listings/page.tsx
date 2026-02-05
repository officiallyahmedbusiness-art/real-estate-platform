import Link from "next/link";
import { cache } from "react";
import { createSupabaseServerClient } from "@/lib/supabaseServer";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { Badge, Button, Card } from "@/components/ui";
import { FieldCheckbox, FieldInput, FieldSelect } from "@/components/FieldHelp";
import { formatNumber } from "@/lib/format";
import { PROPERTY_TYPE_OPTIONS, PURPOSE_OPTIONS, SORT_OPTIONS } from "@/lib/constants";
import { createT, getPurposeLabelKey } from "@/lib/i18n";
import { getServerLocale } from "@/lib/i18n.server";
import { parseFiltersFromUrl, serializeFiltersToUrl, countActiveFilters, filtersToCacheKey } from "@/lib/filters/query";
import { DEFAULT_FILTERS, type ListingFilters } from "@/lib/filters/types";
import { ListingCard } from "@/components/listings/ListingCard";
import { ListingsGrid } from "@/components/listings/ListingsGrid";
import { FiltersDrawer } from "@/components/listings/FiltersDrawer";
import { ShareButton } from "@/components/listings/ShareButton";
import { RecentlyViewedStrip } from "@/components/listings/RecentlyViewedStrip";
import { SaveSearchModal } from "@/components/search/SaveSearchModal";
import { FiltersAnalytics } from "@/components/search/FiltersAnalytics";
import { getPublicBaseUrl } from "@/lib/paths";
import { getSiteSettings } from "@/lib/settings";
import { getFlags } from "@/lib/flags";

const PAGE_SIZE = 12;
const NEW_DAYS = 14;

type SearchParams = Record<string, string | string[] | undefined>;

const fetchListings = cache(async (filtersKey: string) => {
  const filters = JSON.parse(filtersKey) as ListingFilters;
  const supabase = await createSupabaseServerClient();

  let query = supabase
    .from("listings")
    .select(
      "id, title, price, currency, city, area, beds, baths, size_m2, purpose, type, status, created_at, amenities, listing_images(path, sort)",
      { count: "exact" }
    )
    .eq("status", "published");

  if (filters.transactionType) query = query.eq("purpose", filters.transactionType);
  if (filters.propertyType) query = query.eq("type", filters.propertyType);
  if (filters.city) query = query.ilike("city", `%${filters.city}%`);
  if (filters.area) query = query.ilike("area", `%${filters.area}%`);
  if (filters.priceMin !== undefined) query = query.gte("price", filters.priceMin);
  if (filters.priceMax !== undefined) query = query.lte("price", filters.priceMax);
  if (filters.areaMin !== undefined) query = query.gte("size_m2", filters.areaMin);
  if (filters.areaMax !== undefined) query = query.lte("size_m2", filters.areaMax);
  if (filters.beds !== undefined) query = query.gte("beds", filters.beds);
  if (filters.baths !== undefined) query = query.gte("baths", filters.baths);
  if (filters.amenities && filters.amenities.length) {
    query = query.contains("amenities", filters.amenities);
  }

  if (filters.sort === "price_asc") {
    query = query.order("price", { ascending: true });
  } else if (filters.sort === "price_desc") {
    query = query.order("price", { ascending: false });
  } else if (filters.sort === "area_asc") {
    query = query.order("size_m2", { ascending: true });
  } else if (filters.sort === "area_desc") {
    query = query.order("size_m2", { ascending: false });
  } else {
    query = query.order("created_at", { ascending: false });
  }

  const from = (filters.page - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;
  const { data, count, error } = await query.range(from, to);

  const now = Date.now();
  const listingsWithFlags = (data ?? []).map((listing) => ({
    ...listing,
    is_new: listing.created_at
      ? now - new Date(listing.created_at).getTime() <= NEW_DAYS * 24 * 60 * 60 * 1000
      : false,
  }));

  return {
    listings: listingsWithFlags,
    count: count ?? 0,
    error,
  };
});

export default async function ListingsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const locale = await getServerLocale();
  const t = createT(locale);

  const params = await searchParams;
  const { filters } = parseFiltersFromUrl(params);
  const filtersKey = filtersToCacheKey(filters);
  const { listings, count: totalCount, error } = await fetchListings(filtersKey);

  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));
  const prevPage = Math.max(filters.page - 1, 1);
  const nextPage = Math.min(filters.page + 1, totalPages);

  const prevQuery = serializeFiltersToUrl(filters, { page: prevPage });
  const nextQuery = serializeFiltersToUrl(filters, { page: nextPage });

  const activeCount = countActiveFilters(filters);
  const baseUrl = getPublicBaseUrl();
  const queryString = serializeFiltersToUrl(filters).toString();
  const shareUrl = `${baseUrl ?? ""}/listings?${queryString}`;

  const settings = await getSiteSettings();
  const whatsappNumber = settings.whatsapp_number ?? null;
  const callNumber = settings.primary_phone ?? settings.whatsapp_number ?? null;
  const flags = getFlags();
  const transactionOptions = PURPOSE_OPTIONS.map((option) => ({
    value: option.value,
    label: t(option.labelKey),
  }));

  const amenityOptions = [
    { value: "مصعد", label: t("amenity.elevator") },
    { value: "جراج", label: t("amenity.parking") },
    { value: "أمن", label: t("amenity.security") },
    { value: "بلكونة", label: t("amenity.balcony") },
    { value: "مولد", label: t("amenity.generator") },
    { value: "اطلالة بحر", label: t("amenity.seaView") },
  ];

  const defaultSearchName =
    filters.area || filters.city ? `بحث ${filters.area ?? filters.city}` : t("savedSearch.defaultName");

  const resetQuery = serializeFiltersToUrl({ ...DEFAULT_FILTERS, view: filters.view });
  const resetHref = resetQuery.toString() ? `/listings?${resetQuery.toString()}` : "/listings";

  const chipItems: Array<{ label: string; href: string }> = [];
  const buildHref = (next: ListingFilters) => {
    const qs = serializeFiltersToUrl(next).toString();
    return qs ? `/listings?${qs}` : "/listings";
  };

  if (filters.transactionType) {
    chipItems.push({
      label: t(getPurposeLabelKey(filters.transactionType)),
      href: buildHref({ ...filters, transactionType: undefined, page: 1 }),
    });
  }
  if (filters.propertyType) {
    const typeLabelKey = PROPERTY_TYPE_OPTIONS.find((item) => item.value === filters.propertyType)?.labelKey;
    chipItems.push({
      label: typeLabelKey ? t(typeLabelKey) : filters.propertyType,
      href: buildHref({ ...filters, propertyType: undefined, page: 1 }),
    });
  }
  if (filters.city) {
    chipItems.push({
      label: filters.city,
      href: buildHref({ ...filters, city: undefined, page: 1 }),
    });
  }
  if (filters.area) {
    chipItems.push({
      label: filters.area,
      href: buildHref({ ...filters, area: undefined, page: 1 }),
    });
  }
  if (filters.priceMin !== undefined || filters.priceMax !== undefined) {
    chipItems.push({
      label: `${t("filters.priceMin")} ${filters.priceMin ?? "-"} ${t("filters.priceMax")} ${
        filters.priceMax ?? "-"
      }`,
      href: buildHref({ ...filters, priceMin: undefined, priceMax: undefined, page: 1 }),
    });
  }
  if (filters.areaMin !== undefined || filters.areaMax !== undefined) {
    chipItems.push({
      label: `${t("filters.areaMin")} ${filters.areaMin ?? "-"} ${t("filters.areaMax")} ${
        filters.areaMax ?? "-"
      }`,
      href: buildHref({ ...filters, areaMin: undefined, areaMax: undefined, page: 1 }),
    });
  }
  if (filters.beds !== undefined) {
    chipItems.push({
      label: `${filters.beds}+ ${t("filters.beds")}`,
      href: buildHref({ ...filters, beds: undefined, page: 1 }),
    });
  }
  if (filters.baths !== undefined) {
    chipItems.push({
      label: `${filters.baths}+ ${t("filters.baths")}`,
      href: buildHref({ ...filters, baths: undefined, page: 1 }),
    });
  }
  if (filters.amenities?.length) {
    filters.amenities.forEach((amenity) => {
      const amenityLabel = amenityOptions.find((item) => item.value === amenity)?.label ?? amenity;
      const nextAmenities = filters.amenities?.filter((item) => item !== amenity) ?? [];
      chipItems.push({
        label: amenityLabel,
        href: buildHref({ ...filters, amenities: nextAmenities.length ? nextAmenities : undefined, page: 1 }),
      });
    });
  }

  const formIdMobile = "listing-filters-form-mobile";
  const formIdDesktop = "listing-filters-form-desktop";

  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--text)]">
      <SiteHeader />
      <main className="mx-auto w-full max-w-7xl space-y-6 px-4 py-6 pb-[calc(8rem+env(safe-area-inset-bottom))] sm:space-y-8 sm:px-6 sm:py-10 lg:px-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="space-y-1">
            <h1 className="text-xl font-semibold sm:text-2xl">{t("listings.title")}</h1>
            <p className="text-sm text-[var(--muted)]">
              {t("listings.results", { count: formatNumber(totalCount, locale) })}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Link href={`/listings?${serializeFiltersToUrl(filters, { view: "grid" }).toString()}`}>
              <Button size="sm" variant={filters.view === "list" ? "secondary" : "primary"}>
                {t("listings.view.grid")}
              </Button>
            </Link>
            <Link href={`/listings?${serializeFiltersToUrl(filters, { view: "list" }).toString()}`}>
              <Button size="sm" variant={filters.view === "list" ? "primary" : "secondary"}>
                {t("listings.view.list")}
              </Button>
            </Link>
            {flags.enableSavedSearch ? (
              <SaveSearchModal
                queryString={queryString}
                defaultName={defaultSearchName}
                labels={{
                  open: t("savedSearch.save"),
                  title: t("savedSearch.modalTitle"),
                  nameLabel: t("savedSearch.name"),
                  save: t("savedSearch.save"),
                  cancel: t("general.cancel"),
                  saved: t("savedSearch.saved"),
                }}
              />
            ) : null}
            <ShareButton url={shareUrl} label={t("listing.action.share")} />
          </div>
        </div>

        <FiltersDrawer
          title={t("listings.filters.title")}
          subtitle={t("listings.filters.subtitle")}
          activeCount={activeCount}
          formId={formIdMobile}
          applyLabel={t("listings.filters.apply")}
          resetLabel={t("listings.filters.reset")}
          resetHref={resetHref}
        >
          <form id={formIdMobile} action="/listings" method="get" className="grid gap-4">
            <input type="hidden" name="view" value={filters.view} />
            <input type="hidden" name="page" value="1" />
            <FieldSelect
              name="transaction"
              label={t("filters.transaction")}
              helpKey="filters.transaction"
              defaultValue={filters.transactionType ?? ""}
            >
              <option value="">{t("filters.transaction")}</option>
              {transactionOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </FieldSelect>
            <FieldSelect
              name="type"
              label={t("filters.type")}
              helpKey="filters.type"
              defaultValue={filters.propertyType ?? ""}
            >
              <option value="">{t("filters.type")}</option>
              {PROPERTY_TYPE_OPTIONS.map((item) => (
                <option key={item.value} value={item.value}>
                  {t(item.labelKey)}
                </option>
              ))}
            </FieldSelect>
            <FieldInput
              name="city"
              label={t("filters.city")}
              helpKey="filters.city"
              placeholder={t("filters.city")}
              defaultValue={filters.city ?? ""}
            />
            <FieldInput
              name="area"
              label={t("filters.area")}
              helpKey="filters.area"
              placeholder={t("filters.area")}
              defaultValue={filters.area ?? ""}
            />
            <div className="grid gap-3 sm:grid-cols-2">
              <FieldInput
                name="priceMin"
                label={t("filters.priceMin")}
                helpKey="filters.priceMin"
                placeholder={t("filters.priceMin")}
                defaultValue={filters.priceMin?.toString() ?? ""}
              />
              <FieldInput
                name="priceMax"
                label={t("filters.priceMax")}
                helpKey="filters.priceMax"
                placeholder={t("filters.priceMax")}
                defaultValue={filters.priceMax?.toString() ?? ""}
              />
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <FieldInput
                name="areaMin"
                label={t("filters.areaMin")}
                helpKey="filters.areaMin"
                placeholder={t("filters.areaMin")}
                defaultValue={filters.areaMin?.toString() ?? ""}
              />
              <FieldInput
                name="areaMax"
                label={t("filters.areaMax")}
                helpKey="filters.areaMax"
                placeholder={t("filters.areaMax")}
                defaultValue={filters.areaMax?.toString() ?? ""}
              />
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <FieldInput
                name="beds"
                label={t("filters.beds")}
                helpKey="filters.beds"
                placeholder={t("filters.beds")}
                defaultValue={filters.beds?.toString() ?? ""}
              />
              <FieldInput
                name="baths"
                label={t("filters.baths")}
                helpKey="filters.baths"
                placeholder={t("filters.baths")}
                defaultValue={filters.baths?.toString() ?? ""}
              />
            </div>
            <FieldSelect
              name="sort"
              label={t("filters.sort")}
              helpKey="filters.sort"
              defaultValue={filters.sort}
            >
              {SORT_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {t(option.labelKey)}
                </option>
              ))}
            </FieldSelect>
            <div className="space-y-2">
              <p className="text-sm font-semibold text-[var(--text)]">{t("filters.amenities")}</p>
              <div className="grid gap-2">
                {amenityOptions.map((item) => (
                  <FieldCheckbox
                    key={item.value}
                    name="amenities"
                    value={item.value}
                    label={item.label}
                    helpKey="filters.amenities"
                    defaultChecked={filters.amenities?.includes(item.value) ?? false}
                  />
                ))}
              </div>
            </div>
            <div className="hidden md:flex md:justify-end">
              <Button type="submit" size="md">
                {t("listings.filters.apply")}
              </Button>
            </div>
          </form>
        </FiltersDrawer>

        <Card className="hidden space-y-3 p-3 sm:space-y-4 sm:p-4 hrtaj-card md:block">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="space-y-1">
              <h2 className="text-base font-semibold sm:text-lg">{t("listings.filters.title")}</h2>
              <p className="text-xs text-[var(--muted)] sm:text-sm">{t("listings.filters.subtitle")}</p>
            </div>
            <Badge>{t("listings.results", { count: formatNumber(totalCount, locale) })}</Badge>
          </div>
          <form id={formIdDesktop} action="/listings" method="get" className="grid gap-4 md:grid-cols-4">
            <input type="hidden" name="view" value={filters.view} />
            <input type="hidden" name="page" value="1" />
            <FieldSelect
              name="transaction"
              label={t("filters.transaction")}
              helpKey="filters.transaction"
              defaultValue={filters.transactionType ?? ""}
            >
              <option value="">{t("filters.transaction")}</option>
              {transactionOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </FieldSelect>
            <FieldSelect
              name="type"
              label={t("filters.type")}
              helpKey="filters.type"
              defaultValue={filters.propertyType ?? ""}
            >
              <option value="">{t("filters.type")}</option>
              {PROPERTY_TYPE_OPTIONS.map((item) => (
                <option key={item.value} value={item.value}>
                  {t(item.labelKey)}
                </option>
              ))}
            </FieldSelect>
            <FieldInput
              name="city"
              label={t("filters.city")}
              helpKey="filters.city"
              placeholder={t("filters.city")}
              defaultValue={filters.city ?? ""}
            />
            <FieldInput
              name="area"
              label={t("filters.area")}
              helpKey="filters.area"
              placeholder={t("filters.area")}
              defaultValue={filters.area ?? ""}
            />
            <FieldInput
              name="priceMin"
              label={t("filters.priceMin")}
              helpKey="filters.priceMin"
              placeholder={t("filters.priceMin")}
              defaultValue={filters.priceMin?.toString() ?? ""}
            />
            <FieldInput
              name="priceMax"
              label={t("filters.priceMax")}
              helpKey="filters.priceMax"
              placeholder={t("filters.priceMax")}
              defaultValue={filters.priceMax?.toString() ?? ""}
            />
            <FieldInput
              name="areaMin"
              label={t("filters.areaMin")}
              helpKey="filters.areaMin"
              placeholder={t("filters.areaMin")}
              defaultValue={filters.areaMin?.toString() ?? ""}
            />
            <FieldInput
              name="areaMax"
              label={t("filters.areaMax")}
              helpKey="filters.areaMax"
              placeholder={t("filters.areaMax")}
              defaultValue={filters.areaMax?.toString() ?? ""}
            />
            <FieldInput
              name="beds"
              label={t("filters.beds")}
              helpKey="filters.beds"
              placeholder={t("filters.beds")}
              defaultValue={filters.beds?.toString() ?? ""}
            />
            <FieldInput
              name="baths"
              label={t("filters.baths")}
              helpKey="filters.baths"
              placeholder={t("filters.baths")}
              defaultValue={filters.baths?.toString() ?? ""}
            />
            <FieldSelect
              name="sort"
              label={t("filters.sort")}
              helpKey="filters.sort"
              defaultValue={filters.sort}
            >
              {SORT_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {t(option.labelKey)}
                </option>
              ))}
            </FieldSelect>
            <div className="md:col-span-4">
              <div className="grid gap-2 md:grid-cols-3">
                {amenityOptions.map((item) => (
                  <FieldCheckbox
                    key={item.value}
                    name="amenities"
                    value={item.value}
                    label={item.label}
                    helpKey="filters.amenities"
                    defaultChecked={filters.amenities?.includes(item.value) ?? false}
                  />
                ))}
              </div>
            </div>
            <div className="md:col-span-4 flex items-center justify-between gap-3">
              <a href={resetHref} className="text-sm text-[var(--muted)] hover:text-[var(--text)]">
                {t("listings.filters.reset")}
              </a>
              <Button type="submit" size="md">
                {t("listings.filters.apply")}
              </Button>
            </div>
          </form>
        </Card>

        {chipItems.length ? (
          <div className="flex flex-wrap items-center gap-2">
            {chipItems.map((chip) => (
              <Link key={chip.href + chip.label} href={chip.href} className="filter-chip">
                {chip.label}
                <span className="filter-chip-remove">×</span>
              </Link>
            ))}
            <a href={resetHref} className="filter-chip-reset">
              {t("listings.filters.reset")}
            </a>
          </div>
        ) : null}

        {error ? (
          <Card className="p-4">
            <p className="text-sm text-[var(--muted)]">{t("listings.empty")}</p>
          </Card>
        ) : listings.length === 0 ? (
          <Card className="p-4">
            <p className="text-sm text-[var(--muted)]">{t("listings.empty")}</p>
          </Card>
        ) : (
          <ListingsGrid view={filters.view}>
            {listings.map((listing) => (
              <ListingCard
                key={listing.id}
                listing={listing}
                view={filters.view}
                locale={locale}
                t={t}
                whatsappNumber={whatsappNumber}
                whatsappTemplate={settings.whatsapp_message_template}
                callNumber={callNumber}
                baseUrl={baseUrl}
                enableCompare={flags.enableCompare}
              />
            ))}
          </ListingsGrid>
        )}

        {totalPages > 1 ? (
          <div className="flex flex-wrap items-center justify-between gap-3">
            {filters.page > 1 ? (
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
              {t("listings.pagination.page", { page: filters.page, total: totalPages })}
            </span>
            {filters.page < totalPages ? (
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
      <div className="mx-auto w-full max-w-7xl px-4 pb-10 sm:px-6 lg:px-8">
        <RecentlyViewedStrip
          locale={locale}
          title={t("recent.title")}
          empty={t("recent.empty")}
        />
      </div>
      <FiltersAnalytics formIds={[formIdMobile, formIdDesktop]} />
      <SiteFooter showFloating showCompare />
    </div>
  );
}
