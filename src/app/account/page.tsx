import Link from "next/link";
import { requireAuth } from "@/lib/auth";
import { createSupabaseServerClient } from "@/lib/supabaseServer";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { Button, Card, Input, Badge, Section } from "@/components/ui";
import { formatPrice } from "@/lib/format";
import { getPublicImageUrl } from "@/lib/storage";
import { updateProfileAction } from "./actions";

export default async function AccountPage() {
  const { user, profile } = await requireAuth("/account");
  const supabase = await createSupabaseServerClient();

  const { data: favoritesData } = await supabase
    .from("favorites")
    .select(
      "listing_id, listings(id, title, price, currency, city, area, purpose, type, listing_images(path, sort))"
    )
    .eq("user_id", user.id);
  const favorites = favoritesData ?? [];

  const { data: leadsData } = await supabase
    .from("leads")
    .select("id, name, phone, email, message, created_at, listing_id, listings(title)")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(20);
  const leads = leadsData ?? [];

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      <SiteHeader />
      <main dir="rtl" className="mx-auto w-full max-w-6xl px-6 py-10 space-y-10">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold">حسابي</h1>
            <p className="text-sm text-white/60">تحديث البيانات الأساسية.</p>
          </div>
          <Badge>{profile?.role ?? "user"}</Badge>
        </div>

        <Card>
          <form action={updateProfileAction} className="grid gap-4 md:grid-cols-2">
            <div className="md:col-span-2">
              <label className="text-sm text-white/70">الاسم الكامل</label>
              <Input name="full_name" defaultValue={profile?.full_name ?? ""} required />
            </div>
            <div>
              <label className="text-sm text-white/70">رقم الهاتف</label>
              <Input name="phone" defaultValue={profile?.phone ?? ""} />
            </div>
            <div className="md:col-span-2 flex justify-end">
              <Button type="submit">حفظ التغييرات</Button>
            </div>
          </form>
        </Card>

        <Section title="المفضلات" subtitle="إعلانات قمت بحفظها">
          {favorites.length === 0 ? (
            <Card>
              <p className="text-sm text-white/60">
                لم تقم بحفظ أي إعلان بعد.{" "}
                <Link href="/listings" className="underline">
                  تصفح الإعلانات
                </Link>
              </p>
            </Card>
          ) : (
            <div className="grid gap-6 md:grid-cols-2">
              {favorites.map((fav) => {
                const listing = Array.isArray(fav.listings)
                  ? fav.listings[0]
                  : fav.listings;
                if (!listing) return null;
                const cover =
                  listing.listing_images?.sort((a, b) => a.sort - b.sort)[0]?.path ?? null;
                const coverUrl = getPublicImageUrl(cover);
                return (
                  <Card key={listing.id} className="flex gap-4">
                    <div className="h-24 w-28 overflow-hidden rounded-xl bg-white/5">
                      {coverUrl ? (
                        <img
                          src={coverUrl}
                          alt={listing.title}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center text-xs text-white/40">
                          بدون صورة
                        </div>
                      )}
                    </div>
                    <div className="flex-1 space-y-2">
                      <Link href={`/listing/${listing.id}`}>
                        <h3 className="text-base font-semibold hover:text-amber-200">
                          {listing.title}
                        </h3>
                      </Link>
                      <p className="text-xs text-white/60">
                        {listing.city}
                        {listing.area ? ` • ${listing.area}` : ""}
                      </p>
                      <p className="text-sm text-amber-200">
                        {formatPrice(listing.price, listing.currency)}
                      </p>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </Section>

        <Section title="طلباتي" subtitle="استفساراتي المرسلة">
          {leads.length === 0 ? (
            <Card>
              <p className="text-sm text-white/60">لا توجد طلبات مرسلة بعد.</p>
            </Card>
          ) : (
            <div className="grid gap-4">
              {leads.map((lead) => {
                const listing = Array.isArray(lead.listings)
                  ? lead.listings[0]
                  : lead.listings;
                return (
                  <Card key={lead.id} className="space-y-2">
                    <p className="text-sm text-white/60">
                      الإعلان: {listing?.title ?? lead.listing_id}
                    </p>
                    <p className="text-base font-semibold">{lead.name}</p>
                    <p className="text-xs text-white/50">{lead.email ?? "—"}</p>
                    <p className="text-xs text-white/50">{lead.phone ?? "—"}</p>
                    {lead.message ? (
                      <p className="text-sm text-white/70">{lead.message}</p>
                    ) : null}
                  </Card>
                );
              })}
            </div>
          )}
        </Section>
      </main>
      <SiteFooter />
    </div>
  );
}
