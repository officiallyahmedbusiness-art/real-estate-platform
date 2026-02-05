import { createSupabaseServerClient } from "@/lib/supabaseServer";
import Link from "next/link";
import { requireRole } from "@/lib/auth";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { Badge, Button, Card, Section } from "@/components/ui";
import { FieldInput, FieldSelect } from "@/components/FieldHelp";
import { OwnerDeleteDialog } from "@/components/OwnerDeleteDialog";
import { createT, getLeadStatusLabelKey } from "@/lib/i18n";
import { getServerLocale } from "@/lib/i18n.server";
import { LEAD_SOURCE_OPTIONS, LEAD_STATUS_OPTIONS } from "@/lib/constants";
import { formatPrice } from "@/lib/format";
import {
  addLeadNoteAction,
  assignLeadAction,
  updateLeadNextAction,
  updateLeadSpendAction,
  updateLeadStatusAction,
} from "./actions";

type SearchParams = Record<string, string | string[] | undefined>;
type LeadRow = {
  id: string;
  name: string | null;
  phone: string | null;
  phone_e164: string | null;
  phone_normalized?: string | null;
  email: string | null;
  message: string | null;
  status: string | null;
  lead_source: string | null;
  assigned_to: string | null;
  created_at: string;
  listing_id: string | null;
  intent: string | null;
  preferred_area: string | null;
  budget_min: number | null;
  budget_max: number | null;
  lost_reason: string | null;
  lost_reason_note: string | null;
  next_action_at: string | null;
  listing_title?: string | null;
  listing_city?: string | null;
  listing_area?: string | null;
  listings?: { title?: string | null; city?: string | null; area?: string | null } | { title?: string | null; city?: string | null; area?: string | null }[] | null;
  customer?: {
    id: string;
    full_name: string | null;
    phone_e164: string | null;
    intent: string | null;
    preferred_areas: string[] | null;
    budget_min: number | null;
    budget_max: number | null;
  } | {
    id: string;
    full_name: string | null;
    phone_e164: string | null;
    intent: string | null;
    preferred_areas: string[] | null;
    budget_min: number | null;
    budget_max: number | null;
  }[] | null;
};

function getParam(searchParams: SearchParams, key: string) {
  const value = searchParams[key];
  return Array.isArray(value) ? value[0] : value ?? "";
}

const LOSS_REASONS = [
  { value: "budget", labelKey: "lead.loss_reason.budget" },
  { value: "location", labelKey: "lead.loss_reason.location" },
  { value: "payment", labelKey: "lead.loss_reason.payment" },
  { value: "timing", labelKey: "lead.loss_reason.timing" },
  { value: "other", labelKey: "lead.loss_reason.other" },
];

export default async function CrmPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const { role } = await requireRole(["owner", "admin", "ops", "staff", "agent"], "/crm");
  const supabase = await createSupabaseServerClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const supabaseAny = supabase as any;
  const locale = await getServerLocale();
  const t = createT(locale);

  const params = await searchParams;
  const statusFilter = getParam(params, "status");
  const sourceFilter = getParam(params, "source");
  const assignedFilter = getParam(params, "assigned");
  const lostReasonFilter = getParam(params, "lost_reason");
  const overdueFilter = getParam(params, "overdue");
  const query = getParam(params, "q");
  const isOwner = role === "owner";
  const isAdmin = role === "admin";
  const canManageLeads = isOwner || isAdmin;
  const canViewFullLeads = isOwner || isAdmin;
  const leadsTable = canViewFullLeads ? "leads" : "leads_masked";
  const leadSelect = canViewFullLeads
    ? "id, name, phone, phone_e164, phone_normalized, email, message, status, lead_source, assigned_to, created_at, listing_id, intent, preferred_area, budget_min, budget_max, lost_reason, lost_reason_note, next_action_at, listings(title, city, area), customer: customers(id, full_name, phone_e164, intent, preferred_areas, budget_min, budget_max)"
    : "id, name, phone, phone_e164, email, message, status, lead_source, assigned_to, created_at, listing_id, intent, preferred_area, budget_min, budget_max, lost_reason, lost_reason_note, next_action_at, listing_title, listing_city, listing_area";
  const canExport = isOwner;
  const exportParams = new URLSearchParams({
    status: statusFilter,
    source: sourceFilter,
    assigned: assignedFilter,
    lost_reason: lostReasonFilter,
    overdue: overdueFilter,
    q: query,
  });
  const exportUrl = `/api/crm-export?${exportParams.toString()}`;

  let leadsQuery = supabaseAny
    .from(leadsTable)
    .select(leadSelect);
  leadsQuery = leadsQuery.order("created_at", { ascending: false }).limit(120);

  if (statusFilter) leadsQuery = leadsQuery.eq("status", statusFilter);
  if (sourceFilter) leadsQuery = leadsQuery.eq("lead_source", sourceFilter);
  if (lostReasonFilter) leadsQuery = leadsQuery.eq("lost_reason", lostReasonFilter);
  if (assignedFilter === "unassigned") {
    leadsQuery = leadsQuery.is("assigned_to", null);
  } else if (assignedFilter) {
    leadsQuery = leadsQuery.eq("assigned_to", assignedFilter);
  }
  if (overdueFilter === "1") {
    leadsQuery = leadsQuery.lt("next_action_at", new Date().toISOString());
  }
  if (query) {
    if (canViewFullLeads) {
      leadsQuery = leadsQuery.or(
        `name.ilike.%${query}%,phone.ilike.%${query}%,phone_normalized.ilike.%${query}%,phone_e164.ilike.%${query}%`
      );
    } else {
      leadsQuery = leadsQuery.or(`name.ilike.%${query}%,listing_id.eq.${query}`);
    }
  }

  const { data: leadsData } = await leadsQuery;
  const leads = (leadsData ?? []) as LeadRow[];

  const { data: profilesData } = await supabase
    .from("profiles")
    .select("id, full_name, role")
    .in("role", ["admin", "ops", "agent"])
    .order("full_name", { ascending: true });
  const profiles = profilesData ?? [];
  const profileNameById = new Map(profiles.map((p) => [p.id, p.full_name ?? p.id]));

  const statusCounts = new Map<string, number>();
  leads.forEach((lead) => {
    const key = lead.status ?? "new";
    statusCounts.set(key, (statusCounts.get(key) ?? 0) + 1);
  });

  const duplicates = new Map<string, number>();
  if (canViewFullLeads) {
    leads.forEach((lead) => {
      if (!lead.phone_normalized) return;
      duplicates.set(lead.phone_normalized, (duplicates.get(lead.phone_normalized) ?? 0) + 1);
    });
  }
  const duplicateCount = canViewFullLeads
    ? [...duplicates.values()].filter((count) => count > 1).length
    : 0;

  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const monthKey = monthStart.toISOString().slice(0, 10);

  const { data: leadSourcesData } = await supabase
    .from("lead_sources")
    .select("slug, name, is_active")
    .eq("is_active", true);
  const fallbackSources = LEAD_SOURCE_OPTIONS.map((source) => ({
    value: source.value,
    label: t(source.labelKey),
  }));
  const leadSources =
    leadSourcesData && leadSourcesData.length > 0
      ? leadSourcesData.map((source) => ({
          value: source.slug,
          label: source.name,
        }))
      : fallbackSources;

  const { data: spendData } = await supabase
    .from("lead_spend")
    .select("channel, spend_month, amount")
    .eq("spend_month", monthKey);
  const spendByChannel = new Map((spendData ?? []).map((row) => [row.channel, row.amount]));

  const leadsBySource = new Map<string, number>();
  leads.forEach((lead) => {
    const source = lead.lead_source || "web";
    leadsBySource.set(source, (leadsBySource.get(source) ?? 0) + 1);
  });

  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--text)]">
      <SiteHeader />
      <main className="mx-auto w-full max-w-6xl space-y-10 px-6 py-10">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="space-y-2">
            <h1 className="text-2xl font-semibold">{t("crm.title")}</h1>
            <p className="text-sm text-[var(--muted)]">{t("crm.subtitle")}</p>
          </div>
          <div className="flex items-center gap-2">
            {canExport ? (
              <a href={exportUrl}>
                <Button size="sm" variant="secondary">
                  {t("crm.leads.export")}
                </Button>
              </a>
            ) : null}
            <Link href="/crm/visits">
              <Button size="sm" variant="secondary">
                {t("crm.visits.link")}
              </Button>
            </Link>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 text-sm text-[var(--muted)]">
          <Link href="/crm" className="rounded-full border border-[var(--border)] px-3 py-1 hover:text-[var(--text)]">
            {t("crm.nav.leads")}
          </Link>
          <Link href="/crm/customers" className="rounded-full border border-[var(--border)] px-3 py-1 hover:text-[var(--text)]">
            {t("crm.nav.customers")}
          </Link>
          <Link href="/crm/activities" className="rounded-full border border-[var(--border)] px-3 py-1 hover:text-[var(--text)]">
            {t("crm.nav.activities")}
          </Link>
          <Link href="/crm/sources" className="rounded-full border border-[var(--border)] px-3 py-1 hover:text-[var(--text)]">
            {t("crm.nav.sources")}
          </Link>
        </div>

        <div className="grid gap-4 md:grid-cols-4">
          <Card className="space-y-1">
            <p className="text-xs text-[var(--muted)]">{t("crm.stats.total")}</p>
            <p className="text-2xl font-semibold">{leads.length}</p>
          </Card>
          <Card className="space-y-1">
            <p className="text-xs text-[var(--muted)]">{t("crm.stats.duplicates")}</p>
            <p className="text-2xl font-semibold">{duplicateCount}</p>
          </Card>
          <Card className="space-y-1">
            <p className="text-xs text-[var(--muted)]">{t("crm.stats.assigned")}</p>
            <p className="text-2xl font-semibold">
              {leads.filter((lead) => Boolean(lead.assigned_to)).length}
            </p>
          </Card>
          <Card className="space-y-1">
            <p className="text-xs text-[var(--muted)]">{t("crm.stats.unassigned")}</p>
            <p className="text-2xl font-semibold">
              {leads.filter((lead) => !lead.assigned_to).length}
            </p>
          </Card>
        </div>

        <Section title={t("crm.pipeline.title")} subtitle={t("crm.pipeline.subtitle")}>
          <div className="flex flex-wrap gap-2">
            {LEAD_STATUS_OPTIONS.map((option) => (
              <Badge key={option.value}>
                {t(option.labelKey)} · {statusCounts.get(option.value) ?? 0}
              </Badge>
            ))}
          </div>
        </Section>

        <Section title={t("crm.spend.title")} subtitle={t("crm.spend.subtitle")}>
          <div className="grid gap-4 md:grid-cols-[2fr,1fr]">
            <Card className="space-y-3">
              {leadSources.map((source) => {
                const leadsCount = leadsBySource.get(source.value) ?? 0;
                const spend = spendByChannel.get(source.value) ?? 0;
                const cpl = leadsCount > 0 ? (spend / leadsCount).toFixed(0) : "-";
                return (
                  <div key={source.value} className="flex items-center justify-between text-sm">
                    <span className="text-[var(--muted)]">{source.label}</span>
                    <span>
                      {leadsCount} · {spend} EGP · {cpl}
                    </span>
                  </div>
                );
              })}
            </Card>
            <Card className="space-y-3">
              <form action={updateLeadSpendAction} className="space-y-3">
                <FieldInput
                  name="spend_month"
                  label={t("crm.spend.month")}
                  helpKey="crm.spend.month"
                  type="date"
                  defaultValue={monthKey}
                />
                <FieldSelect
                  name="channel"
                  label={t("crm.spend.channel")}
                  helpKey="crm.spend.channel"
                  defaultValue=""
                >
                  <option value="">{t("crm.spend.channel")}</option>
                  {leadSources.map((source) => (
                    <option key={source.value} value={source.value}>
                      {source.label}
                    </option>
                  ))}
                </FieldSelect>
                <FieldInput
                  name="amount"
                  label={t("crm.spend.amount")}
                  helpKey="crm.spend.amount"
                  type="number"
                  placeholder={t("crm.spend.amount")}
                />
                <Button type="submit" size="sm">
                  {t("crm.spend.save")}
                </Button>
              </form>
            </Card>
          </div>
        </Section>

        <Card className="space-y-4">
          <form className="flex flex-wrap gap-3">
            <FieldInput
              name="q"
              label={t("crm.search")}
              helpKey="crm.search"
              placeholder={t("crm.search")}
              defaultValue={query}
            />
            <FieldSelect
              name="status"
              label={t("crm.filter.status")}
              helpKey="crm.filter.status"
              defaultValue={statusFilter}
            >
              <option value="">{t("crm.filter.status")}</option>
              {LEAD_STATUS_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {t(option.labelKey)}
                </option>
              ))}
            </FieldSelect>
            <FieldSelect
              name="source"
              label={t("crm.filter.source")}
              helpKey="crm.filter.source"
              defaultValue={sourceFilter}
            >
              <option value="">{t("crm.filter.source")}</option>
              {leadSources.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </FieldSelect>
            <FieldSelect
              name="lost_reason"
              label={t("crm.filter.lostReason")}
              helpKey="crm.filter.lostReason"
              defaultValue={lostReasonFilter}
            >
              <option value="">{t("crm.filter.lostReason")}</option>
              {LOSS_REASONS.map((reason) => (
                <option key={reason.value} value={reason.value}>
                  {t(reason.labelKey)}
                </option>
              ))}
            </FieldSelect>
            <FieldSelect
              name="assigned"
              label={t("crm.filter.assigned")}
              helpKey="crm.filter.assigned"
              defaultValue={assignedFilter}
            >
              <option value="">{t("crm.filter.assigned")}</option>
              <option value="unassigned">{t("crm.filter.unassigned")}</option>
              {profiles.map((profile) => (
                <option key={profile.id} value={profile.id}>
                  {profile.full_name ?? profile.id}
                </option>
              ))}
            </FieldSelect>
            <FieldSelect
              name="overdue"
              label={t("crm.filter.overdue")}
              helpKey="crm.filter.overdue"
              defaultValue={overdueFilter}
            >
              <option value="">{t("crm.filter.overdue")}</option>
              <option value="1">{t("crm.filter.overdueOnly")}</option>
            </FieldSelect>
            <Button type="submit" size="sm">
              {t("listings.filters.apply")}
            </Button>
          </form>
        </Card>

        <Section title={t("crm.leads.title")} subtitle={t("crm.leads.subtitle")}>
          <div className="grid gap-4">
            {leads.length === 0 ? (
              <p className="text-sm text-[var(--muted)]">{t("crm.leads.empty")}</p>
            ) : (
              leads.map((lead) => {
                const listing = canViewFullLeads
                  ? Array.isArray(lead.listings)
                    ? lead.listings[0]
                    : lead.listings
                  : lead.listing_title || lead.listing_city || lead.listing_area
                    ? {
                        title: lead.listing_title,
                        city: lead.listing_city,
                        area: lead.listing_area,
                      }
                    : null;
                const customer = canViewFullLeads
                  ? Array.isArray(lead.customer)
                    ? lead.customer[0]
                    : lead.customer
                  : null;
                const assignedName = lead.assigned_to
                  ? profileNameById.get(lead.assigned_to) ?? lead.assigned_to
                  : t("crm.leads.unassigned");
                const intent = lead.intent ?? customer?.intent ?? null;
                const preferredArea =
                  lead.preferred_area ?? customer?.preferred_areas?.[0] ?? null;
                const budgetMin = lead.budget_min ?? customer?.budget_min ?? null;
                const budgetMax = lead.budget_max ?? customer?.budget_max ?? null;
                const budgetLabel =
                  budgetMin || budgetMax
                    ? `${budgetMin ? formatPrice(budgetMin, "EGP", locale) : ""}${
                        budgetMin && budgetMax ? " - " : ""
                      }${budgetMax ? formatPrice(budgetMax, "EGP", locale) : ""}`
                    : null;
                const contextLine = listing
                  ? [listing.city, listing.area].filter(Boolean).join(" - ")
                  : [intent, preferredArea, budgetLabel].filter(Boolean).join(" · ");
                const phoneValue = lead.phone_e164 ?? lead.phone ?? "";
                const whatsappDigits = phoneValue ? phoneValue.replace(/\D/g, "") : "";
                const whatsappLink = whatsappDigits ? `https://wa.me/${whatsappDigits}` : null;
                const callLink = phoneValue ? `tel:${phoneValue.replace(/[^\d+]/g, "")}` : null;
                return (
                  <Card key={lead.id} className="space-y-3">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <p className="text-sm text-[var(--muted)]">
                          {listing?.title ?? t("crm.leads.noListing")}
                        </p>
                        <p className="text-base font-semibold">{lead.name}</p>
                        {contextLine ? (
                          <p className="text-xs text-[var(--muted)]">{contextLine}</p>
                        ) : null}
                      </div>
                      <Badge>{t(getLeadStatusLabelKey(lead.status ?? "new"))}</Badge>
                    </div>
                    <div className="flex flex-wrap gap-4 text-xs text-[var(--muted)]">
                      <span>{lead.phone_e164 ?? lead.phone ?? "-"}</span>
                      <span>{lead.lead_source ?? "web"}</span>
                      <span>{t("crm.leads.assigned", { name: assignedName })}</span>
                      {lead.status === "lost" && lead.lost_reason ? (
                        <span>{t(`lead.loss_reason.${lead.lost_reason}`)}</span>
                      ) : null}
                    </div>
                    <details className="lead-drawer">
                      <summary>{t("crm.leads.details")}</summary>
                      <div className="lead-drawer-body">
                        <span>{t("detail.lead.phone")}: {lead.phone_e164 ?? lead.phone ?? "-"}</span>
                        <span>{t("detail.lead.email")}: {lead.email ?? "-"}</span>
                        {lead.message ? (
                          <span>{t("detail.lead.message")}: {lead.message}</span>
                        ) : null}
                        {!canViewFullLeads ? <span>{t("crm.leads.masked")}</span> : null}
                        {canViewFullLeads && (whatsappLink || callLink) ? (
                          <div className="flex flex-wrap items-center gap-2">
                            {whatsappLink ? (
                              <a href={whatsappLink} target="_blank" rel="noreferrer">
                                <Button size="sm">{t("detail.cta.whatsapp")}</Button>
                              </a>
                            ) : null}
                            {callLink ? (
                              <a href={callLink}>
                                <Button size="sm" variant="secondary">
                                  {t("detail.cta.call")}
                                </Button>
                              </a>
                            ) : null}
                          </div>
                        ) : null}
                      </div>
                    </details>
                    {canManageLeads ? (
                      <>
                        <div className="grid gap-3 md:grid-cols-2">
                          <form action={updateLeadStatusAction} className="flex flex-wrap items-end gap-3">
                            <input type="hidden" name="lead_id" value={lead.id} />
                            <FieldSelect
                              name="status"
                              label={t("crm.filter.status")}
                              helpKey="crm.lead.status"
                              defaultValue={lead.status ?? "new"}
                            >
                              {LEAD_STATUS_OPTIONS.map((option) => (
                                <option key={option.value} value={option.value}>
                                  {t(option.labelKey)}
                                </option>
                              ))}
                            </FieldSelect>
                            <FieldSelect
                              name="lost_reason"
                              label={t("crm.filter.lostReason")}
                              helpKey="crm.lead.lost_reason"
                              defaultValue={lead.lost_reason ?? ""}
                            >
                              <option value="">{t("crm.lossReason.select")}</option>
                              {LOSS_REASONS.map((reason) => (
                                <option key={reason.value} value={reason.value}>
                                  {t(reason.labelKey)}
                                </option>
                              ))}
                            </FieldSelect>
                            <FieldInput
                              name="lost_reason_note"
                              label={t("lead.loss_reason.other_note")}
                              helpKey="crm.lead.lost_reason_note"
                              placeholder={t("lead.loss_reason.other_note")}
                              defaultValue={lead.lost_reason_note ?? ""}
                            />
                            <Button type="submit" size="sm" variant="secondary">
                              {t("crm.leads.update")}
                            </Button>
                          </form>
                          <form action={assignLeadAction} className="flex flex-wrap items-end gap-3">
                            <input type="hidden" name="lead_id" value={lead.id} />
                            <FieldSelect
                              name="assigned_to"
                              label={t("crm.filter.assigned")}
                              helpKey="crm.lead.assigned_to"
                              defaultValue={lead.assigned_to ?? ""}
                            >
                              <option value="">{t("crm.leads.unassigned")}</option>
                              {profiles.map((profile) => (
                                <option key={profile.id} value={profile.id}>
                                  {profile.full_name ?? profile.id}
                                </option>
                              ))}
                            </FieldSelect>
                            <Button type="submit" size="sm" variant="secondary">
                              {t("crm.leads.assign")}
                            </Button>
                          </form>
                        </div>
                        <form action={updateLeadNextAction} className="flex flex-wrap items-end gap-3">
                          <input type="hidden" name="lead_id" value={lead.id} />
                          <FieldInput
                            name="next_action_at"
                            label={t("crm.leads.nextActionAt")}
                            helpKey="crm.lead.next_action_at"
                            type="datetime-local"
                          />
                          <FieldInput
                            name="next_action_note"
                            label={t("crm.leads.nextNote")}
                            helpKey="crm.lead.next_action_note"
                            placeholder={t("crm.leads.nextNote")}
                          />
                          <Button type="submit" size="sm" variant="secondary">
                            {t("crm.leads.schedule")}
                          </Button>
                        </form>
                        <form action={addLeadNoteAction} className="flex flex-wrap items-end gap-3">
                          <input type="hidden" name="lead_id" value={lead.id} />
                          <FieldInput
                            name="note"
                            label={t("crm.leads.addNote")}
                            helpKey="crm.lead.note"
                            placeholder={t("crm.leads.addNote")}
                            wrapperClassName="flex-1"
                          />
                          <Button type="submit" size="sm">
                            {t("crm.leads.add")}
                          </Button>
                        </form>
                        <div className="flex justify-end">
                          {isOwner ? (
                            <OwnerDeleteDialog
                              entityId={lead.id}
                              endpoint="/api/owner/leads/delete"
                              title={t("crm.leads.delete.title")}
                              description={t("crm.leads.delete.subtitle")}
                            />
                          ) : (
                            <OwnerDeleteDialog
                              entityId={lead.id}
                              endpoint="/api/pii-requests"
                              title={t("crm.leads.delete.requestTitle")}
                              description={t("crm.leads.delete.requestSubtitle")}
                              mode="request"
                              payload={{ table_name: "leads", action: "hard_delete_request" }}
                            />
                          )}
                        </div>
                      </>
                    ) : (
                      <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-3 text-xs text-[var(--muted)]">
                        {t("crm.adminOnly")}
                      </div>
                    )}
                  </Card>
                );
              })
            )}
          </div>
        </Section>
      </main>
      <SiteFooter />
    </div>
  );
}
