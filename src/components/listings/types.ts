export type ListingImage = {
  path: string;
  sort: number;
};

export type ListingCardData = {
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
  is_furnished?: boolean | null;
  is_new?: boolean | null;
  listing_images?: ListingImage[] | null;
};
