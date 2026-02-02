import Link from "next/link";
import { createSupabaseServerClient } from "@/lib/supabaseServer";
import { requireRole } from "@/lib/auth";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { Badge, Button, Card, Input, Section, Select, Textarea } from "@/components/ui";
import { createT } from "@/lib/i18n";
import { getServerLocale } from "@/lib/i18n.server";
import {
  createAssetAction,
  createCampaignAction,
  deleteAssetAction,
  deleteCampaignAction,
  submitCampaignAction,
  updateCampaignAction,
} from "./actions";

export default async function DeveloperAdsPage() {
  const { user, role } = await requireRole(["owner", "developer", "admin"], "/developer/ads");
  const supabase = await createSupabaseServerClient();
  const locale = await getServerLocale();
  const t = createT(locale);

  const isAdmin = role === "admin" || role === "owner";

  const { data: membershipData } = await supabase
    .from("developer_members")
    .select("developer_id, developers(name)")
    .eq("user_id", user.id);

  const memberships =
    (membershipData as Array<{ developer_id: string; developers: { name: string } | { name: string }[] | null }> | null) ??
    [];
  const developerIds = memberships.map((m) => m.developer_id);
  const primaryDeveloperName = Array.isArray(memberships[0]?.developers)
    ? memberships[0]?.developers[0]?.name ?? null
    : memberships[0]?.developers?.name ?? null;

  let campaignQuery = supabase
    .from("ad_campaigns")
    .select(
      "id, title_ar, title_en, body_ar, body_en, cta_label_ar, cta_label_en, cta_url, status, developer_id, created_at, ad_assets(id, media_type, url, poster_url, sort_order, is_primary)"
    )
    .order("created_at", { ascending: false });

  if (!isAdmin) {
    if (developerIds.length > 0) {
      campaignQuery = campaignQuery.in("developer_id", developerIds);
    } else {
      campaignQuery = campaignQuery.eq("developer_id", "00000000-0000-0000-0000-000000000000");
    }
  }

  const { data: campaignsData } = await campaignQuery;
  const campaigns = campaignsData ?? [];

  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--text)]">
      <SiteHeader />
      <main className="mx-auto w-full max-w-6xl space-y-10 px-6 py-10">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold">{t("developer.ads.title")}</h1>
            <p className="text-sm text-[var(--muted)]">{t("developer.ads.subtitle")}</p>
            <p className="text-xs text-[var(--muted)]">
              {primaryDeveloperName
                ? t("developer.subtitle.company", { name: primaryDeveloperName })
                : t("developer.subtitle.empty")}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/developer">
              <Button size="sm" variant="secondary">
                {t("developer.ads.back")}
              </Button>
            </Link>
          </div>
        </div>

        <Section title={t("developer.ads.create")} subtitle={t("developer.ads.createHint")}>
          <Card className="space-y-4">
            <form action={createCampaignAction} className="grid gap-3 md:grid-cols-2">
              <Input name="title_ar" placeholder={t("developer.ads.titleAr")} />
              <Input name="title_en" placeholder={t("developer.ads.titleEn")} />
              <Textarea name="body_ar" placeholder={t("developer.ads.bodyAr")} />
              <Textarea name="body_en" placeholder={t("developer.ads.bodyEn")} />
              <Input name="cta_label_ar" placeholder={t("developer.ads.ctaAr")} />
              <Input name="cta_label_en" placeholder={t("developer.ads.ctaEn")} />
              <Input name="cta_url" placeholder={t("developer.ads.ctaUrl")} className="md:col-span-2" />
              {isAdmin ? (
                <Select name="status" defaultValue="draft">
                  <option value="draft">{t("ads.status.draft")}</option>
                  <option value="submitted">{t("ads.status.submitted")}</option>
                  <option value="needs_changes">{t("ads.status.needs_changes")}</option>
                  <option value="approved">{t("ads.status.approved")}</option>
                  <option value="published">{t("ads.status.published")}</option>
                </Select>
              ) : null}
              <Button type="submit" size="sm">
                {t("developer.ads.create")}
              </Button>
            </form>
          </Card>
        </Section>

        <Section title={t("developer.ads.list")} subtitle={t("developer.ads.listHint")}>
          {campaigns.length === 0 ? (
            <Card>
              <p className="text-sm text-[var(--muted)]">{t("developer.ads.empty")}</p>
            </Card>
          ) : (
            <div className="grid gap-4">
              {campaigns.map((campaign) => (
                <Card key={campaign.id} className="space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold">
                        {campaign.title_ar ?? campaign.title_en ?? t("developer.ads.untitled")}
                      </p>
                      <p className="text-xs text-[var(--muted)]">{t("ads.status.label")} {t(`ads.status.${campaign.status}`)}</p>
                    </div>
                    <Badge>{t(`ads.status.${campaign.status}`)}</Badge>
                  </div>

                  <form action={updateCampaignAction} className="grid gap-3 md:grid-cols-2">
                    <input type="hidden" name="id" value={campaign.id} />
                    <Input name="title_ar" defaultValue={campaign.title_ar ?? ""} />
                    <Input name="title_en" defaultValue={campaign.title_en ?? ""} />
                    <Textarea name="body_ar" defaultValue={campaign.body_ar ?? ""} />
                    <Textarea name="body_en" defaultValue={campaign.body_en ?? ""} />
                    <Input name="cta_label_ar" defaultValue={campaign.cta_label_ar ?? ""} />
                    <Input name="cta_label_en" defaultValue={campaign.cta_label_en ?? ""} />
                    <Input name="cta_url" defaultValue={campaign.cta_url ?? ""} className="md:col-span-2" />
                    {isAdmin ? (
                      <Select name="status" defaultValue={campaign.status}>
                        <option value="draft">{t("ads.status.draft")}</option>
                        <option value="submitted">{t("ads.status.submitted")}</option>
                        <option value="needs_changes">{t("ads.status.needs_changes")}</option>
                        <option value="approved">{t("ads.status.approved")}</option>
                        <option value="published">{t("ads.status.published")}</option>
                        <option value="archived">{t("ads.status.archived")}</option>
                      </Select>
                    ) : null}
                    <div className="flex flex-wrap gap-3">
                      <Button type="submit" size="sm" variant="secondary">
                        {t("developer.ads.save")}
                      </Button>
                      <Button type="submit" size="sm" formAction={submitCampaignAction}>
                        {t("developer.ads.submit")}
                      </Button>
                      <Button type="submit" size="sm" variant="danger" formAction={deleteCampaignAction}>
                        {t("developer.ads.delete")}
                      </Button>
                    </div>
                  </form>

                  <div className="border-t border-[var(--border)] pt-4">
                    <h3 className="text-sm font-semibold">{t("developer.ads.assets")}</h3>
                    <form action={createAssetAction} className="mt-3 grid gap-3 md:grid-cols-6">
                      <input type="hidden" name="campaign_id" value={campaign.id} />
                      <Select name="media_type" defaultValue="image">
                        <option value="image">{t("ads.media.image")}</option>
                        <option value="video">{t("ads.media.video")}</option>
                      </Select>
                      <Input name="url" placeholder={t("developer.ads.assetUrl")} className="md:col-span-2" />
                      <Input name="poster_url" placeholder={t("developer.ads.posterUrl")} className="md:col-span-2" />
                      <Input name="sort_order" placeholder={t("developer.ads.order")} type="number" />
                      <label className="flex items-center gap-2 text-xs text-[var(--muted)]">
                        <input type="checkbox" name="is_primary" />
                        {t("developer.ads.primary")}
                      </label>
                      <Button type="submit" size="sm">
                        {t("developer.ads.addAsset")}
                      </Button>
                    </form>
                    <div className="mt-4 grid gap-2">
                      {(campaign.ad_assets ?? []).map((asset) => (
                        <div key={asset.id} className="flex flex-wrap items-center justify-between gap-2 text-xs">
                          <span className="font-semibold">
                            {asset.media_type} · {asset.url}
                          </span>
                          <form action={deleteAssetAction}>
                            <input type="hidden" name="id" value={asset.id} />
                            <Button type="submit" size="sm" variant="danger">
                              {t("developer.ads.remove")}
                            </Button>
                          </form>
                        </div>
                      ))}
                      {(campaign.ad_assets ?? []).length === 0 ? (
                        <p className="text-xs text-[var(--muted)]">{t("developer.ads.assetsEmpty")}</p>
                      ) : null}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </Section>
      </main>
      <SiteFooter />
    </div>
  );
}
