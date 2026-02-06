import Link from "next/link";
import { requireOwnerAccess } from "@/lib/owner";
import { createSupabaseServerClient } from "@/lib/supabaseServer";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { Badge, Button, Section } from "@/components/ui";
import { InviteUserForm } from "@/components/InviteUserForm";
import { UserManagementList } from "@/components/UserManagementList";
import { createT } from "@/lib/i18n";
import { getServerLocale } from "@/lib/i18n.server";

export default async function OwnerTeamUsersPage() {
  await requireOwnerAccess("/owner/team/users");
  const supabase = await createSupabaseServerClient();
  const locale = await getServerLocale();
  const t = createT(locale);

  const { data: profilesData } = await supabase
    .from("profiles")
    .select("id, full_name, phone, email, role, created_at, is_active")
    .order("created_at", { ascending: false })
    .limit(200);
  const profiles = profilesData ?? [];

  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--text)]">
      <SiteHeader />
      <main className="mx-auto w-full max-w-6xl space-y-8 px-6 py-10">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-semibold">{t("owner.hub.team.title")}</h1>
            <p className="text-sm text-[var(--muted)]">{t("owner.hub.team.subtitle")}</p>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/owner">
              <Button size="sm" variant="secondary">
                {t("owner.dashboard.title")}
              </Button>
            </Link>
            <Badge>{t("role.owner")}</Badge>
          </div>
        </div>

        <Section title={t("team.users.invite.title")} subtitle={t("team.users.invite.subtitle")}>
          <InviteUserForm />
        </Section>

        <Section title={t("team.users.list.title")} subtitle={t("team.users.list.subtitle")}>
          <UserManagementList profiles={profiles} actorRole="owner" />
        </Section>
      </main>
      <SiteFooter />
    </div>
  );
}
