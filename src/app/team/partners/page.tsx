import Link from "next/link";
import { requireTeamRole } from "@/lib/teamAuth";
import { createSupabaseServerClient } from "@/lib/supabaseServer";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { Badge, Button, Card, Section } from "@/components/ui";
import { FieldInput, FieldSelect } from "@/components/FieldHelp";
import { createT } from "@/lib/i18n";
import { getServerLocale } from "@/lib/i18n.server";
import { createDeveloperAction, addDeveloperMemberAction } from "@/app/admin/actions";

type DeveloperRow = {
  id: string;
  name: string;
};

type MemberRow = {
  developer_id: string;
  user_id: string;
  role: string | null;
};

type ProfileRow = {
  id: string;
  full_name: string | null;
  email: string | null;
  phone: string | null;
};

export default async function TeamPartnersPage() {
  const { role } = await requireTeamRole(["owner", "admin", "ops", "staff"], "/team/partners");
  const supabase = await createSupabaseServerClient();
  const locale = await getServerLocale();
  const t = createT(locale);

  const isAdmin = role === "owner" || role === "admin";

  const { data: developersData } = await supabase
    .from("developers")
    .select("id, name")
    .order("name", { ascending: true });
  const developers = (developersData ?? []) as DeveloperRow[];

  const { data: membersData } = await supabase
    .from("developer_members")
    .select("developer_id, user_id, role")
    .order("created_at", { ascending: false });
  const members = (membersData ?? []) as MemberRow[];

  const memberUserIds = [...new Set(members.map((member) => member.user_id))];
  const profilesById = new Map<string, ProfileRow>();
  if (memberUserIds.length > 0) {
    const { data: profilesData } = await supabase
      .from("profiles")
      .select("id, full_name, email, phone")
      .in("id", memberUserIds);
    (profilesData ?? []).forEach((profile) => {
      profilesById.set(profile.id, profile);
    });
  }

  const membersByDeveloper = new Map<string, MemberRow[]>();
  members.forEach((member) => {
    const list = membersByDeveloper.get(member.developer_id) ?? [];
    list.push(member);
    membersByDeveloper.set(member.developer_id, list);
  });

  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--text)]">
      <SiteHeader />
      <main className="mx-auto w-full max-w-6xl space-y-8 px-6 py-10">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-semibold">{t("team.partners.title")}</h1>
            <p className="text-sm text-[var(--muted)]">{t("team.partners.subtitle")}</p>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/team">
              <Button size="sm" variant="secondary">
                {t("team.portal.back")}
              </Button>
            </Link>
            <Badge>{t(isAdmin ? "role.admin" : "role.staff")}</Badge>
          </div>
        </div>

        {isAdmin ? (
          <Section title={t("team.partners.create.title")} subtitle={t("team.partners.create.subtitle")}>
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <h3 className="text-lg font-semibold">{t("team.partners.create.org")}</h3>
                <form action={createDeveloperAction} className="mt-3 space-y-3">
                  <FieldInput
                    label={t("team.partners.create.name")}
                    helpKey="admin.partners.name"
                    name="name"
                    placeholder={t("team.partners.create.name")}
                    required
                  />
                  <Button type="submit">{t("team.partners.create.submit")}</Button>
                </form>
              </Card>
              <Card>
                <h3 className="text-lg font-semibold">{t("team.partners.create.member")}</h3>
                <form action={addDeveloperMemberAction} className="mt-3 space-y-3">
                  <FieldSelect
                    label={t("team.partners.create.selectOrg")}
                    helpKey="admin.partners.developer_id"
                    name="developer_id"
                    defaultValue=""
                  >
                    <option value="">{t("team.partners.create.selectOrg")}</option>
                    {developers.map((dev) => (
                      <option key={dev.id} value={dev.id}>
                        {dev.name}
                      </option>
                    ))}
                  </FieldSelect>
                  <FieldInput
                    label={t("team.partners.create.userId")}
                    helpKey="admin.partners.user_id"
                    name="user_id"
                    placeholder={t("team.partners.create.userId")}
                    required
                  />
                  <FieldInput
                    label={t("team.partners.create.role")}
                    helpKey="admin.partners.role"
                    name="role"
                    placeholder={t("team.partners.create.role")}
                  />
                  <Button type="submit">{t("team.partners.create.submit")}</Button>
                </form>
              </Card>
            </div>
          </Section>
        ) : null}

        <Section title={t("team.partners.list.title")} subtitle={t("team.partners.list.subtitle")}>
          {developers.length === 0 ? (
            <Card>
              <p className="text-sm text-[var(--muted)]">{t("team.partners.list.empty")}</p>
            </Card>
          ) : (
            <div className="grid gap-4">
              {developers.map((dev) => {
                const devMembers = membersByDeveloper.get(dev.id) ?? [];
                return (
                  <Card key={dev.id} className="space-y-3">
                    <div>
                      <p className="text-lg font-semibold">{dev.name}</p>
                      <p className="text-xs text-[var(--muted)]">{dev.id}</p>
                    </div>
                    {devMembers.length === 0 ? (
                      <p className="text-sm text-[var(--muted)]">{t("team.partners.list.noMembers")}</p>
                    ) : (
                      <div className="grid gap-2 text-sm">
                        {devMembers.map((member) => {
                          const profile = profilesById.get(member.user_id);
                          return (
                            <div key={`${member.developer_id}:${member.user_id}`} className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-3">
                              <p className="font-semibold">{profile?.full_name ?? member.user_id}</p>
                              <p className="text-xs text-[var(--muted)]">{profile?.email ?? "-"}</p>
                              <p className="text-xs text-[var(--muted)]">{profile?.phone ?? "-"}</p>
                              <p className="text-xs text-[var(--muted)]">{t("team.partners.list.role", { role: member.role ?? "-" })}</p>
                            </div>
                          );
                        })}
                      </div>
                    )}
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
