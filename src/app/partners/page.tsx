import { createSupabaseServerClient } from "@/lib/supabaseServer";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { Card, Section } from "@/components/ui";
import { createT } from "@/lib/i18n";
import { getServerLocale } from "@/lib/i18n.server";

export default async function PartnersPage() {
  const locale = await getServerLocale();
  const t = createT(locale);
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase
    .from("marketing_partners")
    .select("id, name_ar, name_en, logo_url, sort_order")
    .eq("is_active", true)
    .order("sort_order", { ascending: true });
  const partners = data ?? [];

  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--text)]">
      <SiteHeader />
      <main className="mx-auto w-full max-w-7xl space-y-6 px-4 py-6 pb-[calc(6rem+env(safe-area-inset-bottom))] sm:space-y-10 sm:px-6 sm:py-10 lg:px-8">
        <Section title={t("partners.title")} subtitle={t("partners.subtitle")}>
          {partners.length === 0 ? (
            <Card className="p-4 text-sm text-[var(--muted)]">{t("partners.empty")}</Card>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
              {partners.map((partner) => (
                <Card key={partner.id} className="space-y-3 p-4 hrtaj-card">
                  <div className="aspect-[3/2] overflow-hidden rounded-xl bg-[var(--surface)]">
                    {partner.logo_url ? (
                      <img
                        src={partner.logo_url}
                        alt={locale === "ar" ? partner.name_ar ?? "" : partner.name_en ?? ""}
                        className="h-full w-full object-contain p-4"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-xs text-[var(--muted)]">
                        {t("general.noImage")}
                      </div>
                    )}
                  </div>
                  <p className="text-sm font-semibold">
                    {locale === "ar" ? partner.name_ar : partner.name_en}
                  </p>
                </Card>
              ))}
            </div>
          )}
        </Section>
      </main>
      <SiteFooter showFloating showCompare />
    </div>
  );
}
