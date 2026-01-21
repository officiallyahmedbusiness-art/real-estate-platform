import Link from "next/link";
import { notFound } from "next/navigation";
import { requireRole } from "@/lib/auth";
import { createSupabaseServerClient } from "@/lib/supabaseServer";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { Button, Card, Input, Select, Section, Badge } from "@/components/ui";
import { PROPERTY_TYPES, PURPOSE_OPTIONS } from "@/lib/constants";
import { getPublicImageUrl } from "@/lib/storage";
import { isUuid } from "@/lib/validators";
import { ImageUploader } from "@/components/ImageUploader";
import { deleteImageAction, deleteListingAction, updateListingAction } from "../../actions";

export default async function DeveloperListingEditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  if (!isUuid(id)) notFound();

  const { role } = await requireRole(
    ["developer", "partner", "admin"],
    `/developer/listings/${id}`
  );
  const supabase = await createSupabaseServerClient();
  const isAdmin = role === "admin";

  const { data: listing } = await supabase
    .from("listings")
    .select(
      "id, title, price, currency, city, area, address, beds, baths, size_m2, description, amenities, status, purpose, type, listing_images(path, sort)"
    )
    .eq("id", id)
    .maybeSingle();

  if (!listing) notFound();

  const images = (listing.listing_images ?? []).sort((a, b) => a.sort - b.sort);

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      <SiteHeader />
      <main dir="rtl" className="mx-auto w-full max-w-6xl px-6 py-10 space-y-10">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold">إدارة الإعلان</h1>
            <p className="text-sm text-white/60">{listing.title}</p>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/developer">
              <Button size="sm" variant="ghost">
                العودة للبوابة
              </Button>
            </Link>
            <Badge>{listing.status}</Badge>
          </div>
        </div>

        <Section title="تفاصيل الإعلان" subtitle="قم بتحديث البيانات الأساسية">
          <Card>
            <form action={updateListingAction} className="grid gap-4 md:grid-cols-3">
              <input type="hidden" name="listing_id" value={listing.id} />
              <Input name="title" defaultValue={listing.title} required />
              <Select name="type" defaultValue={listing.type}>
                {PROPERTY_TYPES.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </Select>
              <Select name="purpose" defaultValue={listing.purpose}>
                {PURPOSE_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </Select>
              <Input name="price" defaultValue={String(listing.price)} required />
              <Input name="currency" defaultValue={listing.currency} />
              <Input name="city" defaultValue={listing.city} required />
              <Input name="area" defaultValue={listing.area ?? ""} />
              <Input name="address" defaultValue={listing.address ?? ""} />
              <Input name="beds" defaultValue={String(listing.beds)} />
              <Input name="baths" defaultValue={String(listing.baths)} />
              <Input name="size_m2" defaultValue={listing.size_m2 ? String(listing.size_m2) : ""} />
              <Input
                name="amenities"
                defaultValue={(listing.amenities as string[] | null | undefined)?.join(", ") ?? ""}
              />
              <Select name="status" defaultValue={listing.status}>
                <option value="draft">مسودة</option>
                {isAdmin ? <option value="published">منشور</option> : null}
                <option value="archived">مؤرشف</option>
              </Select>
              <div className="md:col-span-3">
                <textarea
                  name="description"
                  defaultValue={listing.description ?? ""}
                  className="min-h-[120px] w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-amber-300/40"
                />
              </div>
              <div className="md:col-span-3 flex justify-end gap-3">
                <Button type="submit">تحديث الإعلان</Button>
                <Button type="submit" variant="danger" formAction={deleteListingAction}>
                  حذف الإعلان
                </Button>
              </div>
            </form>
          </Card>
        </Section>

        <Section title="صور الإعلان" subtitle="إدارة معرض الصور">
          <Card className="space-y-4">
            <ImageUploader listingId={listing.id} existingCount={images.length} />
            <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
              {images.map((img) => {
                const url = getPublicImageUrl(img.path);
                if (!url) return null;
                return (
                  <div key={img.path} className="space-y-2">
                    <div className="aspect-[4/3] overflow-hidden rounded-xl bg-white/5">
                      <img src={url} alt="صورة" className="h-full w-full object-cover" />
                    </div>
                    <form action={deleteImageAction}>
                      <input type="hidden" name="listing_id" value={listing.id} />
                      <input type="hidden" name="path" value={img.path} />
                      <Button type="submit" size="sm" variant="ghost" className="w-full">
                        حذف الصورة
                      </Button>
                    </form>
                  </div>
                );
              })}
            </div>
          </Card>
        </Section>
      </main>
      <SiteFooter />
    </div>
  );
}
