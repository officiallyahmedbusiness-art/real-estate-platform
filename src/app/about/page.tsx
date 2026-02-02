import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { Badge, Card, Section } from "@/components/ui";
import { createT } from "@/lib/i18n";
import { getServerLocale } from "@/lib/i18n.server";

export default async function AboutPage() {
  const locale = await getServerLocale();
  const t = createT(locale);

  const videoIds = [
    process.env.NEXT_PUBLIC_ABOUT_VIDEO_ID,
    process.env.NEXT_PUBLIC_ABOUT_VIDEO_ID_2,
  ].filter(Boolean) as string[];

  const processSteps = [
    { title: t("about.process.step1.title"), body: t("about.process.step1.body") },
    { title: t("about.process.step2.title"), body: t("about.process.step2.body") },
    { title: t("about.process.step3.title"), body: t("about.process.step3.body") },
  ];

  const coverage = [
    t("about.coverage.item1"),
    t("about.coverage.item2"),
    t("about.coverage.item3"),
    t("about.coverage.item4"),
    t("about.coverage.item5"),
  ];

  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--text)]">
      <SiteHeader />
      <main className="mx-auto w-full max-w-7xl space-y-12 px-4 py-8 pb-[calc(6rem+env(safe-area-inset-bottom))] sm:px-6 sm:py-10 lg:px-8">
        <section className="space-y-4">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--muted)]">
            {t("about.kicker")}
          </p>
          <h1 className="text-3xl font-semibold md:text-4xl">{t("about.title")}</h1>
          <p className="max-w-3xl text-sm text-[var(--muted)] md:text-base">
            {t("about.subtitle")}
          </p>
        </section>

        <div className="grid gap-6 lg:grid-cols-[2fr,1fr]">
          <Card className="space-y-4 hrtaj-card">
            <h2 className="text-xl font-semibold">{t("about.story.title")}</h2>
            <p className="text-sm text-[var(--muted)]">{t("about.story.body")}</p>
            <div className="grid gap-3 sm:grid-cols-2">
              <Card className="space-y-2">
                <h3 className="text-base font-semibold">{t("about.values.data")}</h3>
                <p className="text-xs text-[var(--muted)]">{t("about.values.dataDesc")}</p>
              </Card>
              <Card className="space-y-2">
                <h3 className="text-base font-semibold">{t("about.values.partners")}</h3>
                <p className="text-xs text-[var(--muted)]">{t("about.values.partnersDesc")}</p>
              </Card>
              <Card className="space-y-2">
                <h3 className="text-base font-semibold">{t("about.values.crm")}</h3>
                <p className="text-xs text-[var(--muted)]">{t("about.values.crmDesc")}</p>
              </Card>
              <Card className="space-y-2">
                <h3 className="text-base font-semibold">{t("about.values.trust")}</h3>
                <p className="text-xs text-[var(--muted)]">{t("about.values.trustDesc")}</p>
              </Card>
            </div>
          </Card>

          <Card className="space-y-3 hrtaj-card">
            <h2 className="text-xl font-semibold">{t("about.media.title")}</h2>
            {videoIds.length ? (
              <div className={`grid gap-3 ${videoIds.length > 1 ? "md:grid-cols-2" : ""}`}>
                {videoIds.map((videoId) => (
                  <div
                    key={videoId}
                    className="aspect-video overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface)]"
                  >
                    <iframe
                      className="h-full w-full"
                      src={`https://www.youtube.com/embed/${videoId}`}
                      title="HRTAJ"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex aspect-video items-center justify-center rounded-2xl border border-[var(--border)] bg-[var(--surface)] text-sm text-[var(--muted)]">
                {t("about.media.placeholder")}
              </div>
            )}
            <p className="text-xs text-[var(--muted)]">{t("about.media.caption")}</p>
          </Card>
        </div>

        <Section title={t("about.process.title")} subtitle={t("about.process.subtitle")}>
          <div className="grid gap-4 md:grid-cols-3">
            {processSteps.map((step) => (
              <Card key={step.title} className="space-y-2 hrtaj-card">
                <h3 className="text-base font-semibold">{step.title}</h3>
                <p className="text-sm text-[var(--muted)]">{step.body}</p>
              </Card>
            ))}
          </div>
        </Section>

        <Section title={t("about.coverage.title")} subtitle={t("about.coverage.subtitle")}>
          <div className="flex flex-wrap gap-2">
            {coverage.map((item) => (
              <Badge key={item}>{item}</Badge>
            ))}
          </div>
        </Section>

        <Section title={t("about.impact.title")} subtitle={t("about.impact.subtitle")}>
          <div className="grid gap-4 md:grid-cols-3">
            <Card className="space-y-1">
              <p className="text-xs text-[var(--muted)]">{t("about.impact.metric1.label")}</p>
              <p className="text-2xl font-semibold">{t("about.impact.metric1.value")}</p>
            </Card>
            <Card className="space-y-1">
              <p className="text-xs text-[var(--muted)]">{t("about.impact.metric2.label")}</p>
              <p className="text-2xl font-semibold">{t("about.impact.metric2.value")}</p>
            </Card>
            <Card className="space-y-1">
              <p className="text-xs text-[var(--muted)]">{t("about.impact.metric3.label")}</p>
              <p className="text-2xl font-semibold">{t("about.impact.metric3.value")}</p>
            </Card>
          </div>
        </Section>
      </main>
      <SiteFooter showFloating />
    </div>
  );
}
