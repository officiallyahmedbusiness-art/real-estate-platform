import Link from "next/link";
import { createSupabaseServerClient } from "@/lib/supabaseServer";
import { requireRole } from "@/lib/auth";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { Badge, Button, Card, Input, Section, Select, Textarea } from "@/components/ui";
import { createT } from "@/lib/i18n";
import { getServerLocale } from "@/lib/i18n.server";
import {
  approveCampaignAction,
  archiveCampaignAction,
  publishCampaignAction,
  requestChangesAction,
  updateAdCampaignAction,
} from "./actions";

export default async function AdminAdsPage() {
  await requireRole(["owner", "admin"], "/admin/ads");
  const locale = await getServerLocale();
  const t = createT(locale);
  const supabase = await createSupabaseServerClient();

  type CampaignRow = {
    id: string;
    title_ar: string | null;
    title_en: string | null;
    body_ar: string | null;
    body_en: string | null;
    cta_label_ar: string | null;
    cta_label_en: string | null;
    cta_url: string | null;
    status: string;
    created_at: string;
    developer_id: string | null;
    advertiser_accounts: { name: string } | { name: string }[] | null;
    ad_assets:
      | Array<{
          id: string;
          media_type: string;
          url: string;
          poster_url: string | null;
          sort_order: number;
          is_primary: boolean;
        }>
      | null;
  };

  const { data: campaignsData } = await supabase
    .from("ad_campaigns")
    .select(
      "id, title_ar, title_en, body_ar, body_en, cta_label_ar, cta_label_en, cta_url, status, created_at, developer_id, advertiser_accounts(name), ad_assets(id, media_type, url, poster_url, sort_order, is_primary)"
    )
    .order("created_at", { ascending: false });

  const campaigns = (campaignsData ?? []) as CampaignRow[];

  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--text)]">
      <SiteHeader />
      <main className="mx-auto w-full max-w-6xl space-y-10 px-6 py-10">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold">{t("admin.ads.title")}</h1>
            <p className="text-sm text-[var(--muted)]">{t("admin.ads.subtitle")}</p>
          </div>
          <Link href="/admin">
            <Button size="sm" variant="secondary">
              {t("admin.ads.back")}
            </Button>
          </Link>
        </div>

        <Section title={t("admin.ads.queue")} subtitle={t("admin.ads.queueHint")}>
          {campaigns.length === 0 ? (
            <Card>
              <p className="text-sm text-[var(--muted)]">{t("admin.ads.empty")}</p>
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
                      <p className="text-xs text-[var(--muted)]">
                        {t("admin.ads.developer")}{" "}
                        {Array.isArray(campaign.advertiser_accounts)
                          ? campaign.advertiser_accounts[0]?.name ?? "-"
                          : campaign.advertiser_accounts?.name ?? "-"}
                      </p>
                    </div>
                    <Badge>{t(`ads.status.${campaign.status}`)}</Badge>
                  </div>

                  <form action={updateAdCampaignAction} className="grid gap-3 md:grid-cols-2">
                    <input type="hidden" name="id" value={campaign.id} />
                    <Input name="title_ar" defaultValue={campaign.title_ar ?? ""} />
                    <Input name="title_en" defaultValue={campaign.title_en ?? ""} />
                    <Textarea name="body_ar" defaultValue={campaign.body_ar ?? ""} />
                    <Textarea name="body_en" defaultValue={campaign.body_en ?? ""} />
                    <Input name="cta_label_ar" defaultValue={campaign.cta_label_ar ?? ""} />
                    <Input name="cta_label_en" defaultValue={campaign.cta_label_en ?? ""} />
                    <Input name="cta_url" defaultValue={campaign.cta_url ?? ""} className="md:col-span-2" />
                    <Select name="status" defaultValue={campaign.status}>
                      <option value="draft">{t("ads.status.draft")}</option>
                      <option value="submitted">{t("ads.status.submitted")}</option>
                      <option value="needs_changes">{t("ads.status.needs_changes")}</option>
                      <option value="approved">{t("ads.status.approved")}</option>
                      <option value="published">{t("ads.status.published")}</option>
                      <option value="archived">{t("ads.status.archived")}</option>
                    </Select>
                    <Button type="submit" size="sm" variant="secondary">
                      {t("admin.ads.save")}
                    </Button>
                  </form>

                  <div className="flex flex-wrap gap-3">
                    <form action={requestChangesAction}>
                      <input type="hidden" name="id" value={campaign.id} />
                      <Button type="submit" size="sm" variant="secondary">
                        {t("admin.ads.requestChanges")}
                      </Button>
                    </form>
                    <form action={approveCampaignAction}>
                      <input type="hidden" name="id" value={campaign.id} />
                      <Button type="submit" size="sm">
                        {t("admin.ads.approve")}
                      </Button>
                    </form>
                    <form action={publishCampaignAction}>
                      <input type="hidden" name="id" value={campaign.id} />
                      <Button type="submit" size="sm">
                        {t("admin.ads.publish")}
                      </Button>
                    </form>
                    <form action={archiveCampaignAction}>
                      <input type="hidden" name="id" value={campaign.id} />
                      <Button type="submit" size="sm" variant="danger">
                        {t("admin.ads.archive")}
                      </Button>
                    </form>
                  </div>

                  <div className="border-t border-[var(--border)] pt-4">
                    <p className="text-sm font-semibold">{t("developer.ads.assets")}</p>
                    {(campaign.ad_assets ?? []).length === 0 ? (
                      <p className="text-xs text-[var(--muted)]">{t("developer.ads.assetsEmpty")}</p>
                    ) : (
                      <div className="mt-3 grid gap-3 md:grid-cols-3">
                        {(campaign.ad_assets ?? []).map((asset) => (
                          <div
                            key={asset.id}
                            className="flex flex-col gap-2 rounded-xl border border-[var(--border)] bg-[var(--surface)] p-3 text-xs"
                          >
                            <div className="aspect-[4/3] overflow-hidden rounded-lg bg-[var(--surface-2)]">
                              {asset.media_type === "video" ? (
                                <video
                                  className="h-full w-full object-cover"
                                  muted
                                  autoPlay
                                  loop
                                  playsInline
                                  poster={asset.poster_url ?? undefined}
                                >
                                  <source src={asset.url} />
                                </video>
                              ) : (
                                <img src={asset.url} alt={asset.url} className="h-full w-full object-cover" />
                              )}
                            </div>
                            <span className="text-[var(--muted)]">{asset.media_type}</span>
                            {asset.is_primary ? <Badge>{t("developer.ads.primary")}</Badge> : null}
                          </div>
                        ))}
                      </div>
                    )}
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
