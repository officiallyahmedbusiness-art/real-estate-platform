import { requireRole } from "@/lib/auth";
import { createSupabaseServerClient } from "@/lib/supabaseServer";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { Badge, Card, Section } from "@/components/ui";
import { createT } from "@/lib/i18n";
import { getServerLocale } from "@/lib/i18n.server";

export default async function AdminReportsPage() {
  await requireRole(["owner", "admin"], "/admin/reports");
  const supabase = await createSupabaseServerClient();

  const locale = await getServerLocale();
  const t = createT(locale);

  const { data: unitsPerDayData } = await supabase
    .from("report_units_per_day")
    .select("day, units")
    .order("day", { ascending: false })
    .limit(30);
  const unitsPerDay = unitsPerDayData ?? [];

  const { data: leadsPerDayData } = await supabase
    .from("report_leads_per_day")
    .select("day, leads")
    .order("day", { ascending: false })
    .limit(30);
  const leadsPerDay = leadsPerDayData ?? [];

  const { data: leadsPerListingData } = await supabase
    .from("report_leads_per_listing")
    .select("listing_id, title, leads")
    .order("leads", { ascending: false })
    .limit(20);
  const leadsPerListing = leadsPerListingData ?? [];

  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--text)]">
      <SiteHeader />
      <main className="mx-auto w-full max-w-6xl space-y-10 px-6 py-10">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold">{t("reports.title")}</h1>
            <p className="text-sm text-[var(--muted)]">{t("reports.subtitle")}</p>
          </div>
          <Badge>{t("role.admin")}</Badge>
        </div>

        <Section title={t("reports.units.title")}>
          <Card>
            <div className="grid grid-cols-3 gap-4 text-sm text-[var(--muted)]">
              <span>{t("reports.column.day")}</span>
              <span>{t("reports.column.units")}</span>
              <span>{t("reports.column.period")}</span>
            </div>
            <div className="mt-3 space-y-2 text-sm">
              {unitsPerDay.map((row, index) => (
                <div key={`${row.day}-${index}`} className="grid grid-cols-3 gap-4">
                  <span>{row.day}</span>
                  <span>{row.units}</span>
                  <span>{index < 7 ? "7" : "30"}</span>
                </div>
              ))}
            </div>
          </Card>
        </Section>

        <Section title={t("reports.leads.title")}>
          <Card>
            <div className="grid grid-cols-3 gap-4 text-sm text-[var(--muted)]">
              <span>{t("reports.column.day")}</span>
              <span>{t("reports.column.leads")}</span>
              <span>{t("reports.column.period")}</span>
            </div>
            <div className="mt-3 space-y-2 text-sm">
              {leadsPerDay.map((row, index) => (
                <div key={`${row.day}-${index}`} className="grid grid-cols-3 gap-4">
                  <span>{row.day}</span>
                  <span>{row.leads}</span>
                  <span>{index < 7 ? "7" : "30"}</span>
                </div>
              ))}
            </div>
          </Card>
        </Section>

        <Section title={t("reports.leadsPerListing.title")}>
          <Card>
            <div className="grid grid-cols-3 gap-4 text-sm text-[var(--muted)]">
              <span>{t("reports.column.listing")}</span>
              <span>{t("reports.column.count")}</span>
              <span>{t("reports.column.id")}</span>
            </div>
            <div className="mt-3 space-y-2 text-sm">
              {leadsPerListing.map((row, index) => (
                <div key={`${row.listing_id}-${index}`} className="grid grid-cols-3 gap-4">
                  <span>{row.title}</span>
                  <span>{row.leads}</span>
                  <span className="text-xs text-[var(--muted)]">{row.listing_id}</span>
                </div>
              ))}
            </div>
          </Card>
        </Section>
      </main>
      <SiteFooter />
    </div>
  );
}



