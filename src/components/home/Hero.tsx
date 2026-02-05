import Link from "next/link";
import { Badge, Button, Card } from "@/components/ui";
import { FieldInput, FieldSelect } from "@/components/FieldHelp";

type TFn = (key: string, params?: Record<string, string | number>) => string;

type HeroMediaItem = {
  id: string;
  media_type: string;
  url: string;
  poster_url: string | null;
  title: string | null;
};

type FeatureCategory = {
  purpose: string;
  titleKey: string;
};

type HeroProps = {
  t: TFn;
  heroVideo: HeroMediaItem | null;
  heroImages: HeroMediaItem[];
  featureCategories: ReadonlyArray<FeatureCategory>;
  onRequestAction: (formData: FormData) => Promise<void>;
  purposeOptions: ReadonlyArray<{ value: string; labelKey: string }>;
};

export function Hero({
  t,
  heroVideo,
  heroImages,
  featureCategories,
  onRequestAction,
  purposeOptions,
}: HeroProps) {
  return (
    <section className="relative overflow-hidden rounded-[28px] border border-[var(--border)] bg-[var(--surface)]/90 p-3 shadow-[var(--shadow)] fade-up sm:rounded-[32px] sm:p-6 lg:p-8 hero-shell">
      <div className="absolute inset-0">
        {heroVideo ? (
          <video
            className="hero-video"
            autoPlay
            muted
            loop
            playsInline
            preload="metadata"
            poster={heroVideo.poster_url ?? undefined}
          >
            <source src={heroVideo.url} media="(min-width: 768px)" />
          </video>
        ) : heroImages.length > 0 ? (
          <div className="hero-carousel">
            <div className="hero-track">
              {[...heroImages, ...heroImages].map((item, index) => (
                <div className="hero-slide" key={`${item.id}-${index}`}>
                  <img
                    src={item.url}
                    alt={item.title ?? t("home.hero.badge")}
                    loading={index === 0 ? "eager" : "lazy"}
                    decoding="async"
                  />
                </div>
              ))}
            </div>
          </div>
        ) : null}
        <div className="hero-overlay" />
      </div>
      <div className="relative z-10 grid gap-4 sm:gap-8 lg:grid-cols-[1.1fr,0.9fr]">
        <div className="hero-content space-y-3 sm:space-y-6">
          <Badge className="hero-badge">{t("home.hero.badge")}</Badge>
          <h1 className="hero-title max-w-none text-2xl font-semibold leading-tight text-balance sm:max-w-[22ch] sm:text-4xl lg:text-5xl">
            {t("home.hero.title")}
          </h1>
          <p className="hero-subtitle max-w-lg text-sm leading-relaxed text-[var(--muted)] sm:text-base">
            {t("home.hero.subtitle")}
          </p>
          <div className="hero-actions flex flex-col gap-3 sm:flex-row">
            <Link href="/listings">
              <Button size="md" className="w-full sm:w-auto sm:h-12 sm:px-5 sm:text-base">
                {t("home.hero.ctaPrimary")}
              </Button>
            </Link>
            <a href="https://wa.me/201020614022" target="_blank" rel="noreferrer">
              <Button
                size="md"
                variant="secondary"
                className="w-full sm:w-auto sm:h-12 sm:px-5 sm:text-base"
              >
                {t("home.hero.ctaSecondary")}
              </Button>
            </a>
          </div>
          <Card className="hero-search-card space-y-2 bg-[var(--surface)]/90 p-3 sm:space-y-3 sm:p-4">
            <p className="text-xs font-semibold sm:text-sm">{t("home.hero.searchTitle")}</p>
            <form action="/listings" className="hero-search-form grid gap-2 sm:gap-3 md:grid-cols-3">
              <FieldSelect
                name="transaction"
                label={t("home.hero.search.transaction")}
                defaultValue=""
              >
                <option value="">{t("home.hero.search.transaction")}</option>
                {purposeOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {t(option.labelKey)}
                  </option>
                ))}
              </FieldSelect>
              <FieldInput
                name="area"
                label={t("home.hero.search.area")}
                placeholder={t("home.hero.search.area")}
              />
              <FieldInput
                name="priceMax"
                label={t("home.hero.search.budget")}
                placeholder={t("home.hero.search.budget")}
                type="number"
              />
              <div className="md:col-span-3 flex justify-end">
                <Button type="submit" size="sm">
                  {t("home.hero.search.cta")}
                </Button>
              </div>
            </form>
          </Card>
          <div className="hero-quick flex items-center gap-2 overflow-x-auto whitespace-nowrap pb-1 text-xs text-[var(--muted)]">
            <span className="font-semibold text-[var(--text)]">{t("home.hero.quick")}</span>
            {featureCategories.map((cat) => (
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
        <Card className="callback-card hero-callback space-y-3 bg-[var(--surface-elevated)]/90 p-3 backdrop-blur sm:space-y-4 sm:p-5">
          <h2 className="callback-title text-lg font-semibold">{t("home.callback.title")}</h2>
          <p className="callback-subtitle text-sm text-[var(--muted)]">{t("home.callback.subtitle")}</p>
          <form action={onRequestAction} className="callback-form space-y-2 sm:space-y-3">
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
            <div className="callback-grid grid gap-2 sm:gap-3 md:grid-cols-2">
              <FieldInput
                name="name"
                label={t("home.callback.name")}
                placeholder={t("home.callback.name")}
                required
              />
              <FieldInput
                name="email"
                label={t("home.callback.email")}
                placeholder={t("home.callback.email")}
                type="email"
              />
            </div>
            <FieldInput
              name="phone"
              label={t("home.callback.phone")}
              placeholder={t("home.callback.phone")}
              required
              type="tel"
            />
            <Button type="submit" size="md" className="callback-submit w-full sm:h-12 sm:text-base">
              {t("home.callback.submit")}
            </Button>
          </form>
        </Card>
      </div>
    </section>
  );
}
