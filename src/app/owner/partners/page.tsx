import Link from "next/link";
import { requireOwnerAccess } from "@/lib/owner";
import { createSupabaseServerClient } from "@/lib/supabaseServer";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { Badge, Button, Card, Section } from "@/components/ui";
import { FieldInput, FieldSelect } from "@/components/FieldHelp";
import { UserSearchSelect } from "@/components/UserSearchSelect";
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

export default async function OwnerPartnersPage() {
  await requireOwnerAccess("/owner/partners");
  const supabase = await createSupabaseServerClient();
  const locale = await getServerLocale();
  const t = createT(locale);

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

  const { data: teamUsersData } = await supabase
    .from("profiles")
    .select("id, full_name, email, phone")
    .in("role", ["owner", "admin", "ops", "staff", "agent", "developer"])
    .order("full_name", { ascending: true });
  const teamUsers = (teamUsersData ?? []) as ProfileRow[];

  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--text)]">
      <SiteHeader />
      <main className="mx-auto w-full max-w-6xl space-y-8 px-6 py-10">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-semibold">{t("owner.hub.partners.title")}</h1>
            <p className="text-sm text-[var(--muted)]">{t("owner.hub.partners.subtitle")}</p>
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

        <Section title={t("admin.partners.title")} subtitle={t("admin.partners.subtitle")}>
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <h3 className="text-lg font-semibold">{t("admin.partners.add")}</h3>
              <form action={createDeveloperAction} className="mt-3 space-y-3">
                <FieldInput
                  label={t("admin.partners.name")}
                  helpKey="admin.partners.name"
                  name="name"
                  placeholder={t("admin.partners.add")}
                  required
                />
                <Button type="submit">{t("admin.partners.addBtn")}</Button>
              </form>
            </Card>
            <Card>
              <h3 className="text-lg font-semibold">{t("admin.partners.link")}</h3>
              <form action={addDeveloperMemberAction} className="mt-3 space-y-3">
                <FieldSelect
                  label={t("admin.partners.selectDeveloper")}
                  helpKey="admin.partners.developer_id"
                  name="developer_id"
                  defaultValue=""
                >
                  <option value="">{t("admin.partners.selectDeveloper")}</option>
                  {developers.map((dev) => (
                    <option key={dev.id} value={dev.id}>
                      {dev.name}
                    </option>
                  ))}
                </FieldSelect>
                <UserSearchSelect
                  users={teamUsers}
                  name="user_id"
                  label={t("admin.partners.searchUser")}
                  helpKey="admin.partners.user_id"
                  placeholder={t("admin.partners.searchPlaceholder")}
                  required
                />
                <FieldInput
                  label={t("admin.partners.role")}
                  helpKey="admin.partners.role"
                  name="role"
                  placeholder={t("admin.partners.roleHint")}
                />
                <Button type="submit">{t("admin.partners.linkBtn")}</Button>
              </form>
            </Card>
          </div>
        </Section>

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
                            <div
                              key={`${member.developer_id}:${member.user_id}`}
                              className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-3"
                            >
                              <p className="font-semibold">{profile?.full_name ?? member.user_id}</p>
                              <p className="text-xs text-[var(--muted)]">{profile?.email ?? "-"}</p>
                              <p className="text-xs text-[var(--muted)]">{profile?.phone ?? "-"}</p>
                              <p className="text-xs text-[var(--muted)]">
                                {t("team.partners.list.role", { role: member.role ?? "-" })}
                              </p>
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
