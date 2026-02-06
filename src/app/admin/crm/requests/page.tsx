import Link from "next/link";
import { requireRole } from "@/lib/auth";
import { createSupabaseServerClient } from "@/lib/supabaseServer";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { Badge, Button, Card, Section } from "@/components/ui";
import { FieldSelect } from "@/components/FieldHelp";
import { OwnerDeleteDialog } from "@/components/OwnerDeleteDialog";
import { createT, getLeadStatusLabelKey } from "@/lib/i18n";
import { getServerLocale } from "@/lib/i18n.server";
import { updateLeadStatusAction, assignLeadAction } from "@/app/admin/actions";

type LeadRow = {
  id: string;
  name: string | null;
  phone: string | null;
  email: string | null;
  status: string | null;
  assigned_to: string | null;
  created_at: string;
  updated_at?: string | null;
  listing_id: string | null;
  listings?: { title?: string | null; city?: string | null; area?: string | null } | { title?: string | null; city?: string | null; area?: string | null }[] | null;
};

type ProfileRow = {
  id: string;
  full_name: string | null;
  email: string | null;
  role: string | null;
};

export default async function AdminCrmRequestsPage() {
  const { role } = await requireRole(["owner", "admin"], "/admin/crm/requests");
  const supabase = await createSupabaseServerClient();
  const locale = await getServerLocale();
  const t = createT(locale);

  const { data: leadsData } = await supabase
    .from("leads")
    .select("id, name, phone, email, status, assigned_to, created_at, updated_at, listing_id, listings(title, city, area)")
    .order("created_at", { ascending: false })
    .limit(100);
  const leads = (leadsData ?? []) as LeadRow[];

  const leadIds = leads.map((lead) => lead.id);
  const leadNotesById = new Map<string, { note: string; created_at: string }>();
  if (leadIds.length > 0) {
    const { data: notesData } = await supabase
      .from("lead_notes")
      .select("lead_id, note, created_at")
      .in("lead_id", leadIds)
      .order("created_at", { ascending: false });
    (notesData ?? []).forEach((note) => {
      if (!leadNotesById.has(note.lead_id)) {
        leadNotesById.set(note.lead_id, note);
      }
    });
  }

  const { data: profilesData } = await supabase
    .from("profiles")
    .select("id, full_name, email, role")
    .in("role", ["owner", "admin", "ops", "staff", "agent"])
    .order("full_name", { ascending: true });
  const profiles = (profilesData ?? []) as ProfileRow[];

  const profileLabel = (profile: ProfileRow) =>
    profile.full_name || profile.email || profile.id.slice(0, 8);

  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--text)]">
      <SiteHeader />
      <main className="mx-auto w-full max-w-6xl space-y-8 px-6 py-10">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-semibold">{t("crm.requests.title")}</h1>
            <p className="text-sm text-[var(--muted)]">{t("crm.requests.subtitle")}</p>
          </div>
          <Link href="/admin">
            <Button size="sm" variant="secondary">
              {t("admin.homepage.back")}
            </Button>
          </Link>
        </div>

        <Section title={t("crm.requests.title")} subtitle={t("crm.requests.subtitle")}>
          {leads.length === 0 ? (
            <Card>
              <p className="text-sm text-[var(--muted)]">{t("crm.requests.empty")}</p>
            </Card>
          ) : (
            <div className="grid gap-4">
              {leads.map((lead) => {
                const listing = Array.isArray(lead.listings) ? lead.listings[0] : lead.listings;
                const listingTitle = listing?.title ?? t("crm.leads.noListing");
                const assignedProfile = profiles.find((p) => p.id === lead.assigned_to) ?? null;
                const assignedLabel = assignedProfile ? profileLabel(assignedProfile) : t("crm.request.assignee.empty");
                const lastNote = leadNotesById.get(lead.id);
                return (
                  <Card key={lead.id} className="space-y-4" data-lead-card>
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <p className="text-xs text-[var(--muted)]">{t("crm.request.label")}</p>
                        <p className="text-base font-semibold">{lead.name ?? "-"}</p>
                        <p className="text-xs text-[var(--muted)]">{listingTitle}</p>
                      </div>
                      <Badge>{t(getLeadStatusLabelKey(lead.status ?? "new"))}</Badge>
                    </div>

                    <div className="flex flex-wrap gap-3 text-xs text-[var(--muted)]">
                      <span>{lead.email ?? "-"}</span>
                      <span>{lead.phone ?? "-"}</span>
                      <span>{t("crm.request.assignee")}: {assignedLabel}</span>
                      <span>{new Date(lead.created_at).toLocaleString(locale)}</span>
                    </div>

                    {lastNote ? (
                      <p className="text-xs text-[var(--muted)]">{lastNote.note}</p>
                    ) : null}

                    <div className="flex flex-wrap items-center gap-3">
                      <Link href={`/admin/crm/requests/${lead.id}`}>
                        <Button size="sm">{t("crm.request.view")}</Button>
                      </Link>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-xs text-[var(--muted)]">{t("crm.request.quickActions")}</span>
                        <form action={updateLeadStatusAction}>
                          <input type="hidden" name="lead_id" value={lead.id} />
                          <input type="hidden" name="status" value="test" />
                          <Button size="sm" variant="secondary" type="submit">
                            {t("crm.request.markTest")}
                          </Button>
                        </form>
                        <form action={updateLeadStatusAction}>
                          <input type="hidden" name="lead_id" value={lead.id} />
                          <input type="hidden" name="status" value="archived" />
                          <Button size="sm" variant="secondary" type="submit">
                            {t("crm.request.archive")}
                          </Button>
                        </form>
                        <form action={updateLeadStatusAction}>
                          <input type="hidden" name="lead_id" value={lead.id} />
                          <input type="hidden" name="status" value="closed" />
                          <Button size="sm" variant="secondary" type="submit">
                            {t("crm.request.close")}
                          </Button>
                        </form>
                      </div>
                      {role === "owner" ? (
                        <OwnerDeleteDialog
                          entityId={lead.id}
                          endpoint="/api/owner/leads/delete"
                          title={t("crm.leads.delete.title")}
                          description={t("crm.leads.delete.subtitle")}
                        />
                      ) : null}
                    </div>

                    <form action={assignLeadAction} className="flex flex-wrap items-end gap-3">
                      <input type="hidden" name="lead_id" value={lead.id} />
                      <FieldSelect
                        label={t("crm.filter.assigned")}
                        helpKey="crm.lead.assigned_to"
                        name="assigned_to"
                        defaultValue={lead.assigned_to ?? ""}
                      >
                        <option value="">{t("crm.request.assignee.empty")}</option>
                        {profiles.map((profile) => (
                          <option key={profile.id} value={profile.id}>
                            {profileLabel(profile)}
                          </option>
                        ))}
                      </FieldSelect>
                      <Button size="sm" variant="secondary" type="submit">
                        {t("crm.leads.assign")}
                      </Button>
                    </form>
                  </Card>
                );
              })}
            </div>
          )}
        </Section>
      </main>
      <SiteFooter />
    </div>
  );
}
