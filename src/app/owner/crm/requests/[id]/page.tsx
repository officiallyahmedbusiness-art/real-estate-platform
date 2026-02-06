import Link from "next/link";
import { notFound } from "next/navigation";
import { requireOwnerAccess } from "@/lib/owner";
import { createSupabaseServerClient } from "@/lib/supabaseServer";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { Badge, Button, Card, Section } from "@/components/ui";
import { FieldSelect, FieldTextarea } from "@/components/FieldHelp";
import { OwnerDeleteDialog } from "@/components/OwnerDeleteDialog";
import { LEAD_STATUS_OPTIONS } from "@/lib/constants";
import { createT, getLeadStatusLabelKey } from "@/lib/i18n";
import { getServerLocale } from "@/lib/i18n.server";
import { updateLeadStatusAction, assignLeadAction, addLeadNoteAction } from "@/app/admin/actions";

export default async function OwnerCrmRequestDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireOwnerAccess("/owner/crm/requests");
  const supabase = await createSupabaseServerClient();
  const locale = await getServerLocale();
  const t = createT(locale);
  const { id } = await params;

  const { data: lead } = await supabase
    .from("leads")
    .select(
      "id, name, phone, phone_e164, email, message, status, assigned_to, created_at, updated_at, next_action_at, next_action_note, lead_source, lost_reason, lost_reason_note, listing_id, listings(title, city, area), customer: customers(id, full_name, phone_e164, intent, preferred_areas, budget_min, budget_max)"
    )
    .eq("id", id)
    .maybeSingle();

  if (!lead) notFound();

  const listing = Array.isArray(lead.listings) ? lead.listings[0] : lead.listings;
  const customer = Array.isArray(lead.customer) ? lead.customer[0] : lead.customer;

  const { data: profilesData } = await supabase
    .from("profiles")
    .select("id, full_name, email, role")
    .in("role", ["owner", "admin", "ops", "staff", "agent"])
    .order("full_name", { ascending: true });
  const profiles = profilesData ?? [];

  const assignedProfile = profiles.find((profile) => profile.id === lead.assigned_to) ?? null;
  const assignedLabel = assignedProfile?.full_name || assignedProfile?.email || null;

  const { data: notesData } = await supabase
    .from("lead_notes")
    .select("id, note, created_at, author_user_id")
    .eq("lead_id", id)
    .order("created_at", { ascending: false })
    .limit(30);
  const notes = notesData ?? [];

  const authorIds = [...new Set(notes.map((note) => note.author_user_id).filter(Boolean) as string[])];
  const authorMap = new Map<string, string>();
  if (authorIds.length > 0) {
    const { data: authors } = await supabase
      .from("profiles")
      .select("id, full_name, email")
      .in("id", authorIds);
    (authors ?? []).forEach((author) => {
      authorMap.set(author.id, author.full_name ?? author.email ?? author.id);
    });
  }

  const { data: activityData } = await supabase
    .from("activity_log")
    .select("id, action, created_at")
    .eq("entity", "lead")
    .eq("entity_id", id)
    .order("created_at", { ascending: false })
    .limit(20);
  const activity = activityData ?? [];

  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--text)]">
      <SiteHeader />
      <main className="mx-auto w-full max-w-6xl space-y-8 px-6 py-10">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-semibold">{lead.name ?? t("crm.request.label")}</h1>
            <p className="text-sm text-[var(--muted)]">{t("crm.request.label")}</p>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/owner/crm/requests">
              <Button size="sm" variant="secondary">
                {t("crm.requests.title")}
              </Button>
            </Link>
            <Badge>{t(getLeadStatusLabelKey(lead.status ?? "new"))}</Badge>
          </div>
        </div>

        <Section title={t("crm.request.meta.title")} subtitle={t("crm.request.label")}>
          <Card className="space-y-3">
            <div className="grid gap-3 md:grid-cols-2">
              <div>
                <p className="text-xs text-[var(--muted)]">{t("detail.lead.phone")}</p>
                <p className="font-semibold">{lead.phone_e164 ?? lead.phone ?? "-"}</p>
              </div>
              <div>
                <p className="text-xs text-[var(--muted)]">{t("detail.lead.email")}</p>
                <p className="font-semibold">{lead.email ?? "-"}</p>
              </div>
              <div>
                <p className="text-xs text-[var(--muted)]">{t("crm.request.assignee")}</p>
                <p className="font-semibold">{assignedLabel ?? t("crm.request.assignee.empty")}</p>
              </div>
              <div>
                <p className="text-xs text-[var(--muted)]">{t("crm.request.timestamps.created")}</p>
                <p className="font-semibold">{new Date(lead.created_at).toLocaleString(locale)}</p>
              </div>
              <div>
                <p className="text-xs text-[var(--muted)]">{t("crm.request.timestamps.updated")}</p>
                <p className="font-semibold">
                  {lead.updated_at ? new Date(lead.updated_at).toLocaleString(locale) : "-"}
                </p>
              </div>
              <div>
                <p className="text-xs text-[var(--muted)]">{t("crm.request.timestamps.next")}</p>
                <p className="font-semibold">
                  {lead.next_action_at ? new Date(lead.next_action_at).toLocaleString(locale) : "-"}
                </p>
              </div>
            </div>
            {lead.message ? (
              <div>
                <p className="text-xs text-[var(--muted)]">{t("detail.lead.message")}</p>
                <p className="text-sm">{lead.message}</p>
              </div>
            ) : null}
            {listing?.title ? (
              <div>
                <p className="text-xs text-[var(--muted)]">{t("crm.request.label")}</p>
                <p className="text-sm">{listing.title}</p>
              </div>
            ) : null}
            {customer ? (
              <div>
                <p className="text-xs text-[var(--muted)]">{t("crm.customers.title")}</p>
                <p className="text-sm">{customer.full_name ?? customer.id}</p>
              </div>
            ) : null}
          </Card>
        </Section>

        <Section title={t("crm.request.quickActions")} subtitle={t("crm.request.label")}>
          <Card className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <form action={updateLeadStatusAction} className="space-y-3">
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
                <Button type="submit" size="sm" variant="secondary">
                  {t("crm.leads.update")}
                </Button>
              </form>
              <form action={assignLeadAction} className="space-y-3">
                <input type="hidden" name="lead_id" value={lead.id} />
                <FieldSelect
                  name="assigned_to"
                  label={t("crm.filter.assigned")}
                  helpKey="crm.lead.assigned_to"
                  defaultValue={lead.assigned_to ?? ""}
                >
                  <option value="">{t("crm.request.assignee.empty")}</option>
                  {profiles.map((profile) => (
                    <option key={profile.id} value={profile.id}>
                      {profile.full_name ?? profile.email ?? profile.id.slice(0, 8)}
                    </option>
                  ))}
                </FieldSelect>
                <Button type="submit" size="sm" variant="secondary">
                  {t("crm.leads.assign")}
                </Button>
              </form>
            </div>
            <div className="flex flex-wrap gap-2">
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
              <OwnerDeleteDialog
                entityId={lead.id}
                endpoint="/api/owner/leads/delete"
                title={t("crm.leads.delete.title")}
                description={t("crm.leads.delete.subtitle")}
              />
            </div>
          </Card>
        </Section>

        <Section title={t("crm.request.notes.title")} subtitle={t("crm.leads.addNote")}>
          <Card className="space-y-3">
            <form action={addLeadNoteAction} className="grid gap-3">
              <input type="hidden" name="lead_id" value={lead.id} />
              <FieldTextarea
                name="note"
                label={t("crm.leads.addNote")}
                helpKey="crm.lead.note"
                placeholder={t("crm.leads.addNote")}
              />
              <Button type="submit" size="sm">
                {t("crm.leads.add")}
              </Button>
            </form>
            <div className="grid gap-2">
              {notes.length === 0 ? (
                <p className="text-xs text-[var(--muted)]">{t("developer.leads.noNote")}</p>
              ) : (
                notes.map((note) => (
                  <div
                    key={note.id}
                    className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-3 text-sm"
                  >
                    <p className="font-semibold">{authorMap.get(note.author_user_id ?? "") ?? "-"}</p>
                    <p className="text-xs text-[var(--muted)]">
                      {new Date(note.created_at).toLocaleString(locale)}
                    </p>
                    <p className="text-sm">{note.note}</p>
                  </div>
                ))
              )}
            </div>
          </Card>
        </Section>

        <Section title={t("crm.request.history.title")} subtitle={t("crm.request.label")}>
          <Card className="space-y-2">
            {activity.length === 0 ? (
              <p className="text-xs text-[var(--muted)]">{t("crm.leads.empty")}</p>
            ) : (
              activity.map((entry) => (
                <div key={entry.id} className="flex flex-wrap items-center justify-between gap-2 text-xs">
                  <span className="text-[var(--muted)]">{entry.action}</span>
                  <span className="text-[var(--muted)]">
                    {new Date(entry.created_at).toLocaleString(locale)}
                  </span>
                </div>
              ))
            )}
          </Card>
        </Section>
      </main>
      <SiteFooter />
    </div>
  );
}
