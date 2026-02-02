import Link from "next/link";
import { notFound } from "next/navigation";
import { requireRole } from "@/lib/auth";
import { createSupabaseServerClient } from "@/lib/supabaseServer";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { Button, Card, Input, Section, Badge, Textarea } from "@/components/ui";
import { isUuid } from "@/lib/validators";
import { submitProjectAction, updateProjectAction } from "../../actions";
import { createT, getSubmissionStatusLabelKey } from "@/lib/i18n";
import { getServerLocale } from "@/lib/i18n.server";
import { pickLocalizedText } from "@/lib/localize";

export default async function DeveloperProjectEditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  if (!isUuid(id)) notFound();

  const { role } = await requireRole(["owner", "developer", "admin"], `/developer/projects/${id}`);
  const supabase = await createSupabaseServerClient();
  const isAdmin = role === "admin";

  const locale = await getServerLocale();
  const t = createT(locale);

  const { data: project } = await supabase
    .from("projects")
    .select(
      "id, title_ar, title_en, description_ar, description_en, city, area, address, submission_status, project_code"
    )
    .eq("id", id)
    .maybeSingle();

  if (!project) notFound();

  const canEdit = isAdmin || ["draft", "needs_changes"].includes(project.submission_status ?? "");
  const displayTitle = pickLocalizedText(locale, project.title_ar, project.title_en, project.title_ar);
  const submissionLabel = t(getSubmissionStatusLabelKey(project.submission_status ?? "draft"));

  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--text)]">
      <SiteHeader />
      <main className="mx-auto w-full max-w-5xl space-y-10 px-6 py-10">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold">{t("project.manage")}</h1>
            <p className="text-sm text-[var(--muted)]">{displayTitle}</p>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/developer">
              <Button size="sm" variant="ghost">
                {t("developer.edit.back")}
              </Button>
            </Link>
            <Badge>{submissionLabel}</Badge>
          </div>
        </div>

        <Section title={t("project.create.title")} subtitle={t("submission.portal.subtitle")}>
          {!canEdit ? (
            <Card>
              <p className="text-sm text-[var(--muted)]">{t("submission.locked")}</p>
            </Card>
          ) : null}
          <Card>
            <form action={updateProjectAction} className="grid gap-4 md:grid-cols-3">
              <input type="hidden" name="project_id" value={project.id} />
              <Input
                name="title_ar"
                defaultValue={project.title_ar ?? ""}
                placeholder={t("submission.field.title_ar")}
                required
                disabled={!canEdit}
              />
              <Input
                name="title_en"
                defaultValue={project.title_en ?? ""}
                placeholder={t("submission.field.title_en")}
                disabled={!canEdit}
              />
              <Input
                name="city"
                defaultValue={project.city ?? ""}
                placeholder={t("project.form.city")}
                required
                disabled={!canEdit}
              />
              <Input
                name="area"
                defaultValue={project.area ?? ""}
                placeholder={t("project.form.area")}
                disabled={!canEdit}
              />
              <Input
                name="address"
                defaultValue={project.address ?? ""}
                placeholder={t("project.form.address")}
                disabled={!canEdit}
              />
              <Input
                name="project_code"
                defaultValue={project.project_code ?? ""}
                placeholder={t("submission.field.project_code")}
                disabled={!isAdmin}
              />
              <div className="md:col-span-3 grid gap-3 md:grid-cols-2">
                <Textarea
                  name="description_ar"
                  defaultValue={project.description_ar ?? ""}
                  placeholder={t("submission.field.desc_ar")}
                  disabled={!canEdit}
                />
                <Textarea
                  name="description_en"
                  defaultValue={project.description_en ?? ""}
                  placeholder={t("submission.field.desc_en")}
                  disabled={!canEdit}
                />
              </div>
              <div className="md:col-span-3 flex justify-end gap-3">
                <Button type="submit" disabled={!canEdit}>
                  {t("project.create.submit")}
                </Button>
                {["draft", "needs_changes"].includes(project.submission_status ?? "") ? (
                  <Button type="submit" formAction={submitProjectAction}>
                    {t("submission.action.submit")}
                  </Button>
                ) : null}
              </div>
            </form>
          </Card>
        </Section>
      </main>
      <SiteFooter />
    </div>
  );
}
