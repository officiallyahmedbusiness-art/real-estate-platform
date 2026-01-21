import { requireRole } from "@/lib/auth";
import { createSupabaseServerClient } from "@/lib/supabaseServer";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { Badge, Card, Section } from "@/components/ui";

export default async function AdminReportsPage() {
  await requireRole("admin", "/admin/reports");
  const supabase = await createSupabaseServerClient();

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
    <div className="min-h-screen bg-zinc-950 text-white">
      <SiteHeader />
      <main dir="rtl" className="mx-auto w-full max-w-6xl px-6 py-10 space-y-10">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold">التقارير</h1>
            <p className="text-sm text-white/60">آخر 7 و30 يومًا.</p>
          </div>
          <Badge>admin</Badge>
        </div>

        <Section title="الوحدات المضافة يوميًا">
          <Card>
            <div className="grid grid-cols-3 gap-4 text-sm text-white/70">
              <span>اليوم</span>
              <span>الإجمالي</span>
              <span>الفترة</span>
            </div>
            <div className="mt-3 space-y-2 text-sm">
              {unitsPerDay.map((row, index) => (
                <div key={`${row.day}-${index}`} className="grid grid-cols-3 gap-4">
                  <span>{row.day}</span>
                  <span>{row.units}</span>
                  <span>{index < 7 ? "آخر 7 أيام" : "آخر 30 يومًا"}</span>
                </div>
              ))}
            </div>
          </Card>
        </Section>

        <Section title="الطلبات يوميًا">
          <Card>
            <div className="grid grid-cols-3 gap-4 text-sm text-white/70">
              <span>اليوم</span>
              <span>الإجمالي</span>
              <span>الفترة</span>
            </div>
            <div className="mt-3 space-y-2 text-sm">
              {leadsPerDay.map((row, index) => (
                <div key={`${row.day}-${index}`} className="grid grid-cols-3 gap-4">
                  <span>{row.day}</span>
                  <span>{row.leads}</span>
                  <span>{index < 7 ? "آخر 7 أيام" : "آخر 30 يومًا"}</span>
                </div>
              ))}
            </div>
          </Card>
        </Section>

        <Section title="التحويلات (طلبات لكل إعلان)">
          <Card>
            <div className="grid grid-cols-3 gap-4 text-sm text-white/70">
              <span>الإعلان</span>
              <span>عدد الطلبات</span>
              <span>ID</span>
            </div>
            <div className="mt-3 space-y-2 text-sm">
              {leadsPerListing.map((row, index) => (
                <div key={`${row.listing_id}-${index}`} className="grid grid-cols-3 gap-4">
                  <span>{row.title}</span>
                  <span>{row.leads}</span>
                  <span className="text-xs text-white/40">{row.listing_id}</span>
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
