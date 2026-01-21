import Link from "next/link";
import { createSupabaseServerClient } from "@/lib/supabaseServer";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { Button, Card, Input, Select, Badge } from "@/components/ui";
import { formatNumber, formatPrice } from "@/lib/format";
import { getPublicImageUrl } from "@/lib/storage";
import { PROPERTY_TYPES, PURPOSE_OPTIONS, SORT_OPTIONS } from "@/lib/constants";
import { toggleFavoriteAction } from "@/app/actions/marketplace";

type SearchParams = Record<string, string | string[] | undefined>;

function getParam(searchParams: SearchParams, key: string) {
  const value = searchParams[key];
  return Array.isArray(value) ? value[0] : value ?? "";
}

export default async function ListingsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
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

  const { data, count = 0 } = await query.limit(36);
  const listings = data ?? [];
  const { data: auth } = await supabase.auth.getUser();

  let favoriteIds = new Set<string>();
  if (auth?.user) {
    const { data: favorites } = await supabase
      .from("favorites")
      .select("listing_id")
      .eq("user_id", auth.user.id);
    favoriteIds = new Set((favorites ?? []).map((fav) => fav.listing_id));
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      <SiteHeader />
      <main dir="rtl" className="mx-auto w-full max-w-6xl px-6 py-10">
        <div className="flex flex-col gap-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-semibold">الإعلانات العقارية</h1>
              <p className="text-sm text-white/60">
                نتائج مطابقة للبحث: {formatNumber(count)} إعلان
              </p>
            </div>
            <Link href="/auth?next=/listings">
              <Button variant="ghost" size="sm">
                حفظ المفضلات
              </Button>
            </Link>
          </div>

          <Card>
            <form className="grid gap-4 md:grid-cols-4">
              <Input name="city" placeholder="المدينة" defaultValue={city} />
              <Input name="area" placeholder="الحي / المنطقة" defaultValue={area} />
              <Select name="purpose" defaultValue={purpose}>
                <option value="">الغرض</option>
                {PURPOSE_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </Select>
              <Select name="type" defaultValue={type}>
                <option value="">نوع العقار</option>
                {PROPERTY_TYPES.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </Select>
              <Input name="minPrice" placeholder="السعر الأدنى" defaultValue={minPrice} />
              <Input name="maxPrice" placeholder="السعر الأعلى" defaultValue={maxPrice} />
              <Input name="beds" placeholder="غرف نوم" defaultValue={beds} />
              <Input name="baths" placeholder="حمامات" defaultValue={baths} />
              <Select name="sort" defaultValue={sort}>
                {SORT_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </Select>
              <div className="md:col-span-3" />
              <Button type="submit" size="md">
                بحث الآن
              </Button>
            </form>
          </Card>

          <div className="grid gap-6 md:grid-cols-2">
            {listings.map((listing) => {
              const cover =
                listing.listing_images?.sort((a, b) => a.sort - b.sort)[0]?.path ?? null;
              const coverUrl = getPublicImageUrl(cover);
              const isFavorite = favoriteIds.has(listing.id);
              const toggleAction = toggleFavoriteAction.bind(null, listing.id, "/listings");

              return (
                <Card key={listing.id} className="flex flex-col gap-4">
                  <Link href={`/listing/${listing.id}`}>
                    <div className="aspect-[16/9] overflow-hidden rounded-xl bg-white/5">
                      {coverUrl ? (
                        <img
                          src={coverUrl}
                          alt={listing.title}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-sm text-white/40">
                          لا توجد صورة بعد
                        </div>
                      )}
                    </div>
                  </Link>
                  <div className="space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge>{listing.purpose}</Badge>
                      <Badge>{listing.type}</Badge>
                      <Badge>
                        {listing.beds} غرف • {listing.baths} حمام
                      </Badge>
                    </div>
                    <Link href={`/listing/${listing.id}`}>
                      <h3 className="text-lg font-semibold text-white hover:text-amber-200">
                        {listing.title}
                      </h3>
                    </Link>
                    <p className="text-sm text-white/60">
                      {listing.city}
                      {listing.area ? ` • ${listing.area}` : ""}
                    </p>
                    <p className="text-xl font-semibold text-amber-200">
                      {formatPrice(listing.price, listing.currency)}
                    </p>
                    <div className="flex flex-wrap items-center gap-3">
                      <Link href={`/listing/${listing.id}`}>
                        <Button size="sm" variant="secondary">
                          عرض التفاصيل
                        </Button>
                      </Link>
                      <form action={toggleAction}>
                        <Button size="sm" variant={isFavorite ? "primary" : "ghost"}>
                          {isFavorite ? "محفوظ" : "حفظ"}
                        </Button>
                      </form>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
