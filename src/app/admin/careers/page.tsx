import { createSupabaseServerClient } from "@/lib/supabaseServer";
import { requireRole } from "@/lib/auth";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { Badge, Card } from "@/components/ui";
import { FieldSelect } from "@/components/FieldHelp";
import { createT } from "@/lib/i18n";
import { getServerLocale } from "@/lib/i18n.server";
import { updateApplicationStatusAction } from "./actions";

const STATUS_OPTIONS = [
  { value: "new", key: "careers.status.new" },
  { value: "reviewing", key: "careers.status.reviewing" },
  { value: "interview", key: "careers.status.interview" },
  { value: "offer", key: "careers.status.offer" },
  { value: "rejected", key: "careers.status.rejected" },
  { value: "hired", key: "careers.status.hired" },
];

export default async function AdminCareersPage() {
  await requireRole(["owner", "admin", "ops"], "/admin/careers");
  const supabase = await createSupabaseServerClient();
  const locale = await getServerLocale();
  const t = createT(locale);

  const { data: applicationsData } = await supabase
    .from("career_applications")
    .select("id, role_title, name, email, phone, message, cv_path, cv_filename, status, created_at")
    .order("created_at", { ascending: false });
  const applications = await Promise.all(
    (applicationsData ?? []).map(async (application) => {
      if (!application.cv_path) return { ...application, cv_url: null };
      const { data: signed } = await supabase.storage
        .from("career-uploads")
        .createSignedUrl(application.cv_path, 60 * 30);
      return { ...application, cv_url: signed?.signedUrl ?? null };
    })
  );

  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--text)]">
      <SiteHeader />
      <main className="mx-auto w-full max-w-6xl space-y-8 px-6 py-10">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-semibold">{t("careers.admin.title")}</h1>
            <p className="text-sm text-[var(--muted)]">{t("careers.admin.subtitle")}</p>
          </div>
          <Badge>{applications.length}</Badge>
        </div>

        <Card className="space-y-4">
          {applications.length === 0 ? (
            <p className="text-sm text-[var(--muted)]">{t("careers.admin.empty")}</p>
          ) : (
            applications.map((application) => (
              <form
                key={application.id}
                action={updateApplicationStatusAction}
                className="flex flex-col gap-3 border-b border-[var(--border)] pb-4 last:border-none"
              >
                <input type="hidden" name="id" value={application.id} />
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold">{application.name}</p>
                    <p className="text-xs text-[var(--muted)]">{application.role_title}</p>
                    <p className="text-xs text-[var(--muted)]">
                      {application.email ?? "-"} · {application.phone ?? "-"}
                    </p>
                  </div>
                  <FieldSelect
                    label={t("careers.admin.status")}
                    helpKey="careers.admin.status"
                    name="status"
                    defaultValue={application.status}
                    wrapperClassName="min-w-[180px]"
                  >
                    {STATUS_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {t(option.key)}
                      </option>
                    ))}
                  </FieldSelect>
                </div>
                {application.message ? (
                  <p className="text-sm text-[var(--muted)]">{application.message}</p>
                ) : null}
                {application.cv_filename ? (
                  <a
                    href={application.cv_url ?? "#"}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs text-[var(--muted)] underline"
                  >
                    {t("careers.admin.cv")}: {application.cv_filename}
                  </a>
                ) : null}
              </form>
            ))
          )}
        </Card>
      </main>
      <SiteFooter />
    </div>
  );
}
