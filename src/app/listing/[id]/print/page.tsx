import { notFound } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabaseServer";
import { createT } from "@/lib/i18n";
import { getServerLocale } from "@/lib/i18n.server";
import { formatPrice } from "@/lib/format";
import { getPublicImageUrl } from "@/lib/storage";
import { isUuid } from "@/lib/validators";
import { Logo } from "@/components/Logo";
import { getPublicBaseUrl } from "@/lib/paths";

export default async function ListingPrintPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  if (!isUuid(id)) notFound();

  const locale = await getServerLocale();
  const t = createT(locale);

  const supabase = await createSupabaseServerClient();
  const { data: listing } = await supabase
    .from("listings")
    .select(
      "id, title, price, currency, city, area, address, beds, baths, size_m2, description, amenities, purpose, type, status, listing_images(path, sort)"
    )
    .eq("id", id)
    .maybeSingle();

  if (!listing || listing.status !== "published") notFound();

  const images = (listing.listing_images ?? []).sort((a, b) => a.sort - b.sort);
  const coverUrl = getPublicImageUrl(images[0]?.path);

  const siteUrl = getPublicBaseUrl();
  const shareUrl = siteUrl ? `${siteUrl}/share/${listing.id}` : `/share/${listing.id}`;

  return (
    <div className="min-h-screen bg-white text-slate-900 print-page">
      <div className="mx-auto w-full max-w-5xl space-y-6 px-8 py-10">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-4">
          <Logo name={t("brand.name")} imageClassName="h-10" className="text-slate-900" />
          <div className="text-sm text-slate-500">
            {t("print.title")}
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-[1.3fr,0.7fr]">
          <div className="space-y-4">
            <div className="aspect-[16/9] overflow-hidden rounded-2xl bg-slate-100">
              {coverUrl ? (
                <img src={coverUrl} alt={listing.title} className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full items-center justify-center text-sm text-slate-500">
                  {t("listing.card.noImage")}
                </div>
              )}
            </div>
            <div className="grid gap-2">
              <h1 className="text-2xl font-semibold">{listing.title}</h1>
              <p className="text-sm text-slate-500">
                {listing.city}
                {listing.area ? ` - ${listing.area}` : ""}
                {listing.address ? ` - ${listing.address}` : ""}
              </p>
              <p className="text-xl font-semibold text-slate-900">
                {formatPrice(listing.price, listing.currency, locale)}
              </p>
            </div>
          </div>

          <div className="space-y-4 rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <div>
              <p className="text-xs text-slate-500">{t("detail.stats.area")}</p>
              <p className="text-lg font-semibold">
                {listing.size_m2 ? `${listing.size_m2} m2` : t("detail.stats.unknown")}
              </p>
            </div>
            <div>
              <p className="text-xs text-slate-500">{t("detail.stats.rooms")}</p>
              <p className="text-lg font-semibold">{listing.beds}</p>
            </div>
            <div>
              <p className="text-xs text-slate-500">{t("detail.stats.baths")}</p>
              <p className="text-lg font-semibold">{listing.baths}</p>
            </div>
            <div>
              <p className="text-xs text-slate-500">{t("print.share")}</p>
              <p className="text-sm break-all text-slate-700">{shareUrl}</p>
            </div>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-2xl border border-slate-200 bg-white p-4">
            <h2 className="text-lg font-semibold">{t("detail.description.title")}</h2>
            <p className="mt-2 text-sm text-slate-600">
              {listing.description || t("detail.description.empty")}
            </p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-4">
            <h2 className="text-lg font-semibold">{t("detail.amenities.title")}</h2>
            <div className="mt-3 flex flex-wrap gap-2 text-sm text-slate-600">
              {(listing.amenities as string[] | null | undefined)?.length ? (
                (listing.amenities as string[]).map((item) => (
                  <span key={item} className="rounded-full border border-slate-200 px-3 py-1">
                    {item}
                  </span>
                ))
              ) : (
                <span>{t("detail.amenities.empty")}</span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
