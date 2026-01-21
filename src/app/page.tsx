import Link from "next/link";
import { createSupabaseServerClient } from "@/lib/supabaseServer";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { Button, Card, Input, Select, Badge, Section } from "@/components/ui";
import { formatPrice } from "@/lib/format";
import { FEATURE_CATEGORIES, PURPOSE_OPTIONS } from "@/lib/constants";
import { getPublicImageUrl } from "@/lib/storage";

export default async function Home() {
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase
    .from("listings")
    .select(
      "id, title, price, currency, city, area, purpose, type, beds, baths, listing_images(path, sort)"
    )
    .eq("status", "published")
    .order("created_at", { ascending: false })
    .limit(6);
  const listings = data ?? [];

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      <SiteHeader />
      <main dir="rtl" className="mx-auto w-full max-w-6xl px-6 py-10 space-y-12">
        <section className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-zinc-950 via-zinc-900 to-amber-950 p-10">
          <div className="absolute inset-0 opacity-30">
            <div className="absolute -top-32 left-10 h-64 w-64 rounded-full bg-amber-400/20 blur-3xl" />
            <div className="absolute -bottom-40 right-10 h-72 w-72 rounded-full bg-amber-200/10 blur-3xl" />
          </div>
          <div className="relative z-10 grid gap-8 lg:grid-cols-[1.2fr,0.8fr]">
            <div className="space-y-4">
              <Badge>سوق العقارات الذكي</Badge>
              <h1 className="text-3xl font-semibold leading-relaxed">
                اعثر على وحدتك القادمة بسهولة، من الشقق الحديثة إلى المشاريع الجديدة.
              </h1>
              <p className="text-sm text-white/60">
                منصة تجمع الإعلانات الموثقة، تواصل مباشر، وإدارة كاملة للمطورين والشركاء.
              </p>
              <div className="flex flex-wrap gap-3">
                <Link href="/listings">
                  <Button size="lg">استعرض الإعلانات</Button>
                </Link>
                <Link href="/developer">
                  <Button size="lg" variant="ghost">
                    بوابة المطور
                  </Button>
                </Link>
              </div>
            </div>
            <Card className="space-y-4">
              <h2 className="text-lg font-semibold">ابحث سريعًا</h2>
              <form action="/listings" className="space-y-3">
                <Input name="city" placeholder="المدينة" />
                <Input name="area" placeholder="الحي / المنطقة" />
                <Select name="purpose" defaultValue="">
                  <option value="">الغرض</option>
                  {PURPOSE_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </Select>
                <div className="grid grid-cols-2 gap-3">
                  <Input name="minPrice" placeholder="السعر الأدنى" />
                  <Input name="maxPrice" placeholder="السعر الأعلى" />
                </div>
                <Button type="submit" className="w-full">
                  ابحث الآن
                </Button>
              </form>
            </Card>
          </div>
        </section>

        <Section title="الأقسام" subtitle="تصفح حسب نوع الإعلان">
          <div className="grid gap-4 md:grid-cols-3">
            {FEATURE_CATEGORIES.map((cat) => (
              <Link key={cat.purpose} href={`/listings?purpose=${cat.purpose}`}>
                <Card className="hover:border-amber-200/30">
                  <h3 className="text-lg font-semibold">{cat.title}</h3>
                  <p className="text-sm text-white/60">
                    إعلانات محدثة ومناسبة لاحتياجاتك.
                  </p>
                </Card>
              </Link>
            ))}
          </div>
        </Section>

        <Section title="إعلانات مميزة" subtitle="أحدث الإعلانات المنشورة">
          <div className="grid gap-6 md:grid-cols-3">
            {listings.map((listing) => {
              const cover =
                listing.listing_images?.sort((a, b) => a.sort - b.sort)[0]?.path ?? null;
              const coverUrl = getPublicImageUrl(cover);
              return (
                <Card key={listing.id} className="flex flex-col gap-4">
                  <Link href={`/listing/${listing.id}`}>
                    <div className="aspect-[4/3] overflow-hidden rounded-xl bg-white/5">
                      {coverUrl ? (
                        <img
                          src={coverUrl}
                          alt={listing.title}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center text-sm text-white/40">
                          لا توجد صورة
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
                      <h3 className="text-lg font-semibold hover:text-amber-200">
                        {listing.title}
                      </h3>
                    </Link>
                    <p className="text-sm text-white/60">
                      {listing.city}
                      {listing.area ? ` • ${listing.area}` : ""}
                    </p>
                    <p className="text-lg font-semibold text-amber-200">
                      {formatPrice(listing.price, listing.currency)}
                    </p>
                  </div>
                </Card>
              );
            })}
          </div>
        </Section>
      </main>
      <SiteFooter />
    </div>
  );
}
