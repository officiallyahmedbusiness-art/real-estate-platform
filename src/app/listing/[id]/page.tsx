import Link from "next/link";
import { notFound } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabaseServer";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { Button, Card, Badge, Input, Textarea } from "@/components/ui";
import { formatPrice } from "@/lib/format";
import { getPublicImageUrl } from "@/lib/storage";
import { toggleFavoriteAction, createLeadAction } from "@/app/actions/marketplace";
import { isUuid } from "@/lib/validators";

export default async function ListingDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  if (!isUuid(id)) notFound();

  const supabase = await createSupabaseServerClient();
  const { data: listing } = await supabase
    .from("listings")
    .select(
      "id, title, price, currency, city, area, address, beds, baths, size_m2, description, amenities, purpose, type, status, owner_user_id, developer_id, listing_images(path, sort)"
    )
    .eq("id", id)
    .maybeSingle();

  if (!listing) notFound();

  const { data: auth } = await supabase.auth.getUser();
  const userId = auth?.user?.id ?? null;

  let isDeveloperMember = false;
  if (userId && listing.developer_id) {
    const { data: member } = await supabase
      .from("developer_members")
      .select("developer_id")
      .eq("developer_id", listing.developer_id)
      .eq("user_id", userId)
      .maybeSingle();
    isDeveloperMember = Boolean(member);
  }

  const { data: profile } = userId
    ? await supabase
        .from("profiles")
        .select("role, full_name, phone")
        .eq("id", userId)
        .maybeSingle()
    : { data: null };

  const isAdmin = profile?.role === "admin";
  const isOwner = userId ? listing.owner_user_id === userId : false;

  if (listing.status !== "published" && !isOwner && !isAdmin && !isDeveloperMember) {
    notFound();
  }

  const { data: ownerProfile } = await supabase
    .from("profiles")
    .select("full_name, phone")
    .eq("id", listing.owner_user_id)
    .maybeSingle();

  const images = (listing.listing_images ?? []).sort((a, b) => a.sort - b.sort);
  const coverUrl = getPublicImageUrl(images[0]?.path);

  let isFavorite = false;
  if (userId) {
    const { data: fav } = await supabase
      .from("favorites")
      .select("listing_id")
      .eq("user_id", userId)
      .eq("listing_id", listing.id)
      .maybeSingle();
    isFavorite = Boolean(fav);
  }

  const toggleAction = toggleFavoriteAction.bind(null, listing.id, `/listing/${listing.id}`);

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      <SiteHeader />
      <main dir="rtl" className="mx-auto w-full max-w-6xl px-6 py-10 space-y-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <Badge>{listing.purpose}</Badge>
              <Badge>{listing.type}</Badge>
              <Badge>
                {listing.beds} غرف • {listing.baths} حمام
              </Badge>
            </div>
            <h1 className="text-3xl font-semibold">{listing.title}</h1>
            <p className="text-white/60">
              {listing.city}
              {listing.area ? ` • ${listing.area}` : ""}
              {listing.address ? ` • ${listing.address}` : ""}
            </p>
          </div>
          <div className="space-y-2 text-right">
            <p className="text-3xl font-semibold text-amber-200">
              {formatPrice(listing.price, listing.currency)}
            </p>
            <div className="flex flex-wrap items-center justify-end gap-3">
              <Link href="/listings">
                <Button size="sm" variant="secondary">
                  العودة للإعلانات
                </Button>
              </Link>
              <form action={toggleAction}>
                <Button size="sm" variant={isFavorite ? "primary" : "ghost"}>
                  {isFavorite ? "محفوظ" : "حفظ"}
                </Button>
              </form>
            </div>
          </div>
        </div>

        <Card className="space-y-6">
          <div className="grid gap-4 lg:grid-cols-[2fr,1fr]">
            <div className="space-y-4">
              <div className="aspect-[16/9] overflow-hidden rounded-2xl bg-white/5">
                {coverUrl ? (
                  <img src={coverUrl} alt={listing.title} className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full items-center justify-center text-sm text-white/40">
                    لا توجد صورة مرفوعة
                  </div>
                )}
              </div>
              <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                {images.slice(0, 8).map((img) => {
                  const url = getPublicImageUrl(img.path);
                  if (!url) return null;
                  return (
                    <div
                      key={img.path}
                      className="aspect-[4/3] overflow-hidden rounded-xl bg-white/5"
                    >
                      <img src={url} alt="صورة العقار" className="h-full w-full object-cover" />
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="space-y-4">
              <Card className="space-y-3">
                <h3 className="text-lg font-semibold">المطور / المالك</h3>
                <p className="text-sm text-white/70">
                  {ownerProfile?.full_name ?? "عميل موثّق"}
                </p>
                <p className="text-sm text-white/50">
                  {ownerProfile?.phone ? `📞 ${ownerProfile.phone}` : "بيانات التواصل محفوظة"}
                </p>
              </Card>
              <Card className="space-y-3">
                <h3 className="text-lg font-semibold">الموقع على الخريطة</h3>
                <div className="flex h-32 items-center justify-center rounded-xl border border-dashed border-white/10 text-sm text-white/40">
                  سيتم إضافة الخريطة هنا
                </div>
              </Card>
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            <div className="md:col-span-2 space-y-4">
              <div>
                <h2 className="text-xl font-semibold">وصف العقار</h2>
                <p className="mt-2 text-sm text-white/70">
                  {listing.description || "لا يوجد وصف بعد."}
                </p>
              </div>
              <div>
                <h2 className="text-xl font-semibold">المميزات</h2>
                <div className="mt-3 flex flex-wrap gap-2">
                  {(listing.amenities as string[] | null | undefined)?.length ? (
                    (listing.amenities as string[]).map((item) => (
                      <Badge key={item}>{item}</Badge>
                    ))
                  ) : (
                    <p className="text-sm text-white/50">لا توجد مميزات مضافة.</p>
                  )}
                </div>
              </div>
            </div>

            <Card className="space-y-4">
              <h3 className="text-lg font-semibold">تواصل مع المعلن</h3>
              <form action={createLeadAction} className="space-y-3">
                <input type="hidden" name="listingId" value={listing.id} />
                <input type="hidden" name="source" value="listing-detail" />
                <Input name="name" placeholder="الاسم الكامل" required />
                <Input name="phone" placeholder="رقم الهاتف" />
                <Input name="email" placeholder="البريد الإلكتروني" type="email" />
                <Textarea name="message" placeholder="رسالتك للمعلن" />
                <Button type="submit" size="md" className="w-full">
                  إرسال الطلب
                </Button>
                {!userId ? (
                  <p className="text-xs text-white/50">
                    يمكنك الإرسال كضيف، أو{" "}
                    <Link href={`/auth?next=/listing/${listing.id}`} className="underline">
                      تسجيل الدخول
                    </Link>{" "}
                    لحفظ بياناتك.
                  </p>
                ) : null}
              </form>
            </Card>
          </div>
        </Card>
      </main>
      <SiteFooter />
    </div>
  );
}
