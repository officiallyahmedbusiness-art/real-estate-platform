import Link from "next/link";
import { createSupabaseServerClient } from "@/lib/supabaseServer";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { Button, Card, Badge, Section } from "@/components/ui";
import { FieldInput, FieldSelect, FieldTextarea } from "@/components/FieldHelp";
import { formatPrice } from "@/lib/format";
import { FEATURE_CATEGORIES, PROPERTY_TYPE_OPTIONS, PURPOSE_OPTIONS } from "@/lib/constants";
import { getPublicImageUrl } from "@/lib/storage";
import { createT, getPropertyTypeLabelKey, getPurposeLabelKey } from "@/lib/i18n";
import { getServerLocale } from "@/lib/i18n.server";
import { createPublicRequestAction } from "@/app/actions/marketplace";
import { PartnerMarquee } from "@/components/PartnerMarquee";
import { AdsCarousel, type AdCampaignCard } from "@/components/AdsCarousel";

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

  return (
    <div className="min-h-screen overflow-x-hidden bg-[var(--bg)] text-[var(--text)]">
      <SiteHeader />
      <main className="mx-auto w-full max-w-7xl space-y-6 px-4 py-6 pb-[calc(7rem+env(safe-area-inset-bottom))] sm:space-y-12 sm:px-6 sm:py-10 lg:px-8">
        <section className="relative overflow-hidden rounded-[28px] border border-[var(--border)] bg-[var(--surface)]/90 p-4 shadow-[var(--shadow)] fade-up sm:rounded-[32px] sm:p-8 hero-shell">
          <div className="absolute inset-0">
            {heroVideo ? (
              <video
                className="hero-video"
                autoPlay
                muted
                loop
                playsInline
                poster={heroVideo.poster_url ?? undefined}
              >
                <source src={heroVideo.url} />
              </video>
            ) : heroImages.length > 0 ? (
              <div className="hero-carousel">
                <div className="hero-track">
                  {[...heroImages, ...heroImages].map((item, index) => (
                    <div className="hero-slide" key={`${item.id}-${index}`}>
                      <img src={item.url} alt={item.title ?? t("home.hero.badge")} />
                    </div>
                  ))}
                </div>
              </div>
            ) : null}
            <div className="hero-overlay" />
          </div>
          <div className="relative z-10 grid gap-5 sm:gap-10 lg:grid-cols-[1.1fr,0.9fr]">
            <div className="space-y-4 sm:space-y-6">
              <Badge>{t("home.hero.badge")}</Badge>
              <h1 className="max-w-[18ch] text-3xl font-semibold leading-tight text-balance sm:max-w-[22ch] sm:text-5xl lg:text-5xl">
                {t("home.hero.title")}
              </h1>
              <p className="max-w-lg text-sm leading-relaxed text-[var(--muted)] sm:text-base">
                {t("home.hero.subtitle")}
              </p>
              <div className="flex flex-col gap-3 sm:flex-row">
                <Link href="/listings">
                  <Button size="lg" className="w-full sm:w-auto">
                    {t("home.hero.ctaPrimary")}
                  </Button>
                </Link>
                <Link href="/developer">
                  <Button size="lg" variant="secondary" className="w-full sm:w-auto">
                    {t("home.hero.ctaSecondary")}
                  </Button>
                </Link>
              </div>
              <div className="flex items-center gap-2 overflow-x-auto whitespace-nowrap pb-1 text-xs text-[var(--muted)]">
                <span className="font-semibold text-[var(--text)]">{t("home.hero.quick")}</span>
                {FEATURE_CATEGORIES.map((cat) => (
                  <Link
                    key={cat.purpose}
                    href={`/listings?purpose=${cat.purpose}`}
                    className="shrink-0 rounded-full border border-[var(--border)] bg-[var(--surface)] px-3 py-1 text-[var(--text)] transition hover:border-[var(--accent)]"
                  >
                    {t(cat.titleKey)}
                  </Link>
                ))}
              </div>
            </div>
            <Card className="callback-card space-y-4 bg-[var(--surface-elevated)]/90 p-4 backdrop-blur sm:space-y-4 sm:p-5">
              <h2 className="callback-title text-lg font-semibold">{t("home.callback.title")}</h2>
              <p className="callback-subtitle text-sm text-[var(--muted)]">{t("home.callback.subtitle")}</p>
              <form action={createPublicRequestAction} className="callback-form space-y-3">
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
                <input type="hidden" name="intent" value="buy" />
                <div className="callback-grid grid gap-3 md:grid-cols-2">
                  <FieldInput
                    name="name"
                    label={t("home.callback.name")}
                    helpKey="home.callback.name"
                    placeholder={t("home.callback.name")}
                    required
                  />
                  <FieldInput
                    name="email"
                    label={t("home.callback.email")}
                    helpKey="home.callback.email"
                    placeholder={t("home.callback.email")}
                    type="email"
                  />
                </div>
                <FieldInput
                  name="phone"
                  label={t("home.callback.phone")}
                  helpKey="home.callback.phone"
                  placeholder={t("home.callback.phone")}
                  required
                  type="tel"
                />
                <Button type="submit" size="lg" className="callback-submit w-full">
                  {t("home.callback.submit")}
                </Button>
              </form>
            </Card>
          </div>
        </section>

        <Section title={t("home.search.title")} subtitle={t("home.search.subtitle")}>
          <Card className="space-y-4 bg-[var(--surface-elevated)]/90">
            <form action="/listings" className="space-y-3">
              <div className="grid gap-3 md:grid-cols-2">
                <FieldInput
                  name="city"
                  label={t("home.search.city")}
                  helpKey="home.search.city"
                  placeholder={t("home.search.city")}
                />
                <FieldInput
                  name="area"
                  label={t("home.search.area")}
                  helpKey="home.search.area"
                  placeholder={t("home.search.area")}
                />
              </div>
              <div className="grid gap-3 md:grid-cols-2">
                <FieldSelect
                  name="purpose"
                  label={t("home.search.purpose")}
                  helpKey="home.search.purpose"
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
                  helpKey="home.search.type"
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
                  helpKey="home.search.minPrice"
                  placeholder={t("home.search.minPrice")}
                />
                <FieldInput
                  name="maxPrice"
                  label={t("home.search.maxPrice")}
                  helpKey="home.search.maxPrice"
                  placeholder={t("home.search.maxPrice")}
                />
              </div>
              <Button type="submit" className="w-full">
                {t("home.search.submit")}
              </Button>
            </form>
          </Card>
        </Section>

        <Section title={t("home.categories.title")} subtitle={t("home.categories.subtitle")}>
          <div className="grid gap-4 md:grid-cols-3">
            {FEATURE_CATEGORIES.map((cat, index) => (
              <Link key={cat.purpose} href={`/listings?purpose=${cat.purpose}`}>
                <Card
                  className="hrtaj-card transition hover:-translate-y-1 hover:border-[var(--accent)] fade-up"
                  style={{ animationDelay: `${index * 80}ms` }}
                >
                  <h3 className="text-lg font-semibold">{t(cat.titleKey)}</h3>
                  <p className="text-sm text-[var(--muted)]">{t(cat.descKey)}</p>
                </Card>
              </Link>
            ))}
          </div>
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
                    <p className="text-lg font-semibold">
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
          {listings.length === 0 ? (
            <Card className="p-3 sm:p-4">
              <p className="text-sm text-[var(--muted)]">{t("home.featured.empty")}</p>
            </Card>
          ) : (
            <div className="grid gap-4 sm:gap-6 md:grid-cols-3">
              {listings.map((listing, index) => {
                const cover =
                  listing.listing_images?.sort((a, b) => a.sort - b.sort)[0]?.path ?? null;
                const coverUrl = getPublicImageUrl(cover);
                return (
                  <Card
                    key={listing.id}
                    className="group flex flex-col gap-4 fade-up hrtaj-card"
                    style={{ animationDelay: `${index * 80}ms` }}
                  >
                    <Link href={`/listing/${listing.id}`}>
                      <div className="aspect-[4/3] overflow-hidden rounded-xl bg-[var(--surface)]">
                        {coverUrl ? (
                          <img
                            src={coverUrl}
                            alt={listing.title}
                            className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                          />
                        ) : (
                          <div className="flex h-full items-center justify-center text-sm text-[var(--muted)]">
                            {t("general.noImage")}
                          </div>
                        )}
                      </div>
                    </Link>
                    <div className="space-y-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge>{t(getPurposeLabelKey(listing.purpose))}</Badge>
                        <Badge>{t(getPropertyTypeLabelKey(listing.type))}</Badge>
                        <Badge>
                          {listing.beds} {t("detail.stats.rooms")} - {listing.baths} {t("detail.stats.baths")}
                        </Badge>
                      </div>
                      <Link href={`/listing/${listing.id}`}>
                        <h3 className="text-lg font-semibold hover:text-[var(--accent)]">
                          {listing.title}
                        </h3>
                      </Link>
                      <p className="text-sm text-[var(--muted)]">
                        {listing.city}
                        {listing.area ? ` - ${listing.area}` : ""}
                      </p>
                      <p className="text-lg font-semibold text-[var(--accent)]">
                        {formatPrice(listing.price, listing.currency, locale)}
                      </p>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
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
                helpKey="home.request.name"
                required
                placeholder={t("home.request.name")}
              />
              <FieldInput
                name="phone"
                label={t("home.request.phone")}
                helpKey="home.request.phone"
                required
                placeholder={t("home.request.phone")}
                type="tel"
              />
              <FieldSelect
                name="intent"
                label={t("home.request.intent")}
                helpKey="home.request.intent"
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
                helpKey="home.request.area"
                placeholder={t("home.request.area")}
              />
              <FieldInput
                name="budget_min"
                label={t("home.request.budgetMin")}
                helpKey="home.request.budgetMin"
                placeholder={t("home.request.budgetMin")}
                type="number"
              />
              <FieldInput
                name="budget_max"
                label={t("home.request.budgetMax")}
                helpKey="home.request.budgetMax"
                placeholder={t("home.request.budgetMax")}
                type="number"
              />
              <FieldSelect
                name="preferred_contact_time"
                label={t("home.request.contactTime")}
                helpKey="home.request.contactTime"
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
                  helpKey="home.request.notes"
                  placeholder={t("home.request.notes")}
                  className="min-h-[120px]"
                />
              </div>
              <div className="md:col-span-2">
                <Button type="submit" className="w-full">
                  {t("home.request.submit")}
                </Button>
              </div>
            </form>
          </Card>
        </Section>
      </main>
      <SiteFooter showFloating />
    </div>
  );
}



