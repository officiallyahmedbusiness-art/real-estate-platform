import Link from "next/link";
import { createSupabaseServerClient } from "@/lib/supabaseServer";
import { requireRole } from "@/lib/auth";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { Badge, Button, Card, Section } from "@/components/ui";
import { FieldCheckbox, FieldInput, FieldSelect } from "@/components/FieldHelp";
import { createT } from "@/lib/i18n";
import { getServerLocale } from "@/lib/i18n.server";
import {
  createFeaturedProjectAction,
  createHeroMediaAction,
  createMetricAction,
  deleteFeaturedProjectAction,
  deleteHeroMediaAction,
  deleteMetricAction,
  updateFeaturedProjectAction,
  updateHeroMediaAction,
  updateMetricAction,
} from "./actions";

export default async function AdminHomepagePage() {
  await requireRole(["owner", "admin"], "/admin/homepage");
  const locale = await getServerLocale();
  const t = createT(locale);
  const supabase = await createSupabaseServerClient();

  const { data: mediaData } = await supabase
    .from("site_media")
    .select("id, placement, media_type, url, poster_url, title, sort_order, is_published, created_at")
    .order("sort_order", { ascending: true });
  const media = mediaData ?? [];

  const { data: metricsData } = await supabase
    .from("site_metrics")
    .select("id, label_ar, label_en, value, sort_order, is_published")
    .order("sort_order", { ascending: true });
  const metrics = metricsData ?? [];

  const { data: projectsData } = await supabase
    .from("featured_projects")
    .select(
      "id, title_ar, title_en, location_ar, location_en, starting_price, currency, image_url, cta_url, sort_order, is_published"
    )
    .order("sort_order", { ascending: true });
  const projects = projectsData ?? [];

  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--text)]">
      <SiteHeader />
      <main className="mx-auto w-full max-w-6xl space-y-10 px-6 py-10">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold">{t("admin.homepage.title")}</h1>
            <p className="text-sm text-[var(--muted)]">{t("admin.homepage.subtitle")}</p>
          </div>
          <Link href="/admin">
            <Button variant="secondary" size="sm">
              {t("admin.homepage.back")}
            </Button>
          </Link>
        </div>

        <Section title={t("admin.homepage.media.title")} subtitle={t("admin.homepage.media.subtitle")}>
          <Card className="space-y-4">
            <form action={createHeroMediaAction} className="grid gap-3 md:grid-cols-6">
              <FieldSelect
                name="media_type"
                label={t("admin.homepage.media.type")}
                helpKey="admin.homepage.media.type"
                defaultValue="image"
              >
                <option value="image">{t("admin.homepage.media.image")}</option>
                <option value="video">{t("admin.homepage.media.video")}</option>
              </FieldSelect>
              <FieldInput
                name="url"
                label={t("admin.homepage.media.url")}
                helpKey="admin.homepage.media.url"
                placeholder={t("admin.homepage.media.url")}
                wrapperClassName="md:col-span-2"
                required
              />
              <FieldInput
                name="poster_url"
                label={t("admin.homepage.media.poster")}
                helpKey="admin.homepage.media.poster"
                placeholder={t("admin.homepage.media.poster")}
                wrapperClassName="md:col-span-2"
              />
              <FieldInput
                name="sort_order"
                label={t("admin.homepage.order")}
                helpKey="admin.homepage.media.sort_order"
                placeholder={t("admin.homepage.order")}
                type="number"
              />
              <FieldInput
                name="title"
                label={t("admin.homepage.media.titleField")}
                helpKey="admin.homepage.media.title"
                placeholder={t("admin.homepage.media.titleField")}
                wrapperClassName="md:col-span-2"
              />
              <FieldCheckbox
                name="is_published"
                label={t("admin.homepage.published")}
                helpKey="admin.homepage.media.is_published"
                wrapperClassName="md:col-span-2"
              />
              <Button type="submit" size="sm" className="md:col-span-2">
                {t("admin.homepage.add")}
              </Button>
            </form>
          </Card>
          <div className="grid gap-4">
            {media.map((item) => (
              <Card key={item.id} className="space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="space-y-1">
                    <p className="text-sm font-semibold">{item.title ?? item.url}</p>
                    <p className="text-xs text-[var(--muted)]">{item.media_type}</p>
                  </div>
                  {item.is_published ? <Badge>{t("admin.homepage.published")}</Badge> : null}
                </div>
                <form action={updateHeroMediaAction} className="grid gap-3 md:grid-cols-6">
                  <input type="hidden" name="id" value={item.id} />
                  <FieldSelect
                    name="media_type"
                    label={t("admin.homepage.media.type")}
                    helpKey="admin.homepage.media.type"
                    defaultValue={item.media_type}
                  >
                    <option value="image">{t("admin.homepage.media.image")}</option>
                    <option value="video">{t("admin.homepage.media.video")}</option>
                  </FieldSelect>
                  <FieldInput
                    name="url"
                    label={t("admin.homepage.media.url")}
                    helpKey="admin.homepage.media.url"
                    defaultValue={item.url}
                    wrapperClassName="md:col-span-2"
                  />
                  <FieldInput
                    name="poster_url"
                    label={t("admin.homepage.media.poster")}
                    helpKey="admin.homepage.media.poster"
                    defaultValue={item.poster_url ?? ""}
                    wrapperClassName="md:col-span-2"
                  />
                  <FieldInput
                    name="sort_order"
                    label={t("admin.homepage.order")}
                    helpKey="admin.homepage.media.sort_order"
                    defaultValue={item.sort_order}
                    type="number"
                  />
                  <FieldInput
                    name="title"
                    label={t("admin.homepage.media.titleField")}
                    helpKey="admin.homepage.media.title"
                    defaultValue={item.title ?? ""}
                    wrapperClassName="md:col-span-2"
                  />
                  <FieldCheckbox
                    name="is_published"
                    label={t("admin.homepage.published")}
                    helpKey="admin.homepage.media.is_published"
                    defaultChecked={item.is_published}
                    wrapperClassName="md:col-span-2"
                  />
                  <div className="flex gap-3 md:col-span-2">
                    <Button type="submit" size="sm" variant="secondary">
                      {t("admin.homepage.save")}
                    </Button>
                    <Button type="submit" size="sm" variant="danger" formAction={deleteHeroMediaAction}>
                      {t("admin.homepage.delete")}
                    </Button>
                  </div>
                </form>
              </Card>
            ))}
          </div>
        </Section>

        <Section title={t("admin.homepage.metrics.title")} subtitle={t("admin.homepage.metrics.subtitle")}>
          <Card className="space-y-4">
            <form action={createMetricAction} className="grid gap-3 md:grid-cols-6">
              <FieldInput
                name="label_ar"
                label={t("admin.homepage.metrics.labelAr")}
                helpKey="admin.homepage.metrics.label_ar"
                placeholder={t("admin.homepage.metrics.labelAr")}
              />
              <FieldInput
                name="label_en"
                label={t("admin.homepage.metrics.labelEn")}
                helpKey="admin.homepage.metrics.label_en"
                placeholder={t("admin.homepage.metrics.labelEn")}
              />
              <FieldInput
                name="value"
                label={t("admin.homepage.metrics.value")}
                helpKey="admin.homepage.metrics.value"
                placeholder={t("admin.homepage.metrics.value")}
              />
              <FieldInput
                name="sort_order"
                label={t("admin.homepage.order")}
                helpKey="admin.homepage.metrics.sort_order"
                placeholder={t("admin.homepage.order")}
                type="number"
              />
              <FieldCheckbox
                name="is_published"
                label={t("admin.homepage.published")}
                helpKey="admin.homepage.metrics.is_published"
              />
              <Button type="submit" size="sm">
                {t("admin.homepage.add")}
              </Button>
            </form>
          </Card>
          <div className="grid gap-4">
            {metrics.map((metric) => (
              <Card key={metric.id}>
                <form action={updateMetricAction} className="grid gap-3 md:grid-cols-6">
                  <input type="hidden" name="id" value={metric.id} />
                  <FieldInput
                    name="label_ar"
                    label={t("admin.homepage.metrics.labelAr")}
                    helpKey="admin.homepage.metrics.label_ar"
                    defaultValue={metric.label_ar}
                  />
                  <FieldInput
                    name="label_en"
                    label={t("admin.homepage.metrics.labelEn")}
                    helpKey="admin.homepage.metrics.label_en"
                    defaultValue={metric.label_en}
                  />
                  <FieldInput
                    name="value"
                    label={t("admin.homepage.metrics.value")}
                    helpKey="admin.homepage.metrics.value"
                    defaultValue={metric.value}
                  />
                  <FieldInput
                    name="sort_order"
                    label={t("admin.homepage.order")}
                    helpKey="admin.homepage.metrics.sort_order"
                    defaultValue={metric.sort_order}
                    type="number"
                  />
                  <FieldCheckbox
                    name="is_published"
                    label={t("admin.homepage.published")}
                    helpKey="admin.homepage.metrics.is_published"
                    defaultChecked={metric.is_published}
                  />
                  <div className="flex gap-3">
                    <Button type="submit" size="sm" variant="secondary">
                      {t("admin.homepage.save")}
                    </Button>
                    <Button type="submit" size="sm" variant="danger" formAction={deleteMetricAction}>
                      {t("admin.homepage.delete")}
                    </Button>
                  </div>
                </form>
              </Card>
            ))}
          </div>
        </Section>

        <Section title={t("admin.homepage.projects.title")} subtitle={t("admin.homepage.projects.subtitle")}>
          <Card className="space-y-4">
            <form action={createFeaturedProjectAction} className="grid gap-3 md:grid-cols-6">
              <FieldInput
                name="title_ar"
                label={t("admin.homepage.projects.titleAr")}
                helpKey="admin.homepage.projects.title_ar"
                placeholder={t("admin.homepage.projects.titleAr")}
              />
              <FieldInput
                name="title_en"
                label={t("admin.homepage.projects.titleEn")}
                helpKey="admin.homepage.projects.title_en"
                placeholder={t("admin.homepage.projects.titleEn")}
              />
              <FieldInput
                name="location_ar"
                label={t("admin.homepage.projects.locationAr")}
                helpKey="admin.homepage.projects.location_ar"
                placeholder={t("admin.homepage.projects.locationAr")}
              />
              <FieldInput
                name="location_en"
                label={t("admin.homepage.projects.locationEn")}
                helpKey="admin.homepage.projects.location_en"
                placeholder={t("admin.homepage.projects.locationEn")}
              />
              <FieldInput
                name="starting_price"
                label={t("admin.homepage.projects.price")}
                helpKey="admin.homepage.projects.starting_price"
                placeholder={t("admin.homepage.projects.price")}
                type="number"
              />
              <FieldInput
                name="currency"
                label={t("admin.homepage.projects.currency")}
                helpKey="admin.homepage.projects.currency"
                placeholder={t("admin.homepage.projects.currency")}
                defaultValue="EGP"
              />
              <FieldInput
                name="image_url"
                label={t("admin.homepage.projects.image")}
                helpKey="admin.homepage.projects.image_url"
                placeholder={t("admin.homepage.projects.image")}
                wrapperClassName="md:col-span-2"
              />
              <FieldInput
                name="cta_url"
                label={t("admin.homepage.projects.cta")}
                helpKey="admin.homepage.projects.cta_url"
                placeholder={t("admin.homepage.projects.cta")}
                wrapperClassName="md:col-span-2"
              />
              <FieldInput
                name="sort_order"
                label={t("admin.homepage.order")}
                helpKey="admin.homepage.projects.sort_order"
                placeholder={t("admin.homepage.order")}
                type="number"
              />
              <FieldCheckbox
                name="is_published"
                label={t("admin.homepage.published")}
                helpKey="admin.homepage.projects.is_published"
              />
              <Button type="submit" size="sm">
                {t("admin.homepage.add")}
              </Button>
            </form>
          </Card>
          <div className="grid gap-4">
            {projects.map((project) => (
              <Card key={project.id}>
                <form action={updateFeaturedProjectAction} className="grid gap-3 md:grid-cols-6">
                  <input type="hidden" name="id" value={project.id} />
                  <FieldInput
                    name="title_ar"
                    label={t("admin.homepage.projects.titleAr")}
                    helpKey="admin.homepage.projects.title_ar"
                    defaultValue={project.title_ar}
                  />
                  <FieldInput
                    name="title_en"
                    label={t("admin.homepage.projects.titleEn")}
                    helpKey="admin.homepage.projects.title_en"
                    defaultValue={project.title_en}
                  />
                  <FieldInput
                    name="location_ar"
                    label={t("admin.homepage.projects.locationAr")}
                    helpKey="admin.homepage.projects.location_ar"
                    defaultValue={project.location_ar}
                  />
                  <FieldInput
                    name="location_en"
                    label={t("admin.homepage.projects.locationEn")}
                    helpKey="admin.homepage.projects.location_en"
                    defaultValue={project.location_en}
                  />
                  <FieldInput
                    name="starting_price"
                    label={t("admin.homepage.projects.price")}
                    helpKey="admin.homepage.projects.starting_price"
                    defaultValue={project.starting_price ?? ""}
                    type="number"
                  />
                  <FieldInput
                    name="currency"
                    label={t("admin.homepage.projects.currency")}
                    helpKey="admin.homepage.projects.currency"
                    defaultValue={project.currency ?? "EGP"}
                  />
                  <FieldInput
                    name="image_url"
                    label={t("admin.homepage.projects.image")}
                    helpKey="admin.homepage.projects.image_url"
                    defaultValue={project.image_url ?? ""}
                    wrapperClassName="md:col-span-2"
                  />
                  <FieldInput
                    name="cta_url"
                    label={t("admin.homepage.projects.cta")}
                    helpKey="admin.homepage.projects.cta_url"
                    defaultValue={project.cta_url ?? ""}
                    wrapperClassName="md:col-span-2"
                  />
                  <FieldInput
                    name="sort_order"
                    label={t("admin.homepage.order")}
                    helpKey="admin.homepage.projects.sort_order"
                    defaultValue={project.sort_order}
                    type="number"
                  />
                  <FieldCheckbox
                    name="is_published"
                    label={t("admin.homepage.published")}
                    helpKey="admin.homepage.projects.is_published"
                    defaultChecked={project.is_published}
                  />
                  <div className="flex gap-3">
                    <Button type="submit" size="sm" variant="secondary">
                      {t("admin.homepage.save")}
                    </Button>
                    <Button type="submit" size="sm" variant="danger" formAction={deleteFeaturedProjectAction}>
                      {t("admin.homepage.delete")}
                    </Button>
                  </div>
                </form>
              </Card>
            ))}
          </div>
        </Section>
      </main>
      <SiteFooter />
    </div>
  );
}
