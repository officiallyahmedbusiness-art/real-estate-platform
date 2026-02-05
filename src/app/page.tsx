import Link from "next/link";
import { createSupabaseServerClient } from "@/lib/supabaseServer";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { Button, Card, Badge, Section } from "@/components/ui";
import { FieldInput, FieldSelect, FieldTextarea } from "@/components/FieldHelp";
import { formatPrice } from "@/lib/format";
import { FEATURE_CATEGORIES, PROPERTY_TYPE_OPTIONS, PURPOSE_OPTIONS } from "@/lib/constants";
import { createT } from "@/lib/i18n";
import { getServerLocale } from "@/lib/i18n.server";
import { createPublicRequestAction } from "@/app/actions/marketplace";
import { PartnerMarquee } from "@/components/PartnerMarquee";
import { AdsCarousel, type AdCampaignCard } from "@/components/AdsCarousel";
import { RecentlyViewedStrip } from "@/components/listings/RecentlyViewedStrip";
import { Hero } from "@/components/home/Hero";
import { FeaturedListings } from "@/components/home/FeaturedListings";
import { Areas } from "@/components/home/Areas";
import { FAQ } from "@/components/home/FAQ";
import { buildFaqJsonLd } from "@/lib/seo/schema";

export default async function Home() {
  const locale = await getServerLocale();
  const t = createT(locale);

  const supabase = await createSupabaseServerClient();
  const { data: mediaData } = await supabase
    .from("site_media")
    .select("id, media_type, url, poster_url, title, sort_order")
    .eq("placement", "hero")
    .eq("is_published", true)
    .order("sort_order", { ascending: true });
  const heroMedia = mediaData ?? [];
  const heroVideo = heroMedia.find((item) => item.media_type === "video") ?? null;
  const heroImages = heroMedia.filter((item) => item.media_type === "image");

  type MetricRow = {
    id: string;
    label_ar: string | null;
    label_en: string | null;
    value: string | null;
  };

  const { data: metricsData } = await supabase
    .from("site_metrics")
    .select("id, label_ar, label_en, value, sort_order")
    .eq("is_published", true)
    .order("sort_order", { ascending: true });
  const metrics = (metricsData ?? []) as MetricRow[];

  const { data: featuredProjectsData } = await supabase
    .from("featured_projects")
    .select(
      "id, title_ar, title_en, location_ar, location_en, starting_price, currency, image_url, cta_url, sort_order"
    )
    .eq("is_published", true)
    .order("sort_order", { ascending: true })
    .limit(6);
  const featuredProjects = featuredProjectsData ?? [];

  const { data } = await supabase
    .from("listings")
    .select(
      "id, title, price, currency, city, area, purpose, type, beds, baths, listing_images(path, sort)"
    )
    .eq("status", "published")
    .order("created_at", { ascending: false })
    .limit(6);
  const listings = data ?? [];

  type FallbackMetric = { label: string; value: string };
  const fallbackStats: FallbackMetric[] = [
    { label: t("home.stats.listings"), value: "1,200+" },
    { label: t("home.stats.developers"), value: "45+" },
    { label: t("home.stats.leads"), value: "300+" },
  ];
  const displayMetrics: Array<MetricRow | FallbackMetric> =
    metrics.length > 0 ? metrics : fallbackStats;
  const whyCards = [
    {
      title: t("home.why.item1.title"),
      body: t("home.why.item1.body"),
    },
    {
      title: t("home.why.item2.title"),
      body: t("home.why.item2.body"),
    },
    {
      title: t("home.why.item3.title"),
      body: t("home.why.item3.body"),
    },
  ];
  const processSteps = [
    {
      title: t("home.process.step1.title"),
      body: t("home.process.step1.body"),
    },
    {
      title: t("home.process.step2.title"),
      body: t("home.process.step2.body"),
    },
    {
      title: t("home.process.step3.title"),
      body: t("home.process.step3.body"),
    },
  ];

  const { data: partnersData } = await supabase
    .from("marketing_partners")
    .select("id, name_ar, name_en, logo_url, sort_order")
    .eq("is_active", true)
    .order("sort_order", { ascending: true });
  const partners = partnersData ?? [];

  type AdCampaignRow = {
    id: string;
    title_ar: string | null;
    title_en: string | null;
    body_ar: string | null;
    body_en: string | null;
    cta_label_ar: string | null;
    cta_label_en: string | null;
    cta_url: string | null;
    ad_assets: Array<{
      id: string;
      media_type: string;
      url: string;
      poster_url: string | null;
      sort_order: number;
      is_primary: boolean;
    }> | null;
  };

  const { data: campaignsData } = await supabase
    .from("ad_campaigns")
    .select(
      "id, title_ar, title_en, body_ar, body_en, cta_label_ar, cta_label_en, cta_url, ad_assets(id, media_type, url, poster_url, sort_order, is_primary)"
    )
    .eq("status", "published")
    .order("created_at", { ascending: false })
    .limit(6);
  const campaigns = (campaignsData ?? []) as AdCampaignRow[];

  const campaignCards: AdCampaignCard[] = campaigns.map((campaign) => {
    const assets = campaign.ad_assets ?? [];
    const sorted = [...assets].sort((a, b) => {
      if (a.is_primary && !b.is_primary) return -1;
      if (!a.is_primary && b.is_primary) return 1;
      return a.sort_order - b.sort_order;
    });
    const cover = sorted[0] ?? null;
    return {
      id: campaign.id,
      title: (locale === "ar" ? campaign.title_ar : campaign.title_en) ?? t("home.ads.title"),
      body: (locale === "ar" ? campaign.body_ar : campaign.body_en) ?? "",
      ctaLabel:
        (locale === "ar" ? campaign.cta_label_ar : campaign.cta_label_en) ??
        t("home.ads.cta"),
      ctaUrl: campaign.cta_url || "/listings?purpose=new-development",
      coverUrl: cover?.url ?? null,
      coverType: cover?.media_type === "video" ? "video" : "image",
      posterUrl: cover?.poster_url ?? null,
    };
  });
  const intentOptions = [
    { value: "buy", label: t("home.request.intent.buy") },
    { value: "rent", label: t("home.request.intent.rent") },
    { value: "invest", label: t("home.request.intent.invest") },
  ];
  const contactOptions = [
    { value: "morning", label: t("home.request.contact.morning") },
    { value: "afternoon", label: t("home.request.contact.afternoon") },
    { value: "evening", label: t("home.request.contact.evening") },
    { value: "any", label: t("home.request.contact.any") },
  ];
  const faqItems = [
    { question: t("home.faq.q1"), answer: t("home.faq.a1") },
    { question: t("home.faq.q2"), answer: t("home.faq.a2") },
    { question: t("home.faq.q3"), answer: t("home.faq.a3") },
    { question: t("home.faq.q4"), answer: t("home.faq.a4") },
    { question: t("home.faq.q5"), answer: t("home.faq.a5") },
    { question: t("home.faq.q6"), answer: t("home.faq.a6") },
  ];
  const areas = [
    { key: "smouha", href: "/listings?area=سموحة" },
    { key: "gleem", href: "/listings?area=جليم" },
    { key: "stanley", href: "/listings?area=ستانلي" },
    { key: "miami", href: "/listings?area=ميامي" },
    { key: "sidiBishr", href: "/listings?area=سيدي%20بشر" },
    { key: "agami", href: "/listings?area=العجمي" },
  ];
  const faqJsonLd = buildFaqJsonLd(faqItems);

  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--text)]">
      <SiteHeader />
      <main className="mx-auto w-full max-w-7xl space-y-6 px-4 py-6 pb-[calc(7rem+env(safe-area-inset-bottom))] sm:space-y-12 sm:px-6 sm:py-10 lg:px-8 home-main">
        <Hero
          t={t}
          heroVideo={heroVideo}
          heroImages={heroImages}
          featureCategories={FEATURE_CATEGORIES}
          purposeOptions={PURPOSE_OPTIONS}
        />

        <Section
          title={t("home.search.title")}
          subtitle={t("home.search.subtitle")}
          className="home-search-section"
        >
          <details className="hero-details home-search-details">
            <summary className="hero-details-summary">
              {t("home.search.title")}
              <span className="hero-details-caret" aria-hidden="true" />
            </summary>
            <div className="hero-details-body">
              <Card className="home-search-card space-y-4 bg-[var(--surface-elevated)]/90">
                <form action="/listings" className="space-y-3">
                  <div className="grid gap-3 md:grid-cols-2">
                    <FieldInput
                      name="city"
                      label={t("home.search.city")}
                      placeholder={t("home.search.city")}
                    />
                    <FieldInput
                      name="area"
                      label={t("home.search.area")}
                      placeholder={t("home.search.area")}
                    />
                  </div>
                  <div className="grid gap-3 md:grid-cols-2">
                    <FieldSelect
                      name="purpose"
                      label={t("home.search.purpose")}
                      defaultValue=""
                    >
                      <option value="">{t("home.search.purpose")}</option>
                      {PURPOSE_OPTIONS.map((option) => (
                        <option key={option.value} value={option.value}>
                          {t(option.labelKey)}
                        </option>
                      ))}
                    </FieldSelect>
                    <FieldSelect
                      name="type"
                      label={t("filters.type")}
                      defaultValue=""
                    >
                      <option value="">{t("filters.type")}</option>
                      {PROPERTY_TYPE_OPTIONS.map((option) => (
                        <option key={option.value} value={option.value}>
                          {t(option.labelKey)}
                        </option>
                      ))}
                    </FieldSelect>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <FieldInput
                      name="minPrice"
                      label={t("home.search.minPrice")}
                      placeholder={t("home.search.minPrice")}
                    />
                    <FieldInput
                      name="maxPrice"
                      label={t("home.search.maxPrice")}
                      placeholder={t("home.search.maxPrice")}
                    />
                  </div>
                  <Button type="submit" className="w-full home-button-md">
                    {t("home.search.submit")}
                  </Button>
                </form>
              </Card>
            </div>
          </details>
        </Section>

        <Section title={t("home.supply.title")} subtitle={t("home.supply.subtitle")}>
          <div className="grid gap-4 md:grid-cols-2">
            <Card className="space-y-3 hrtaj-card">
              <h3 className="text-lg font-semibold">{t("home.supply.developer.title")}</h3>
              <p className="text-sm text-[var(--muted)]">
                {t("home.supply.developer.subtitle")}
              </p>
              <Link href="/supply/developer">
                <Button size="sm">{t("home.supply.developer.cta")}</Button>
              </Link>
            </Card>
            <Card className="space-y-3 hrtaj-card">
              <h3 className="text-lg font-semibold">{t("home.supply.owner.title")}</h3>
              <p className="text-sm text-[var(--muted)]">{t("home.supply.owner.subtitle")}</p>
              <Link href="/supply/owner">
                <Button size="sm" variant="secondary">
                  {t("home.supply.owner.cta")}
                </Button>
              </Link>
            </Card>
          </div>
        </Section>

        <Section title={t("home.categories.title")} subtitle={t("home.categories.subtitle")}>
          <div className="grid gap-4 md:grid-cols-3">
            {FEATURE_CATEGORIES.map((cat, index) => (
              <Link key={cat.purpose} href={`/listings?purpose=${cat.purpose}`}>
                <Card
                  className="hrtaj-card transition hover:-translate-y-1 hover:border-[var(--accent)] fade-up"
                  style={{ animationDelay: `${index * 80}ms` }}
                >
                  <h3 className="text-lg font-semibold line-clamp-2">{t(cat.titleKey)}</h3>
                  <p className="text-sm text-[var(--muted)] line-clamp-3">{t(cat.descKey)}</p>
                </Card>
              </Link>
            ))}
          </div>
        </Section>

        <Section title={t("home.areas.title")} subtitle={t("home.areas.subtitle")}>
          <Areas t={t} areas={areas} />
        </Section>

        <Section title={t("home.proof.title")} subtitle={t("home.proof.subtitle")}>
          <div className="grid gap-4 md:grid-cols-3">
            {displayMetrics.map((metric) => {
              const label =
                "label_ar" in metric
                  ? locale === "ar"
                    ? metric.label_ar
                    : metric.label_en
                  : metric.label;
              const value = metric.value ?? "-";
              const key = "id" in metric ? metric.id : metric.label;
              return (
                <Card key={key} className="space-y-2 hrtaj-card">
                  <p className="text-xs text-[var(--muted)]">{label}</p>
                  <p className="text-2xl font-semibold">{value}</p>
                </Card>
              );
            })}
          </div>
        </Section>

        <Section title={t("home.why.title")} subtitle={t("home.why.subtitle")}>
          <div className="grid gap-4 md:grid-cols-3">
            {whyCards.map((item, index) => (
              <Card key={item.title} className="space-y-3 hrtaj-card">
                <Badge>{`0${index + 1}`}</Badge>
                <h3 className="text-lg font-semibold">{item.title}</h3>
                <p className="text-sm text-[var(--muted)]">{item.body}</p>
              </Card>
            ))}
          </div>
        </Section>

        <Section title={t("home.partners.title")} subtitle={t("home.partners.subtitle")}>
          <PartnerMarquee locale={locale} partners={partners} />
        </Section>

        <Section title={t("home.ads.title")} subtitle={t("home.ads.subtitle")}>
          {campaigns.length === 0 ? (
            <Card>
              <p className="text-sm text-[var(--muted)]">{t("home.ads.empty")}</p>
            </Card>
          ) : (
            <AdsCarousel locale={locale} items={campaignCards} />
          )}
        </Section>

        <Section title={t("home.projects.title")} subtitle={t("home.projects.subtitle")}>
          {featuredProjects.length === 0 ? (
            <Card className="p-3 sm:p-4">
              <p className="text-sm text-[var(--muted)]">{t("home.projects.empty")}</p>
            </Card>
          ) : (
            <div className="grid gap-4 sm:gap-6 md:grid-cols-3">
              {featuredProjects.map((project) => (
                <Card key={project.id} className="space-y-3 hrtaj-card">
                  <div className="aspect-[4/3] overflow-hidden rounded-xl bg-[var(--surface)]">
                    {project.image_url ? (
                      <img
                        src={project.image_url}
                        alt={locale === "ar" ? project.title_ar : project.title_en}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-sm text-[var(--muted)]">
                        {t("general.noImage")}
                      </div>
                    )}
                  </div>
                  <div className="space-y-1">
                    <p className="text-lg font-semibold line-clamp-2">
                      {locale === "ar" ? project.title_ar : project.title_en}
                    </p>
                    <p className="text-sm text-[var(--muted)]">
                      {locale === "ar" ? project.location_ar : project.location_en}
                    </p>
                    {project.starting_price ? (
                      <p className="text-base font-semibold text-[var(--accent)]">
                        {t("home.projects.starting")}{" "}
                        {formatPrice(project.starting_price, project.currency ?? "EGP", locale)}
                      </p>
                    ) : null}
                  </div>
                  <Link href={project.cta_url || "/listings?purpose=new-development"}>
                    <Button size="sm" variant="secondary">
                      {t("home.projects.cta")}
                    </Button>
                  </Link>
                </Card>
              ))}
            </div>
          )}
        </Section>

        <Section title={t("home.featured.title")} subtitle={t("home.featured.subtitle")}>
          <FeaturedListings t={t} locale={locale} listings={listings} />
        </Section>

        <Section title={t("home.faq.title")} subtitle={t("home.faq.subtitle")}>
          <FAQ items={faqItems} />
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
          />
        </Section>

        <Section title={t("home.process.title")} subtitle={t("home.process.subtitle")}>
          <div className="grid gap-4 md:grid-cols-3">
            {processSteps.map((step, index) => (
              <Card key={step.title} className="space-y-3 hrtaj-card">
                <Badge>{`0${index + 1}`}</Badge>
                <h3 className="text-lg font-semibold">{step.title}</h3>
                <p className="text-sm text-[var(--muted)]">{step.body}</p>
              </Card>
            ))}
          </div>
        </Section>

        <Section
          title={t("home.about.title")}
          subtitle={t("home.about.subtitle")}
          action={
            <Link href="/about">
              <Button size="sm" variant="secondary">
                {t("home.about.cta")}
              </Button>
            </Link>
          }
        >
          <div className="grid gap-4 md:grid-cols-3">
            <Card className="space-y-2 hrtaj-card">
              <p className="text-xs text-[var(--muted)]">{t("home.about.card1.kicker")}</p>
              <p className="text-lg font-semibold">{t("home.about.card1.title")}</p>
              <p className="text-sm text-[var(--muted)]">{t("home.about.card1.body")}</p>
            </Card>
            <Card className="space-y-2 hrtaj-card">
              <p className="text-xs text-[var(--muted)]">{t("home.about.card2.kicker")}</p>
              <p className="text-lg font-semibold">{t("home.about.card2.title")}</p>
              <p className="text-sm text-[var(--muted)]">{t("home.about.card2.body")}</p>
            </Card>
            <Card className="space-y-2 hrtaj-card">
              <p className="text-xs text-[var(--muted)]">{t("home.about.card3.kicker")}</p>
              <p className="text-lg font-semibold">{t("home.about.card3.title")}</p>
              <p className="text-sm text-[var(--muted)]">{t("home.about.card3.body")}</p>
            </Card>
          </div>
        </Section>

        <Section title={t("home.request.title")} subtitle={t("home.request.subtitle")}>
          <Card className="hrtaj-card">
            <form action={createPublicRequestAction} className="grid gap-4 md:grid-cols-2">
              <input
                type="text"
                name="company"
                tabIndex={-1}
                autoComplete="off"
                className="sr-only"
                aria-hidden="true"
                data-no-help
              />
              <input type="hidden" name="source" value="web" />
              <FieldInput
                name="name"
                label={t("home.request.name")}
                required
                placeholder={t("home.request.name")}
              />
              <FieldInput
                name="phone"
                label={t("home.request.phone")}
                required
                placeholder={t("home.request.phone")}
                type="tel"
              />
              <FieldSelect
                name="intent"
                label={t("home.request.intent")}
                defaultValue=""
                required
              >
                <option value="">{t("home.request.intent")}</option>
                {intentOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </FieldSelect>
              <FieldInput
                name="preferred_area"
                label={t("home.request.area")}
                placeholder={t("home.request.area")}
              />
              <FieldInput
                name="budget_min"
                label={t("home.request.budgetMin")}
                placeholder={t("home.request.budgetMin")}
                type="number"
              />
              <FieldInput
                name="budget_max"
                label={t("home.request.budgetMax")}
                placeholder={t("home.request.budgetMax")}
                type="number"
              />
              <FieldSelect
                name="preferred_contact_time"
                label={t("home.request.contactTime")}
                defaultValue=""
                wrapperClassName="md:col-span-2"
              >
                <option value="">{t("home.request.contactTime")}</option>
                {contactOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </FieldSelect>
              <div className="md:col-span-2">
                <FieldTextarea
                  name="notes"
                  label={t("home.request.notes")}
                  placeholder={t("home.request.notes")}
                  className="min-h-[120px]"
                />
              </div>
              <div className="md:col-span-2">
                <Button type="submit" className="w-full home-button-md">
                  {t("home.request.submit")}
                </Button>
              </div>
            </form>
          </Card>
        </Section>
      </main>
      <div className="mx-auto w-full max-w-7xl px-4 pb-10 sm:px-6 lg:px-8 home-recently">
        <RecentlyViewedStrip
          locale={locale}
          title={t("recent.title")}
          empty={t("recent.empty")}
        />
      </div>
      <SiteFooter showFloating showCompare />
    </div>
  );
}



