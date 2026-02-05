import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { Section } from "@/components/ui";
import { createT } from "@/lib/i18n";
import { getServerLocale } from "@/lib/i18n.server";
import { requireTeamRole } from "@/lib/teamAuth";
import { CleanupSettingsForm } from "./CleanupSettingsForm";

export default async function TeamCleanupPage() {
  await requireTeamRole(["owner"], "/team/tools/cleanup");
  const locale = await getServerLocale();
  const t = createT(locale);

  const labels = {
    body: t("team.cleanup.body"),
    button: t("team.cleanup.button"),
    running: t("team.cleanup.running"),
    before: t("team.cleanup.before"),
    after: t("team.cleanup.after"),
    present: t("team.cleanup.present"),
    empty: t("team.cleanup.empty"),
    success: t("team.cleanup.success"),
    errorUnauthorized: t("team.cleanup.error.unauthorized"),
    errorForbidden: t("team.cleanup.error.forbidden"),
    errorGeneric: t("team.cleanup.error.generic"),
  };

  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--text)]">
      <SiteHeader />
      <main className="mx-auto w-full max-w-5xl space-y-6 px-6 py-10">
        <Section title={t("team.cleanup.title")} subtitle={t("team.cleanup.subtitle")}>
          <CleanupSettingsForm labels={labels} />
        </Section>
      </main>
      <SiteFooter />
    </div>
  );
}
