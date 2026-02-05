import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { Button, Card, Section } from "@/components/ui";
import { FieldInput } from "@/components/FieldHelp";
import { createT } from "@/lib/i18n";
import { getServerLocale } from "@/lib/i18n.server";
import { requireOwnerAccess } from "@/lib/owner";
import { approvePiiChangeAction, rejectPiiChangeAction } from "./actions";

export default async function AdminApprovalsPage() {
  const { supabase } = await requireOwnerAccess("/admin/approvals");
  const locale = await getServerLocale();
  const t = createT(locale);

  const { data: requestsData } = await supabase
    .from("pii_change_requests")
    .select("id, table_name, row_id, action, payload, status, requested_by, requested_at")
    .eq("status", "pending")
    .order("requested_at", { ascending: false });
  const requests = requestsData ?? [];

  const requesterIds = Array.from(new Set(requests.map((req) => req.requested_by)));
  const { data: profilesData } = requesterIds.length
    ? await supabase
        .from("profiles")
        .select("id, full_name, email")
        .in("id", requesterIds)
    : { data: [] as Array<{ id: string; full_name: string | null; email: string | null }> };
  const profileById = new Map((profilesData ?? []).map((profile) => [profile.id, profile]));

  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--text)]">
      <SiteHeader />
      <main className="mx-auto w-full max-w-5xl space-y-8 px-6 py-10">
        <Section title={t("admin.pii.title")} subtitle={t("admin.pii.subtitle")}>
          {requests.length === 0 ? (
            <Card className="text-sm text-[var(--muted)]">{t("admin.pii.empty")}</Card>
          ) : (
            <div className="grid gap-4">
              {requests.map((req) => {
                const requester = profileById.get(req.requested_by);
                const payloadEntries = Object.entries((req.payload as Record<string, unknown>) ?? {});

                return (
                  <Card key={req.id} className="space-y-3">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="space-y-1">
                        <p className="text-sm font-semibold">
                          {t("admin.pii.request")} #{req.id.slice(0, 8)}
                        </p>
                        <p className="text-xs text-[var(--muted)]">
                          {t("admin.pii.requestedBy", {
                            name: requester?.full_name ?? requester?.email ?? req.requested_by,
                          })}
                        </p>
                        <p className="text-xs text-[var(--muted)]">
                          {t("admin.pii.requestedAt", {
                            time: new Date(req.requested_at).toLocaleString(locale),
                          })}
                        </p>
                      </div>
                      <div className="text-xs text-[var(--muted)]">
                        <div>{t("admin.pii.table", { table: req.table_name })}</div>
                        <div>{t("admin.pii.action", { action: req.action })}</div>
                      </div>
                    </div>

                    <div className="space-y-2 text-xs">
                      <div className="text-[var(--muted)]">{t("admin.pii.payload")}</div>
                      {payloadEntries.length === 0 ? (
                        <div className="text-[var(--muted)]">{t("admin.pii.payload.empty")}</div>
                      ) : (
                        <ul className="grid gap-1">
                          {payloadEntries.map(([key, value]) => (
                            <li key={key} className="flex flex-wrap justify-between gap-2">
                              <span className="text-[var(--muted)]">{key}</span>
                              <span>{value ? String(value) : "-"}</span>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>

                    <div className="flex flex-wrap items-end gap-3">
                      <form action={approvePiiChangeAction}>
                        <input type="hidden" name="request_id" value={req.id} />
                        <Button size="sm" type="submit">
                          {t("admin.pii.approve")}
                        </Button>
                      </form>
                      <form action={rejectPiiChangeAction} className="flex flex-wrap items-end gap-2">
                        <input type="hidden" name="request_id" value={req.id} />
                        <FieldInput
                          name="reason"
                          label={t("admin.pii.reject.reason")}
                          helpKey="admin.pii.reject.reason"
                          placeholder={t("admin.pii.reject.placeholder")}
                        />
                        <Button size="sm" variant="secondary" type="submit">
                          {t("admin.pii.reject")}
                        </Button>
                      </form>
                    </div>
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

