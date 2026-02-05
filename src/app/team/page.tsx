import Link from "next/link";
import { requireTeamRole } from "@/lib/teamAuth";
import { createSupabaseServerClient } from "@/lib/supabaseServer";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { Badge, Card, Section, Stat } from "@/components/ui";
import { createT } from "@/lib/i18n";
import { getServerLocale } from "@/lib/i18n.server";

type StatusKey = "submitted" | "under_review" | "approved" | "needs_changes";

async function countByStatus(
  supabase: Awaited<ReturnType<typeof createSupabaseServerClient>>,
  table: "listings" | "projects",
  status: StatusKey
) {
  const { count } = await supabase
    .from(table)
    .select("id", { count: "exact", head: true })
    .eq("submission_status", status);
  return count ?? 0;
}

export default async function TeamPortalPage() {
  const { role } = await requireTeamRole(
    ["owner", "admin", "ops", "staff", "agent", "developer"],
    "/team"
  );
  const supabase = await createSupabaseServerClient();
  const locale = await getServerLocale();
  const t = createT(locale);

  const isOwner = role === "owner";
  const isAdmin = role === "admin" || isOwner;
  const isCrmUser = ["owner", "admin", "ops", "staff", "agent"].includes(role);

  const [newListings, reviewListings, approvedListings, rejectedListings] = await Promise.all([
    countByStatus(supabase, "listings", "submitted"),
    countByStatus(supabase, "listings", "under_review"),
    countByStatus(supabase, "listings", "approved"),
    countByStatus(supabase, "listings", "needs_changes"),
  ]);

  const [newProjects, reviewProjects, approvedProjects, rejectedProjects] = await Promise.all([
    countByStatus(supabase, "projects", "submitted"),
    countByStatus(supabase, "projects", "under_review"),
    countByStatus(supabase, "projects", "approved"),
    countByStatus(supabase, "projects", "needs_changes"),
  ]);

  const stats = {
    new: newListings + newProjects,
    review: reviewListings + reviewProjects,
    approved: approvedListings + approvedProjects,
    rejected: rejectedListings + rejectedProjects,
  };

  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--text)]">
      <SiteHeader />
      <main className="mx-auto w-full max-w-6xl space-y-10 px-6 py-10">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="space-y-2">
            <h1 className="text-2xl font-semibold">{t("team.portal.title")}</h1>
            <p className="text-sm text-[var(--muted)]">{t("team.portal.subtitle")}</p>
          </div>
          <Badge>{t("team.notice.title")}</Badge>
        </div>

        <Section title={t("team.portal.stats.title")} subtitle={t("team.portal.stats.subtitle")}>
          <div className="grid gap-4 md:grid-cols-4">
            <Stat label={t("team.portal.stats.new")} value={stats.new} />
            <Stat label={t("team.portal.stats.review")} value={stats.review} />
            <Stat label={t("team.portal.stats.approved")} value={stats.approved} />
            <Stat label={t("team.portal.stats.rejected")} value={stats.rejected} />
          </div>
        </Section>

        <Section title={t("team.portal.shortcuts.title")} subtitle={t("team.portal.shortcuts.subtitle")}>
          <div className="grid gap-4 md:grid-cols-2">
            <Card className="space-y-3">
              <h3 className="text-lg font-semibold">{t("team.portal.card.units.title")}</h3>
              <p className="text-sm text-[var(--muted)]">{t("team.portal.card.units.subtitle")}</p>
              <Link href="/team/units" className="text-sm font-semibold text-[var(--accent)]">
                {t("team.portal.card.units.cta")}
              </Link>
            </Card>
            {isCrmUser ? (
              <Card className="space-y-3">
                <h3 className="text-lg font-semibold">{t("team.portal.card.crm.title")}</h3>
                <p className="text-sm text-[var(--muted)]">{t("team.portal.card.crm.subtitle")}</p>
                <Link href="/team/crm" className="text-sm font-semibold text-[var(--accent)]">
                  {t("team.portal.card.crm.cta")}
                </Link>
              </Card>
            ) : null}
            {isAdmin ? (
              <Card className="space-y-3">
                <h3 className="text-lg font-semibold">{t("team.portal.card.partners.title")}</h3>
                <p className="text-sm text-[var(--muted)]">{t("team.portal.card.partners.subtitle")}</p>
                <Link href="/team/partners" className="text-sm font-semibold text-[var(--accent)]">
                  {t("team.portal.card.partners.cta")}
                </Link>
              </Card>
            ) : null}
            {isAdmin ? (
              <Card className="space-y-3">
                <h3 className="text-lg font-semibold">{t("team.portal.card.users.title")}</h3>
                <p className="text-sm text-[var(--muted)]">{t("team.portal.card.users.subtitle")}</p>
                <Link href="/team/users" className="text-sm font-semibold text-[var(--accent)]">
                  {t("team.portal.card.users.cta")}
                </Link>
              </Card>
            ) : null}
            {isOwner ? (
              <Card className="space-y-3">
                <h3 className="text-lg font-semibold">{t("team.portal.card.cleanup.title")}</h3>
                <p className="text-sm text-[var(--muted)]">{t("team.portal.card.cleanup.subtitle")}</p>
                <Link href="/team/tools/cleanup" className="text-sm font-semibold text-[var(--accent)]">
                  {t("team.portal.card.cleanup.cta")}
                </Link>
              </Card>
            ) : null}
          </div>
        </Section>
      </main>
      <SiteFooter />
    </div>
  );
}
