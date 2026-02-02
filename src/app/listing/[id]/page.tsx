import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabaseServer";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { Button, Card, Badge, Input, Textarea } from "@/components/ui";
import { formatPrice } from "@/lib/format";
import { getPublicImageUrl } from "@/lib/storage";
import { createLeadAction } from "@/app/actions/marketplace";
import { isUuid } from "@/lib/validators";
import { createT, getPropertyTypeLabelKey, getPurposeLabelKey } from "@/lib/i18n";
import { getServerLocale } from "@/lib/i18n.server";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const locale = await getServerLocale();
  const t = createT(locale);

  if (!isUuid(id)) {
    return { title: `${t("brand.name")} | ${t("detail.description.title")}` };
  }

  const supabase = await createSupabaseServerClient();
  const { data: listing } = await supabase
    .from("listings")
    .select("title, city, area")
    .eq("id", id)
    .maybeSingle();

  if (!listing) {
    return { title: `${t("brand.name")} | ${t("detail.description.title")}` };
  }

  return {
    title: `${listing.title} | ${t("brand.name")}`,
    description: `${listing.city}${listing.area ? ` - ${listing.area}` : ""}`,
  };
}

export default async function ListingDetailPage({
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

  const whatsappNumber = (process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "").replace(/\D/g, "");
  const sharePath = `/share/${listing.id}`;
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "";
  const shareUrl = siteUrl ? `${siteUrl}${sharePath}` : "";
  const whatsappText = shareUrl ? `${listing.title} - ${shareUrl}` : listing.title;
  const whatsappLink = whatsappNumber
    ? `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(whatsappText)}`
    : null;

  const images = (listing.listing_images ?? []).sort((a, b) => a.sort - b.sort);

  const { data: attachmentsData } = await supabase
    .from("unit_attachments")
    .select("id, file_path, file_type, category, sort_order, is_primary, title, note, is_published, bucket")
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

  const coverUrl = imageAttachments[0]?.signed_url ?? getPublicImageUrl(images[0]?.path);

  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--text)]">
      <SiteHeader />
      <main className="mx-auto w-full max-w-7xl space-y-8 px-6 py-10">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <Badge>{t(getPurposeLabelKey(listing.purpose))}</Badge>
              <Badge>{t(getPropertyTypeLabelKey(listing.type))}</Badge>
              <Badge>
                {listing.beds} {t("detail.stats.rooms")} - {listing.baths} {t("detail.stats.baths")}
              </Badge>
            </div>
            <h1 className="text-3xl font-semibold">{listing.title}</h1>
            <p className="text-[var(--muted)]">
              {listing.city}
              {listing.area ? ` - ${listing.area}` : ""}
              {listing.address ? ` - ${listing.address}` : ""}
            </p>
          </div>
          <div className="space-y-2 text-right">
            <p className="text-3xl font-semibold text-[var(--accent)]">
              {formatPrice(listing.price, listing.currency, locale)}
            </p>
            <div className="flex flex-wrap items-center justify-end gap-3">
              <Link href="/listings">
                <Button size="sm" variant="secondary">
                  {t("detail.back")}
                </Button>
              </Link>
            </div>
          </div>
        </div>

        <Card className="space-y-6 hrtaj-card">
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
                {(imageAttachments.length ? imageAttachments : images.slice(0, 8)).map((img) => {
                  const url =
                    "signed_url" in img
                      ? img.signed_url
                      : getPublicImageUrl((img as { path: string }).path);
                  if (!url) return null;
                  const key = "id" in img ? img.id : (img as { path: string }).path;
                  return (
                    <div
                      key={key}
                      className="aspect-[4/3] overflow-hidden rounded-xl bg-[var(--surface)]"
                    >
                      <img src={url} alt={listing.title} className="h-full w-full object-cover transition duration-300 hover:scale-105" />
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="space-y-4">
              <Card className="space-y-3 hrtaj-card">
                <h3 className="text-lg font-semibold">{t("detail.contact.title")}</h3>
                <p className="text-sm text-[var(--muted)]">{t("detail.contact.subtitle")}</p>
                <div className="flex flex-wrap items-center gap-2">
                  {whatsappLink ? (
                    <a href={whatsappLink} target="_blank" rel="noreferrer">
                      <Button size="sm">{t("detail.contact.whatsapp")}</Button>
                    </a>
                  ) : null}
                  <Link href={sharePath}>
                    <Button size="sm" variant="secondary">
                      {t("detail.contact.share")}
                    </Button>
                  </Link>
                  <Link href={`/listing/${listing.id}/print`}>
                    <Button size="sm" variant="ghost">
                      {t("detail.contact.print")}
                    </Button>
                  </Link>
                </div>
              </Card>
              <Card className="space-y-3 hrtaj-card">
                <h3 className="text-lg font-semibold">{t("detail.map.title")}</h3>
                <div className="flex h-32 items-center justify-center rounded-xl border border-dashed border-[var(--border)] text-sm text-[var(--muted)]">
                  {t("detail.map.placeholder")}
                </div>
              </Card>
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            <div className="space-y-4 md:col-span-2">
              <div>
                <h2 className="text-xl font-semibold">{t("detail.description.title")}</h2>
                <p className="mt-2 text-sm text-[var(--muted)]">
                  {listing.description || t("detail.description.empty")}
                </p>
              </div>
              <div>
                <h2 className="text-xl font-semibold">{t("detail.amenities.title")}</h2>
                <div className="mt-3 flex flex-wrap gap-2">
                  {(listing.amenities as string[] | null | undefined)?.length ? (
                    (listing.amenities as string[]).map((item) => <Badge key={item}>{item}</Badge>)
                  ) : (
                    <p className="text-sm text-[var(--muted)]">{t("detail.amenities.empty")}</p>
                  )}
                </div>
              </div>
              <div className="grid gap-3 md:grid-cols-3">
                <Card className="space-y-1 hrtaj-card">
                  <p className="text-xs text-[var(--muted)]">{t("detail.stats.area")}</p>
                  <p className="text-lg font-semibold">
                    {listing.size_m2 ? `${listing.size_m2} m2` : t("detail.stats.unknown")}
                  </p>
                </Card>
                <Card className="space-y-1 hrtaj-card">
                  <p className="text-xs text-[var(--muted)]">{t("detail.stats.rooms")}</p>
                  <p className="text-lg font-semibold">{listing.beds}</p>
                </Card>
                <Card className="space-y-1 hrtaj-card">
                  <p className="text-xs text-[var(--muted)]">{t("detail.stats.baths")}</p>
                  <p className="text-lg font-semibold">{listing.baths}</p>
                </Card>
              </div>
            </div>

            <Card className="space-y-4 hrtaj-card">
              <h3 className="text-lg font-semibold">{t("detail.lead.title")}</h3>
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
                <Button type="submit" size="md" className="w-full">
                  {t("detail.lead.submit")}
                </Button>
              </form>
            </Card>
          </div>
        </Card>
        {docAttachments.length ? (
          <Card className="space-y-4 hrtaj-card">
            <h2 className="text-xl font-semibold">{t("detail.documents.title")}</h2>
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
          </Card>
        ) : null}
      </main>
      <SiteFooter showFloating />
    </div>
  );
}

