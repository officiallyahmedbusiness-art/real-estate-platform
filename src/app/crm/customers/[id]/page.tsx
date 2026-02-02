import Link from "next/link";
import { notFound } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabaseServer";
import { requireRole } from "@/lib/auth";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { Badge, Button, Card, Section } from "@/components/ui";
import { createT } from "@/lib/i18n";
import { getServerLocale } from "@/lib/i18n.server";
import { formatPrice } from "@/lib/format";
import { isUuid } from "@/lib/validators";

export default async function CrmCustomerDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  if (!isUuid(id)) notFound();
  await requireRole(["owner", "admin", "ops", "staff", "agent"], `/crm/customers/${id}`);

  const supabase = await createSupabaseServerClient();
  const locale = await getServerLocale();
  const t = createT(locale);

  const { data: customer } = await supabase
    .from("customers")
    .select("id, full_name, phone_e164, email, intent, preferred_areas, budget_min, budget_max, created_at")
    .eq("id", id)
    .maybeSingle();
  if (!customer) notFound();

  const { data: leadsData } = await supabase
    .from("leads")
    .select("id, status, lead_source, created_at, listings(title)")
    .eq("customer_id", id)
    .order("created_at", { ascending: false });
  const leads = leadsData ?? [];

  const { data: activitiesData } = await supabase
    .from("lead_activities")
    .select("id, activity_type, occurred_at, outcome, notes")
    .eq("customer_id", id)
    .order("occurred_at", { ascending: false })
    .limit(20);
  const activities = activitiesData ?? [];

  const budgetLabel =
    customer.budget_min || customer.budget_max
      ? `${customer.budget_min ? formatPrice(customer.budget_min, "EGP", locale) : ""}${
          customer.budget_min && customer.budget_max ? " - " : ""
        }${customer.budget_max ? formatPrice(customer.budget_max, "EGP", locale) : ""}`
      : "-";

  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--text)]">
      <SiteHeader />
      <main className="mx-auto w-full max-w-6xl space-y-8 px-6 py-10">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="space-y-2">
            <h1 className="text-2xl font-semibold">{customer.full_name ?? "-"}</h1>
            <p className="text-sm text-[var(--muted)]">{customer.phone_e164 ?? "-"}</p>
          </div>
          <Link href="/crm/customers">
            <Button size="sm" variant="secondary">
              {t("staff.actions.back")}
            </Button>
          </Link>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <Card className="space-y-2">
            <p className="text-xs text-[var(--muted)]">{t("crm.customers.table.intent")}</p>
            <p className="text-sm font-semibold">{customer.intent ?? "-"}</p>
          </Card>
          <Card className="space-y-2">
            <p className="text-xs text-[var(--muted)]">{t("crm.customers.table.area")}</p>
            <p className="text-sm font-semibold">{customer.preferred_areas?.[0] ?? "-"}</p>
          </Card>
          <Card className="space-y-2">
            <p className="text-xs text-[var(--muted)]">{t("crm.customers.table.budget")}</p>
            <p className="text-sm font-semibold">{budgetLabel}</p>
          </Card>
        </div>

        <Section title={t("crm.leads.title")} subtitle={t("crm.leads.subtitle")}>
          <div className="grid gap-3">
            {leads.length === 0 ? (
              <p className="text-sm text-[var(--muted)]">{t("crm.leads.empty")}</p>
            ) : (
              leads.map((lead) => {
                const listing = Array.isArray(lead.listings) ? lead.listings[0] : lead.listings;
                return (
                  <Card key={lead.id} className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold">{listing?.title ?? t("crm.leads.noListing")}</p>
                      <p className="text-xs text-[var(--muted)]">{lead.lead_source ?? "web"}</p>
                    </div>
                    <Badge>{lead.status}</Badge>
                  </Card>
                );
              })
            )}
          </div>
        </Section>

        <Section title={t("crm.activities.title")} subtitle={t("crm.activities.subtitle")}>
          <div className="grid gap-3">
            {activities.length === 0 ? (
              <p className="text-sm text-[var(--muted)]">{t("crm.activities.empty")}</p>
            ) : (
              activities.map((activity) => (
                <Card key={activity.id} className="space-y-2 text-sm">
                  <div className="flex items-center justify-between">
                    <Badge>{t(`crm.activity.type.${activity.activity_type}` as const)}</Badge>
                    <span className="text-xs text-[var(--muted)]">
                      {new Date(activity.occurred_at).toLocaleString(locale)}
                    </span>
                  </div>
                  {activity.outcome ? <p>{activity.outcome}</p> : null}
                  {activity.notes ? <p className="text-xs text-[var(--muted)]">{activity.notes}</p> : null}
                </Card>
              ))
            )}
          </div>
        </Section>
      </main>
      <SiteFooter />
    </div>
  );
}
