import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabaseServer";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { Badge, Button, Card } from "@/components/ui";
import { formatNumber, formatPrice } from "@/lib/format";
import { getPublicImageUrl } from "@/lib/storage";
import { isUuid } from "@/lib/validators";
import { createT, getPropertyTypeLabelKey, getPurposeLabelKey } from "@/lib/i18n";
import { getServerLocale } from "@/lib/i18n.server";
import { getPublicBaseUrl } from "@/lib/paths";
import { Gallery, type GalleryImage } from "@/components/listings/Gallery";
import { PropertyFacts } from "@/components/listings/PropertyFacts";
import { LeadForm } from "@/components/leads/LeadForm";
import { getSiteSettings } from "@/lib/settings";
import { buildListingJsonLd, buildListingMetadata } from "@/lib/seo/meta";
import { buildBreadcrumbJsonLd } from "@/lib/seo/schema";
import { ListingActionButtons } from "@/components/listings/ListingActionButtons";
import { ListingViewTracker } from "@/components/listings/ListingViewTracker";
import { RecentlyViewedTracker } from "@/components/listings/RecentlyViewedTracker";
import { MobileCtaBar } from "@/components/listings/MobileCtaBar";
import { getFlags } from "@/lib/flags";
import { buildWhatsAppLink, buildWhatsAppMessageEncoded, buildWhatsAppMessagePlain, getBrandForLocale } from "@/lib/whatsapp/message";
import { CopyWhatsAppButton } from "@/components/listings/CopyWhatsAppButton";

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
    .select(
      "id, title, price, currency, city, area, beds, baths, size_m2, purpose, type, listing_images(path, sort)"
    )
    .eq("id", id)
    .maybeSingle();

  if (!listing) {
    return { title: `${t("brand.name")} | ${t("detail.description.title")}` };
  }

  const coverPath = [...(listing.listing_images ?? [])].sort((a, b) => a.sort - b.sort)[0]?.path;
  const imageUrl = coverPath ? getPublicImageUrl(coverPath) ?? undefined : undefined;
  const baseUrl = getPublicBaseUrl();

  return buildListingMetadata({ listing, locale, t, baseUrl, imageUrl });
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
      "id, title, price, currency, city, area, address, beds, baths, size_m2, description, amenities, purpose, type, status, owner_user_id, developer_id, floor, view, building, finishing, meters, reception, kitchen, elevator, listing_code, unit_code, listing_images(path, sort)"
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

  const settings = await getSiteSettings();
  const callNumber = settings.primary_phone ?? settings.whatsapp_number ?? null;
  const callLink = callNumber ? `tel:${callNumber.replace(/[^\d+]/g, "")}` : null;
  const flags = getFlags();

  const baseUrl = getPublicBaseUrl();
  const shareUrl = baseUrl ? `${baseUrl}/listing/${listing.id}` : `/listing/${listing.id}`;
  const messageLocale =
    settings.whatsapp_message_language === "ar" || settings.whatsapp_message_language === "en"
      ? settings.whatsapp_message_language
      : locale;
  const whatsappMessagePlain = buildWhatsAppMessagePlain(
    {
      brand: getBrandForLocale(messageLocale),
      listing_url: shareUrl,
      listing_title: listing.title,
      price: formatPrice(listing.price, listing.currency, locale),
      area: listing.area,
      city: listing.city,
      ref: listing.listing_code ?? listing.unit_code ?? listing.id,
      purpose: t(getPurposeLabelKey(listing.purpose)),
      property_type: t(getPropertyTypeLabelKey(listing.type)),
    },
    settings.whatsapp_message_template,
    messageLocale
  );
  const whatsappMessageEncoded = buildWhatsAppMessageEncoded(
    {
      brand: getBrandForLocale(messageLocale),
      listing_url: shareUrl,
      listing_title: listing.title,
      price: formatPrice(listing.price, listing.currency, locale),
      area: listing.area,
      city: listing.city,
      ref: listing.listing_code ?? listing.unit_code ?? listing.id,
      purpose: t(getPurposeLabelKey(listing.purpose)),
      property_type: t(getPropertyTypeLabelKey(listing.type)),
    },
    settings.whatsapp_message_template,
    messageLocale
  );
  const whatsappLink = buildWhatsAppLink(settings.whatsapp_number, whatsappMessageEncoded);

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

  const galleryItems: GalleryImage[] = (imageAttachments.length ? imageAttachments : images)
    .map((img, index) => {
      const url = "signed_url" in img ? img.signed_url : getPublicImageUrl(img.path);
      if (!url) return null;
      const id = "id" in img ? img.id : `${img.path}-${index}`;
      return { id, url };
    })
    .filter(Boolean) as GalleryImage[];

  const amenityLabels: Record<string, string> = {
    "مصعد": t("amenity.elevator"),
    "جراج": t("amenity.parking"),
    "أمن": t("amenity.security"),
    "بلكونة": t("amenity.balcony"),
    "مولد": t("amenity.generator"),
    "اطلالة بحر": t("amenity.seaView"),
  };

  const amenitySet = new Set<string>();
  const rawAmenities = Array.isArray(listing.amenities) ? listing.amenities : [];
  rawAmenities.forEach((item) => {
    amenitySet.add(amenityLabels[item] ?? item);
  });
  if (listing.elevator) {
    amenitySet.add(t("amenity.elevator"));
  }

  const facts = [
    listing.size_m2
      ? {
          label: t("detail.facts.area"),
          value: `${formatNumber(listing.size_m2, locale)} m²`,
        }
      : null,
    {
      label: t("detail.stats.rooms"),
      value: formatNumber(listing.beds, locale),
    },
    {
      label: t("detail.stats.baths"),
      value: formatNumber(listing.baths, locale),
    },
    listing.floor !== null && listing.floor !== undefined
      ? {
          label: t("detail.facts.floor"),
          value: listing.floor,
        }
      : null,
    listing.finishing
      ? {
          label: t("detail.facts.finishing"),
          value: listing.finishing,
        }
      : null,
    listing.view
      ? {
          label: t("detail.facts.view"),
          value: listing.view,
        }
      : null,
    listing.building
      ? {
          label: t("detail.facts.building"),
          value: listing.building,
        }
      : null,
    listing.meters !== null && listing.meters !== undefined
      ? {
          label: t("detail.facts.meters"),
          value: listing.meters,
        }
      : null,
    listing.reception
      ? {
          label: t("detail.facts.reception"),
          value: listing.reception,
        }
      : null,
  ];

  const jsonLd = buildListingJsonLd({
    listing,
    locale,
    baseUrl,
    imageUrl: images[0]?.path ? getPublicImageUrl(images[0].path) ?? undefined : undefined,
  });
  const breadcrumbJsonLd = buildBreadcrumbJsonLd({
    baseUrl,
    items: [
      { name: t("nav.home"), path: "/" },
      { name: t("nav.listings"), path: "/listings" },
      { name: listing.title, path: `/listing/${listing.id}` },
    ],
  });

  const leadLabels = {
    title: t("detail.lead.title"),
    subtitle: t("detail.contact.subtitle"),
    name: t("detail.lead.name"),
    phone: t("detail.lead.phone"),
    email: t("detail.lead.email"),
    message: t("detail.lead.message"),
    submit: t("detail.lead.submit"),
    submitting: t("detail.lead.submitting"),
    successTitle: t("detail.lead.successTitle"),
    successBody: t("detail.lead.successBody"),
    error: t("detail.lead.error"),
    whatsappFallback: t("detail.cta.whatsapp"),
    back: t("detail.back"),
  };

  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--text)]">
      <SiteHeader />
      <main className="mx-auto w-full max-w-7xl space-y-6 px-4 py-6 pb-[calc(8rem+env(safe-area-inset-bottom))] sm:space-y-8 sm:px-6 sm:py-10 lg:px-8">
        <ListingViewTracker
          listing={{
            id: listing.id,
            price: listing.price,
            area: listing.area,
            city: listing.city,
            size_m2: listing.size_m2,
          }}
        />
        <RecentlyViewedTracker id={listing.id} />
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="space-y-1 sm:space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <Badge>{t(getPurposeLabelKey(listing.purpose))}</Badge>
              <Badge>{t(getPropertyTypeLabelKey(listing.type))}</Badge>
              <Badge>
                {listing.beds} {t("detail.stats.rooms")} - {listing.baths} {t("detail.stats.baths")}
              </Badge>
            </div>
            <h1 className="text-2xl font-semibold sm:text-3xl">{listing.title}</h1>
            <p className="text-[var(--muted)]">
              {listing.city}
              {listing.area ? ` - ${listing.area}` : ""}
              {listing.address ? ` - ${listing.address}` : ""}
            </p>
          </div>
          <div className="space-y-2 text-right">
            <p className="text-2xl font-semibold text-[var(--accent)] sm:text-3xl">
              {formatPrice(listing.price, listing.currency, locale)}
            </p>
            <div className="flex flex-wrap items-center justify-end gap-2">
              <Link href={`/listing/${listing.id}/print`}>
                <Button size="sm" variant="secondary">
                  {t("detail.contact.print")}
                </Button>
              </Link>
              <Link href="/listings">
                <Button size="sm" variant="ghost">
                  {t("detail.back")}
                </Button>
              </Link>
            </div>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[2fr,1fr]">
          <div className="space-y-6">
            <Gallery images={galleryItems} alt={listing.title} fallback={t("listing.card.noImage")} />

            <section className="space-y-2">
              <h2 className="text-xl font-semibold">{t("detail.description.title")}</h2>
              <p className="text-sm text-[var(--muted)]">
                {listing.description || t("detail.description.empty")}
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl font-semibold">{t("detail.facts.title")}</h2>
              <PropertyFacts items={facts} />
            </section>

            <section className="space-y-3">
              <h2 className="text-xl font-semibold">{t("detail.amenities.title")}</h2>
              {amenitySet.size ? (
                <div className="amenities-grid">
                  {[...amenitySet].map((item) => (
                    <div key={item} className="amenity-item">
                      <span className="amenity-dot" />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-[var(--muted)]">{t("detail.amenities.empty")}</p>
              )}
            </section>

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
          </div>

          <div className="space-y-4 lg:sticky lg:top-24">
            <Card className="space-y-3 hrtaj-card">
              <h3 className="text-lg font-semibold">{t("detail.contact.title")}</h3>
              <p className="text-sm text-[var(--muted)]">{t("detail.contact.subtitle")}</p>
              <ListingActionButtons
                listing={{
                  id: listing.id,
                  title: listing.title,
                  price: listing.price,
                  currency: listing.currency,
                  area: listing.area,
                  city: listing.city,
                  size_m2: listing.size_m2,
                }}
                whatsappNumber={settings.whatsapp_number}
                whatsappTemplate={settings.whatsapp_message_template}
                callNumber={callNumber}
                shareUrl={shareUrl}
                locale={locale}
                enableCompare={flags.enableCompare}
                labels={{
                  whatsapp: t("detail.cta.whatsapp"),
                  call: t("detail.cta.call"),
                  share: t("listing.action.share"),
                  favoriteAdd: t("favorite.add"),
                  favoriteRemove: t("favorite.remove"),
                  compareAdd: t("compare.add"),
                  compareRemove: t("compare.remove"),
                  compareLimit: t("compare.limit"),
                }}
              />
              {whatsappLink ? (
                <CopyWhatsAppButton
                  message={whatsappMessagePlain}
                  labels={{
                    copy: t("detail.cta.copyWhatsapp"),
                    success: t("toast.copy.success"),
                    error: t("toast.copy.error"),
                    hint: t("detail.cta.copyHint"),
                  }}
                />
              ) : null}
            </Card>

            <LeadForm
              listingId={listing.id}
              source="web"
              labels={leadLabels}
              whatsappLink={whatsappLink}
              className="hrtaj-card"
              id="lead-form"
            />
          </div>
        </div>

        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
        />
      </main>

      <MobileCtaBar
        listing={{
          id: listing.id,
          price: listing.price,
          area: listing.area,
          city: listing.city,
          size_m2: listing.size_m2,
        }}
        whatsappLink={whatsappLink}
        callLink={callLink}
        labels={{
          whatsapp: t("detail.cta.whatsapp"),
          call: t("detail.cta.call"),
          book: t("detail.cta.book"),
        }}
      />

      <SiteFooter showFloating showCompare />
    </div>
  );
}
