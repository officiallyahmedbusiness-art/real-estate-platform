import Link from "next/link";
import { notFound } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabaseServer";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { Button, Card, Badge, Input, Textarea } from "@/components/ui";
import { formatPrice } from "@/lib/format";
import { createLeadAction } from "@/app/actions/marketplace";
import { isUuid } from "@/lib/validators";
import { createT, getPropertyTypeLabelKey, getPurposeLabelKey } from "@/lib/i18n";
import { getServerLocale } from "@/lib/i18n.server";

export default async function PublicSharePage({
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
      "id, title, price, currency, city, area, address, beds, baths, size_m2, description, purpose, type, status"
    )
    .eq("id", id)
    .eq("status", "published")
    .maybeSingle();

  if (!listing) notFound();

  const { data: attachmentsData } = await supabase
    .from("unit_attachments")
    .select("id, file_path, file_type, category, sort_order, is_primary, title, is_published, bucket")
    .eq("listing_id", listing.id)
    .eq("is_published", true)
    .order("is_primary", { ascending: false })
    .order("sort_order", { ascending: true });

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

  const imageAttachments = attachments.filter(
    (item) => item.file_type === "image" && item.signed_url
  );
  const docAttachments = attachments.filter(
    (item) => item.file_type !== "image" && item.signed_url
  );

  const coverUrl = imageAttachments[0]?.signed_url ?? null;

  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--text)]">
      <SiteHeader />
      <main className="mx-auto w-full max-w-6xl space-y-8 px-6 py-10">
        <div className="space-y-2">
          <h1 className="text-3xl font-semibold">{t("share.title")}</h1>
          <p className="text-sm text-[var(--muted)]">{t("share.subtitle")}</p>
        </div>

        <Card className="space-y-6 hrtaj-card">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <Badge>{t(getPurposeLabelKey(listing.purpose))}</Badge>
                <Badge>{t(getPropertyTypeLabelKey(listing.type))}</Badge>
                <Badge>
                  {listing.beds} {t("detail.stats.rooms")} - {listing.baths} {t("detail.stats.baths")}
                </Badge>
              </div>
              <h2 className="text-2xl font-semibold">{listing.title}</h2>
              <p className="text-sm text-[var(--muted)]">
                {listing.city}
                {listing.area ? ` - ${listing.area}` : ""}
                {listing.address ? ` - ${listing.address}` : ""}
              </p>
            </div>
            <p className="text-2xl font-semibold text-[var(--accent)]">
              {formatPrice(listing.price, listing.currency, locale)}
            </p>
          </div>

          <div className="grid gap-4 lg:grid-cols-[2fr,1fr]">
            <div className="space-y-4">
              <div className="aspect-[16/9] overflow-hidden rounded-2xl bg-[var(--surface)]">
                {coverUrl ? (
                  <img src={coverUrl} alt={listing.title} className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full items-center justify-center text-sm text-[var(--muted)]">
                    {t("listing.card.noImage")}
                  </div>
                )}
              </div>
              <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                {imageAttachments.slice(0, 8).map((img) => (
                  <div
                    key={img.id}
                    className="aspect-[4/3] overflow-hidden rounded-xl bg-[var(--surface)]"
                  >
                    <img src={img.signed_url ?? ""} alt={listing.title} className="h-full w-full object-cover" />
                  </div>
                ))}
              </div>
            </div>
            <Card className="space-y-4 hrtaj-card">
              <h3 className="text-lg font-semibold">{t("share.request")}</h3>
              <form action={createLeadAction} className="space-y-3">
                <input
                  type="text"
                  name="company"
                  tabIndex={-1}
                  autoComplete="off"
                  className="sr-only"
                  aria-hidden="true"
                />
                <input type="hidden" name="listingId" value={listing.id} />
                <input type="hidden" name="source" value="web" />
                <Input name="name" placeholder={t("detail.lead.name")} required />
                <Input name="phone" placeholder={t("detail.lead.phone")} />
                <Input name="email" placeholder={t("detail.lead.email")} type="email" />
                <Textarea name="message" placeholder={t("detail.lead.message")} />
                <Button type="submit" className="w-full">
                  {t("detail.lead.submit")}
                </Button>
                <Link href="/listings" className="text-xs text-[var(--muted)] underline">
                  {t("detail.back")}
                </Link>
              </form>
            </Card>
          </div>

          {docAttachments.length ? (
            <div className="space-y-3">
              <h3 className="text-lg font-semibold">{t("staff.attachments.title")}</h3>
              <div className="grid gap-3 md:grid-cols-2">
                {docAttachments.map((doc) => (
                  <a
                    key={doc.id}
                    href={doc.signed_url ?? "#"}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center justify-between rounded-xl border border-[var(--border)] bg-[var(--surface)] px-4 py-3 text-sm"
                  >
                    <span>{doc.title ?? t("staff.attachments.fileType")}</span>
                    <Badge>{doc.file_type}</Badge>
                  </a>
                ))}
              </div>
            </div>
          ) : null}
        </Card>
      </main>
      <SiteFooter showFloating />
    </div>
  );
}
