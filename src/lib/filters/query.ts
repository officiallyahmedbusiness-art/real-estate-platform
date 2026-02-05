import {
  DEFAULT_FILTERS,
  SORT_VALUES,
  TRANSACTION_VALUES,
  VIEW_VALUES,
  type FilterParseResult,
  type ListingFilters,
  type ListingSort,
  type ListingView,
  type TransactionType,
} from "./types";

type RawParams = Record<string, string | string[] | undefined> | URLSearchParams;

function getParam(params: RawParams, key: string) {
  if (params instanceof URLSearchParams) return params.get(key) ?? undefined;
  const value = params[key];
  return Array.isArray(value) ? value[0] : value ?? undefined;
}

function getAllParams(params: RawParams, key: string) {
  if (params instanceof URLSearchParams) return params.getAll(key);
  const value = params[key];
  if (Array.isArray(value)) return value.filter(Boolean) as string[];
  return value ? [value] : [];
}

function clean(value: string | undefined) {
  const trimmed = value?.trim() ?? "";
  return trimmed.length ? trimmed : undefined;
}

function toNumber(value: string | undefined) {
  if (!value) return undefined;
  const normalized = value.replace(/[^0-9.+-]/g, "");
  const num = Number(normalized);
  return Number.isFinite(num) ? num : undefined;
}

function parseCount(value: string | undefined) {
  if (!value) return undefined;
  const normalized = value.trim();
  if (normalized.endsWith("+")) {
    const num = Number(normalized.slice(0, -1));
    return Number.isFinite(num) ? num : undefined;
  }
  return toNumber(normalized);
}

function parseSort(value: string | undefined): ListingSort {
  if (value && SORT_VALUES.includes(value as ListingSort)) return value as ListingSort;
  return DEFAULT_FILTERS.sort;
}

function parseView(value: string | undefined): ListingView {
  if (value && VIEW_VALUES.includes(value as ListingView)) return value as ListingView;
  return DEFAULT_FILTERS.view;
}

function parseTransaction(value: string | undefined): TransactionType | undefined {
  if (value && TRANSACTION_VALUES.includes(value as TransactionType)) return value as TransactionType;
  return undefined;
}

export function parseFiltersFromUrl(params: RawParams): FilterParseResult {
  const errors: string[] = [];

  const transactionType = parseTransaction(
    getParam(params, "transactionType") ?? getParam(params, "transaction") ?? getParam(params, "purpose")
  );
  const propertyType = clean(getParam(params, "propertyType") ?? getParam(params, "type"));
  const city = clean(getParam(params, "city"));
  const area = clean(getParam(params, "area"));

  const priceMin = toNumber(getParam(params, "priceMin") ?? getParam(params, "minPrice"));
  const priceMax = toNumber(getParam(params, "priceMax") ?? getParam(params, "maxPrice"));
  const areaMin = toNumber(getParam(params, "areaMin"));
  const areaMax = toNumber(getParam(params, "areaMax"));
  const beds = parseCount(getParam(params, "beds"));
  const baths = parseCount(getParam(params, "baths"));

  let amenities = getAllParams(params, "amenities");
  if (amenities.length === 1 && amenities[0]?.includes(",")) {
    amenities = amenities[0]
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);
  }
  const sort = parseSort(getParam(params, "sort"));
  const view = parseView(getParam(params, "view"));
  const page = Math.max(1, Math.floor(toNumber(getParam(params, "page")) ?? DEFAULT_FILTERS.page));

  let normalizedPriceMin = priceMin;
  let normalizedPriceMax = priceMax;
  if (priceMin && priceMax && priceMin > priceMax) {
    normalizedPriceMin = undefined;
    normalizedPriceMax = undefined;
    errors.push("price");
  }

  let normalizedAreaMin = areaMin;
  let normalizedAreaMax = areaMax;
  if (areaMin && areaMax && areaMin > areaMax) {
    normalizedAreaMin = undefined;
    normalizedAreaMax = undefined;
    errors.push("area");
  }

  const filters: ListingFilters = {
    transactionType,
    propertyType,
    city,
    area,
    priceMin: normalizedPriceMin,
    priceMax: normalizedPriceMax,
    areaMin: normalizedAreaMin,
    areaMax: normalizedAreaMax,
    beds,
    baths,
    amenities: amenities.length ? amenities : undefined,
    sort,
    page,
    view,
  };

  return { filters, errors };
}

export function serializeFiltersToUrl(filters: ListingFilters, overrides: Partial<ListingFilters> = {}) {
  const nextFilters = { ...filters, ...overrides };
  const params = new URLSearchParams();

  if (nextFilters.transactionType) params.set("transaction", nextFilters.transactionType);
  if (nextFilters.propertyType) params.set("type", nextFilters.propertyType);
  if (nextFilters.city) params.set("city", nextFilters.city);
  if (nextFilters.area) params.set("area", nextFilters.area);
  if (nextFilters.priceMin !== undefined) params.set("priceMin", String(nextFilters.priceMin));
  if (nextFilters.priceMax !== undefined) params.set("priceMax", String(nextFilters.priceMax));
  if (nextFilters.areaMin !== undefined) params.set("areaMin", String(nextFilters.areaMin));
  if (nextFilters.areaMax !== undefined) params.set("areaMax", String(nextFilters.areaMax));
  if (nextFilters.beds !== undefined) params.set("beds", String(nextFilters.beds));
  if (nextFilters.baths !== undefined) params.set("baths", String(nextFilters.baths));
  if (nextFilters.amenities?.length) {
    nextFilters.amenities.forEach((amenity) => params.append("amenities", amenity));
  }

  if (nextFilters.sort && nextFilters.sort !== DEFAULT_FILTERS.sort) params.set("sort", nextFilters.sort);
  if (nextFilters.view && nextFilters.view !== DEFAULT_FILTERS.view) params.set("view", nextFilters.view);
  if (nextFilters.page && nextFilters.page !== DEFAULT_FILTERS.page) params.set("page", String(nextFilters.page));

  return params;
}

export function normalizeFilters(filters: ListingFilters) {
  return {
    ...filters,
    amenities: filters.amenities ? [...filters.amenities].sort() : undefined,
  };
}

export function filtersToCacheKey(filters: ListingFilters) {
  const normalized = normalizeFilters(filters);
  return JSON.stringify(normalized);
}

export function countActiveFilters(filters: ListingFilters) {
  const { transactionType, propertyType, city, area, priceMin, priceMax, areaMin, areaMax, beds, baths, amenities } =
    filters;
  let count = 0;
  if (transactionType) count += 1;
  if (propertyType) count += 1;
  if (city) count += 1;
  if (area) count += 1;
  if (priceMin !== undefined || priceMax !== undefined) count += 1;
  if (areaMin !== undefined || areaMax !== undefined) count += 1;
  if (beds !== undefined) count += 1;
  if (baths !== undefined) count += 1;
  if (amenities && amenities.length) count += amenities.length;
  return count;
}
