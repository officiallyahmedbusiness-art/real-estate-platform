import { notFound } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabaseServer";
import { requireRole } from "@/lib/auth";
import { Badge } from "@/components/ui";
import { formatPrice } from "@/lib/format";
import { isUuid } from "@/lib/validators";
import { createT, getPropertyTypeLabelKey, getPurposeLabelKey } from "@/lib/i18n";
import { getServerLocale } from "@/lib/i18n.server";

export default async function StaffPrintPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  if (!isUuid(id)) notFound();

  await requireRole(["owner", "admin", "ops", "staff", "agent"], `/staff/units/${id}/print`);

  const locale = await getServerLocale();
  const t = createT(locale);

  const supabase = await createSupabaseServerClient();
  const { data: listing } = await supabase
    .from("listings")
    .select(
      "id, title, price, currency, city, area, address, beds, baths, size_m2, description, purpose, type, status"
    )
    .eq("id", id)
    .maybeSingle();
  if (!listing) notFound();

  const { data: attachmentsData } = await supabase
    .from("unit_attachments")
    .select("id, file_path, file_type, sort_order, is_primary, bucket")
    .eq("listing_id", listing.id)
    .eq("is_published", true)
    .eq("file_type", "image")
    .order("is_primary", { ascending: false })
    .order("sort_order", { ascending: true })
    .limit(6);

  const attachments = await Promise.all(
    (attachmentsData ?? []).map(async (item) => {
      const { data: signed } = await supabase.storage
        .from(item.bucket ?? "property-attachments")
        .createSignedUrl(item.file_path, 60 * 60);
      return {
        ...item,
        signed_url: signed?.signedUrl ?? null,
      };
    })
  );

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  const shareUrl = `${baseUrl}/share/${listing.id}`;
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(
    shareUrl
  )}`;

  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--text)] print-page">
      <div className="mx-auto w-full max-w-4xl space-y-6 px-6 py-10">
        <div className="flex items-start justify-between gap-6">
          <div className="space-y-2">
            <p className="text-xs text-[var(--muted)]">HRTAJ REAL ESTATE</p>
            <h1 className="text-3xl font-semibold">{listing.title}</h1>
            <div className="flex flex-wrap items-center gap-2">
              <Badge>{t(getPurposeLabelKey(listing.purpose))}</Badge>
              <Badge>{t(getPropertyTypeLabelKey(listing.type))}</Badge>
              <Badge>
                {listing.beds} {t("detail.stats.rooms")} - {listing.baths} {t("detail.stats.baths")}
              </Badge>
            </div>
            <p className="text-sm text-[var(--muted)]">
              {listing.city}
              {listing.area ? ` - ${listing.area}` : ""}
              {listing.address ? ` - ${listing.address}` : ""}
            </p>
            <p className="text-2xl font-semibold text-[var(--accent)]">
              {formatPrice(listing.price, listing.currency, locale)}
            </p>
          </div>
          <div className="flex flex-col items-center gap-2">
            <img src={qrUrl} alt="QR" className="h-36 w-36 rounded-xl border border-[var(--border)]" />
            <p className="text-xs text-[var(--muted)]">{shareUrl}</p>
          </div>
        </div>

        <div className="grid gap-3 md:grid-cols-3">
          {attachments.map((img) => (
            <div
              key={img.id}
              className="aspect-[4/3] overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--surface)]"
            >
              {img.signed_url ? (
                <img src={img.signed_url} alt={listing.title} className="h-full w-full object-cover" />
              ) : null}
            </div>
          ))}
        </div>

        <div className="space-y-2">
          <h2 className="text-lg font-semibold">{t("detail.description.title")}</h2>
          <p className="text-sm text-[var(--muted)]">
            {listing.description || t("detail.description.empty")}
          </p>
        </div>
      </div>
    </div>
  );
}
