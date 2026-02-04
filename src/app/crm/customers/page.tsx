import Link from "next/link";
import { createSupabaseServerClient } from "@/lib/supabaseServer";
import { requireRole } from "@/lib/auth";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { Button, Card, Section, Badge } from "@/components/ui";
import { FieldInput } from "@/components/FieldHelp";
import { createT } from "@/lib/i18n";
import { getServerLocale } from "@/lib/i18n.server";
import { formatPrice } from "@/lib/format";

type SearchParams = Record<string, string | string[] | undefined>;

function getParam(searchParams: SearchParams, key: string) {
  const value = searchParams[key];
  return Array.isArray(value) ? value[0] : value ?? "";
}

export default async function CrmCustomersPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  await requireRole(["owner", "admin", "ops", "staff", "agent"], "/crm/customers");
  const supabase = await createSupabaseServerClient();
  const locale = await getServerLocale();
  const t = createT(locale);

  const params = await searchParams;
  const query = getParam(params, "q");

  let customersQuery = supabase
    .from("customers")
    .select("id, full_name, phone_e164, email, intent, preferred_areas, budget_min, budget_max, created_at")
    .order("created_at", { ascending: false })
    .limit(120);
  if (query) {
    customersQuery = customersQuery.or(
      `full_name.ilike.%${query}%,phone_e164.ilike.%${query}%,email.ilike.%${query}%`
    );
  }

  const { data: customersData } = await customersQuery;
  const customers = customersData ?? [];

  const { data: leadsData } = await supabase
    .from("leads")
    .select("customer_id")
    .in("customer_id", customers.map((c) => c.id));
  const leadCounts = new Map<string, number>();
  (leadsData ?? []).forEach((row) => {
    if (!row.customer_id) return;
    leadCounts.set(row.customer_id, (leadCounts.get(row.customer_id) ?? 0) + 1);
  });

  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--text)]">
      <SiteHeader />
      <main className="mx-auto w-full max-w-6xl space-y-8 px-6 py-10">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="space-y-2">
            <h1 className="text-2xl font-semibold">{t("crm.customers.title")}</h1>
            <p className="text-sm text-[var(--muted)]">{t("crm.customers.subtitle")}</p>
          </div>
          <Link href="/crm">
            <Button size="sm" variant="secondary">
              {t("crm.nav.leads")}
            </Button>
          </Link>
        </div>

        <Card className="space-y-4">
          <form className="flex flex-wrap gap-3">
            <FieldInput
              name="q"
              label={t("crm.customers.search")}
              helpKey="crm.customers.search"
              placeholder={t("crm.customers.search")}
              defaultValue={query}
            />
            <Button type="submit" size="sm">
              {t("listings.filters.apply")}
            </Button>
          </form>
        </Card>

        <Section title={t("crm.customers.title")} subtitle={t("crm.customers.subtitle")}>
          <Card className="overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-[var(--surface-2)] text-[var(--muted)]">
                  <tr>
                    <th className="px-4 py-3 text-right">{t("crm.customers.table.name")}</th>
                    <th className="px-4 py-3 text-right">{t("crm.customers.table.phone")}</th>
                    <th className="px-4 py-3 text-right">{t("crm.customers.table.intent")}</th>
                    <th className="px-4 py-3 text-right">{t("crm.customers.table.area")}</th>
                    <th className="px-4 py-3 text-right">{t("crm.customers.table.budget")}</th>
                    <th className="px-4 py-3 text-right">{t("crm.customers.table.leads")}</th>
                    <th className="px-4 py-3 text-right">{t("crm.customers.table.actions")}</th>
                  </tr>
                </thead>
                <tbody>
                  {customers.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-4 py-6 text-center text-[var(--muted)]">
                        {t("crm.customers.empty")}
                      </td>
                    </tr>
                  ) : (
                    customers.map((customer) => {
                      const budgetLabel =
                        customer.budget_min || customer.budget_max
                          ? `${customer.budget_min ? formatPrice(customer.budget_min, "EGP", locale) : ""}${
                              customer.budget_min && customer.budget_max ? " - " : ""
                            }${customer.budget_max ? formatPrice(customer.budget_max, "EGP", locale) : ""}`
                          : "-";
                      return (
                        <tr key={customer.id} className="border-b border-[var(--border)]">
                          <td className="px-4 py-3 font-semibold">{customer.full_name ?? "-"}</td>
                          <td className="px-4 py-3">{customer.phone_e164 ?? "-"}</td>
                          <td className="px-4 py-3">
                            {customer.intent ? <Badge>{customer.intent}</Badge> : "-"}
                          </td>
                          <td className="px-4 py-3">
                            {customer.preferred_areas?.[0] ?? "-"}
                          </td>
                          <td className="px-4 py-3">{budgetLabel}</td>
                          <td className="px-4 py-3">{leadCounts.get(customer.id) ?? 0}</td>
                          <td className="px-4 py-3">
                            <Link href={`/crm/customers/${customer.id}`}>
                              <Button size="sm" variant="secondary">
                                {t("crm.customers.view")}
                              </Button>
                            </Link>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </Section>
      </main>
      <SiteFooter />
    </div>
  );
}
