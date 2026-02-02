import { requireOwnerAccess } from "@/lib/owner";
import { createSupabaseServerClient } from "@/lib/supabaseServer";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { Badge, Button, Card, Select, Section } from "@/components/ui";
import { createT } from "@/lib/i18n";
import { getServerLocale } from "@/lib/i18n.server";
import { updateOwnerRoleAction } from "../actions";

export default async function OwnerUsersPage() {
  await requireOwnerAccess("/owner/users");
  const supabase = await createSupabaseServerClient();
  const locale = await getServerLocale();
  const t = createT(locale);

  const { data: profilesData } = await supabase
    .from("profiles")
    .select("id, full_name, phone, email, role, created_at, last_sign_in_at")
    .order("created_at", { ascending: false })
    .limit(100);
  const profiles = profilesData ?? [];

  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--text)]">
      <SiteHeader />
      <main className="mx-auto w-full max-w-6xl space-y-8 px-6 py-10">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-semibold">{t("owner.users.title")}</h1>
            <p className="text-sm text-[var(--muted)]">{t("owner.users.subtitle")}</p>
          </div>
          <Badge>{t("role.owner")}</Badge>
        </div>

        <Section title={t("owner.users.title")} subtitle={t("owner.users.subtitle")}>
          <Card className="space-y-4">
            {profiles.map((profile) => (
              <form
                key={profile.id}
                action={updateOwnerRoleAction}
                className="flex flex-col gap-3 border-b border-[var(--border)] pb-4 last:border-none"
              >
                <input type="hidden" name="user_id" value={profile.id} />
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold">{profile.full_name ?? "-"}</p>
                    <p className="text-xs text-[var(--muted)]">{profile.id}</p>
                    <p className="text-xs text-[var(--muted)]">{profile.created_at ?? "-"}</p>
                    <p className="text-xs text-[var(--muted)]">{profile.email ?? "-"}</p>
                    <p className="text-xs text-[var(--muted)]">{profile.phone ?? "-"}</p>
                    <p className="text-xs text-[var(--muted)]">
                      {profile.last_sign_in_at ?? "-"}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <Select name="role" defaultValue={profile.role}>
                      <option value="owner">{t("role.owner")}</option>
                      <option value="admin">{t("role.admin")}</option>
                      <option value="ops">{t("role.ops")}</option>
                      <option value="staff">{t("role.staff")}</option>
                      <option value="agent">{t("role.agent")}</option>
                      <option value="developer">{t("role.developer")}</option>
                    </Select>
                    <Button size="sm" variant="secondary" type="submit">
                      {t("owner.users.update")}
                    </Button>
                  </div>
                </div>
              </form>
            ))}
          </Card>
        </Section>
      </main>
      <SiteFooter />
    </div>
  );
}
