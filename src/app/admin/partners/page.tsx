import Link from "next/link";
import { requireRole } from "@/lib/auth";
import { createSupabaseServerClient } from "@/lib/supabaseServer";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { Button, Card, Section } from "@/components/ui";
import { FieldCheckbox, FieldInput } from "@/components/FieldHelp";
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
              <FieldInput
                name="name_ar"
                label={t("admin.partners.nameAr")}
                helpKey="admin.partners.name_ar"
                placeholder={t("admin.partners.nameAr")}
                required
              />
              <FieldInput
                name="name_en"
                label={t("admin.partners.nameEn")}
                helpKey="admin.partners.name_en"
                placeholder={t("admin.partners.nameEn")}
                required
              />
              <FieldInput
                name="logo_url"
                label={t("admin.partners.logo")}
                helpKey="admin.partners.logo_url"
                placeholder={t("admin.partners.logo")}
                wrapperClassName="md:col-span-2"
              />
              <FieldInput
                name="sort_order"
                label={t("admin.homepage.order")}
                helpKey="admin.partners.sort_order"
                placeholder={t("admin.homepage.order")}
                type="number"
              />
              <FieldCheckbox
                name="is_active"
                label={t("admin.partners.active")}
                helpKey="admin.partners.is_active"
                defaultChecked
              />
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
                  <FieldInput
                    name="name_ar"
                    label={t("admin.partners.nameAr")}
                    helpKey="admin.partners.name_ar"
                    defaultValue={partner.name_ar}
                  />
                  <FieldInput
                    name="name_en"
                    label={t("admin.partners.nameEn")}
                    helpKey="admin.partners.name_en"
                    defaultValue={partner.name_en}
                  />
                  <FieldInput
                    name="logo_url"
                    label={t("admin.partners.logo")}
                    helpKey="admin.partners.logo_url"
                    defaultValue={partner.logo_url ?? ""}
                    wrapperClassName="md:col-span-2"
                  />
                  <FieldInput
                    name="sort_order"
                    label={t("admin.homepage.order")}
                    helpKey="admin.partners.sort_order"
                    defaultValue={partner.sort_order}
                    type="number"
                  />
                  <FieldCheckbox
                    name="is_active"
                    label={t("admin.partners.active")}
                    helpKey="admin.partners.is_active"
                    defaultChecked={partner.is_active}
                  />
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
