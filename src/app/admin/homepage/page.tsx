import Link from "next/link";
import { createSupabaseServerClient } from "@/lib/supabaseServer";
import { requireRole } from "@/lib/auth";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { Badge, Button, Card, Input, Section, Select } from "@/components/ui";
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
              <Select name="media_type" defaultValue="image">
                <option value="image">{t("admin.homepage.media.image")}</option>
                <option value="video">{t("admin.homepage.media.video")}</option>
              </Select>
              <Input name="url" placeholder={t("admin.homepage.media.url")} className="md:col-span-2" required />
              <Input name="poster_url" placeholder={t("admin.homepage.media.poster")} className="md:col-span-2" />
              <Input name="sort_order" placeholder={t("admin.homepage.order")} type="number" />
              <Input name="title" placeholder={t("admin.homepage.media.titleField")} className="md:col-span-2" />
              <label className="flex items-center gap-2 text-sm md:col-span-2">
                <input type="checkbox" name="is_published" />
                {t("admin.homepage.published")}
              </label>
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
                  <Select name="media_type" defaultValue={item.media_type}>
                    <option value="image">{t("admin.homepage.media.image")}</option>
                    <option value="video">{t("admin.homepage.media.video")}</option>
                  </Select>
                  <Input name="url" defaultValue={item.url} className="md:col-span-2" />
                  <Input name="poster_url" defaultValue={item.poster_url ?? ""} className="md:col-span-2" />
                  <Input name="sort_order" defaultValue={item.sort_order} type="number" />
                  <Input name="title" defaultValue={item.title ?? ""} className="md:col-span-2" />
                  <label className="flex items-center gap-2 text-sm md:col-span-2">
                    <input type="checkbox" name="is_published" defaultChecked={item.is_published} />
                    {t("admin.homepage.published")}
                  </label>
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
              <Input name="label_ar" placeholder={t("admin.homepage.metrics.labelAr")} />
              <Input name="label_en" placeholder={t("admin.homepage.metrics.labelEn")} />
              <Input name="value" placeholder={t("admin.homepage.metrics.value")} />
              <Input name="sort_order" placeholder={t("admin.homepage.order")} type="number" />
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" name="is_published" />
                {t("admin.homepage.published")}
              </label>
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
                  <Input name="label_ar" defaultValue={metric.label_ar} />
                  <Input name="label_en" defaultValue={metric.label_en} />
                  <Input name="value" defaultValue={metric.value} />
                  <Input name="sort_order" defaultValue={metric.sort_order} type="number" />
                  <label className="flex items-center gap-2 text-sm">
                    <input type="checkbox" name="is_published" defaultChecked={metric.is_published} />
                    {t("admin.homepage.published")}
                  </label>
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
              <Input name="title_ar" placeholder={t("admin.homepage.projects.titleAr")} />
              <Input name="title_en" placeholder={t("admin.homepage.projects.titleEn")} />
              <Input name="location_ar" placeholder={t("admin.homepage.projects.locationAr")} />
              <Input name="location_en" placeholder={t("admin.homepage.projects.locationEn")} />
              <Input name="starting_price" placeholder={t("admin.homepage.projects.price")} type="number" />
              <Input name="currency" placeholder={t("admin.homepage.projects.currency")} defaultValue="EGP" />
              <Input name="image_url" placeholder={t("admin.homepage.projects.image")} className="md:col-span-2" />
              <Input name="cta_url" placeholder={t("admin.homepage.projects.cta")} className="md:col-span-2" />
              <Input name="sort_order" placeholder={t("admin.homepage.order")} type="number" />
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" name="is_published" />
                {t("admin.homepage.published")}
              </label>
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
                  <Input name="title_ar" defaultValue={project.title_ar} />
                  <Input name="title_en" defaultValue={project.title_en} />
                  <Input name="location_ar" defaultValue={project.location_ar} />
                  <Input name="location_en" defaultValue={project.location_en} />
                  <Input name="starting_price" defaultValue={project.starting_price ?? ""} type="number" />
                  <Input name="currency" defaultValue={project.currency ?? "EGP"} />
                  <Input name="image_url" defaultValue={project.image_url ?? ""} className="md:col-span-2" />
                  <Input name="cta_url" defaultValue={project.cta_url ?? ""} className="md:col-span-2" />
                  <Input name="sort_order" defaultValue={project.sort_order} type="number" />
                  <label className="flex items-center gap-2 text-sm">
                    <input type="checkbox" name="is_published" defaultChecked={project.is_published} />
                    {t("admin.homepage.published")}
                  </label>
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
