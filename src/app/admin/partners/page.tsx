import Link from "next/link";
import { requireRole } from "@/lib/auth";
import { createSupabaseServerClient } from "@/lib/supabaseServer";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { Button, Card, Input, Section } from "@/components/ui";
import { createT } from "@/lib/i18n";
import { getServerLocale } from "@/lib/i18n.server";
import {
  createPartnerAction,
  updatePartnerAction,
  deletePartnerAction,
} from "./actions";

export default async function AdminPartnersPage() {
  await requireRole(["owner", "admin"], "/admin/partners");
  const locale = await getServerLocale();
  const t = createT(locale);
  const supabase = await createSupabaseServerClient();

  const { data } = await supabase
    .from("marketing_partners")
    .select("id, name_ar, name_en, logo_url, sort_order, is_active")
    .order("sort_order", { ascending: true });
  const partners = data ?? [];

  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--text)]">
      <SiteHeader />
      <main className="mx-auto w-full max-w-6xl space-y-8 px-6 py-10">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold">{t("admin.partners.title")}</h1>
            <p className="text-sm text-[var(--muted)]">{t("admin.partners.subtitle")}</p>
          </div>
          <Link href="/admin">
            <Button size="sm" variant="secondary">
              {t("admin.homepage.back")}
            </Button>
          </Link>
        </div>

        <Section title={t("admin.partners.manageTitle")} subtitle={t("admin.partners.manageSubtitle")}>
          <Card className="space-y-4">
            <form action={createPartnerAction} className="grid gap-3 md:grid-cols-6">
              <Input name="name_ar" placeholder={t("admin.partners.nameAr")} required />
              <Input name="name_en" placeholder={t("admin.partners.nameEn")} required />
              <Input name="logo_url" placeholder={t("admin.partners.logo")} className="md:col-span-2" />
              <Input name="sort_order" placeholder={t("admin.homepage.order")} type="number" />
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" name="is_active" defaultChecked />
                {t("admin.partners.active")}
              </label>
              <Button type="submit" size="sm">
                {t("admin.homepage.add")}
              </Button>
            </form>
          </Card>

          <div className="grid gap-4">
            {partners.map((partner) => (
              <Card key={partner.id}>
                <form action={updatePartnerAction} className="grid gap-3 md:grid-cols-6">
                  <input type="hidden" name="id" value={partner.id} />
                  <Input name="name_ar" defaultValue={partner.name_ar} />
                  <Input name="name_en" defaultValue={partner.name_en} />
                  <Input name="logo_url" defaultValue={partner.logo_url ?? ""} className="md:col-span-2" />
                  <Input name="sort_order" defaultValue={partner.sort_order} type="number" />
                  <label className="flex items-center gap-2 text-sm">
                    <input type="checkbox" name="is_active" defaultChecked={partner.is_active} />
                    {t("admin.partners.active")}
                  </label>
                  <div className="flex gap-3">
                    <Button type="submit" size="sm" variant="secondary">
                      {t("admin.homepage.save")}
                    </Button>
                    <Button type="submit" size="sm" variant="danger" formAction={deletePartnerAction}>
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
