export type ListingSort = "newest" | "price_asc" | "price_desc" | "area_asc" | "area_desc";
export type ListingView = "grid" | "list";
export type TransactionType = "sale" | "rent" | "new-development";

export type ListingFilters = {
  transactionType?: TransactionType;
  propertyType?: string;
  city?: string;
  area?: string;
  priceMin?: number;
  priceMax?: number;
  areaMin?: number;
  areaMax?: number;
  beds?: number;
  baths?: number;
  amenities?: string[];
  sort: ListingSort;
  page: number;
  view: ListingView;
};

export type FilterParseResult = {
  filters: ListingFilters;
  errors: string[];
};

export const DEFAULT_FILTERS: ListingFilters = {
  sort: "newest",
  page: 1,
  view: "grid",
};

export const SORT_VALUES: ListingSort[] = ["newest", "price_asc", "price_desc", "area_asc", "area_desc"];
export const VIEW_VALUES: ListingView[] = ["grid", "list"];
export const TRANSACTION_VALUES: TransactionType[] = ["sale", "rent", "new-development"];
