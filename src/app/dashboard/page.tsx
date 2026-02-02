import Link from "next/link";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabaseServer";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { Badge, Button, Card } from "@/components/ui";
import { logoutAction } from "./actions";
import { createT } from "@/lib/i18n";
import { getServerLocale } from "@/lib/i18n.server";

export const dynamic = "force-dynamic";

function isAuthSessionMissing(msg?: string | null) {
  return (msg ?? "").toLowerCase().includes("auth session missing");
}

export default async function DashboardPage() {
  const nextPath = "/dashboard";
  const authUrl = `/auth?next=${encodeURIComponent(nextPath)}`;

  const locale = await getServerLocale();
  const t = createT(locale);

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.auth.getUser();

  if (error) {
    if (isAuthSessionMissing(error.message)) {
      redirect(authUrl);
    }

    return (
      <div className="min-h-screen bg-[var(--bg)] text-[var(--text)]">
        <SiteHeader />
        <main className="mx-auto w-full max-w-3xl px-6 py-16">
          <Card className="space-y-4">
            <Badge>{t("dashboard.session.error")}</Badge>
            <p className="text-sm text-[var(--muted)]">{t("dashboard.session.help")}</p>
            <div className="flex flex-wrap gap-3">
              <a href={authUrl} className="text-sm text-[var(--accent)]">
                {t("dashboard.session.login")}
              </a>
              <Link href="/" className="text-sm text-[var(--muted)]">
                {t("dashboard.session.home")}
              </Link>
            </div>
          </Card>
        </main>
        <SiteFooter />
      </div>
    );
  }

  const user = data.user;
  if (!user) {
    redirect(authUrl);
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, full_name, phone")
    .eq("id", user.id)
    .maybeSingle();

  const roleLabelMap: Record<string, string> = {
    owner: "role.owner",
    developer: "role.developer",
    admin: "role.admin",
    ops: "role.ops",
    staff: "role.staff",
    agent: "role.agent",
  };

  const roleLabel = t(roleLabelMap[profile?.role ?? "staff"] ?? "role.staff");

  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--text)]">
      <SiteHeader />
      <main className="mx-auto w-full max-w-3xl space-y-6 px-6 py-16">
        <Card className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h1 className="text-2xl font-semibold">{t("dashboard.title")}</h1>
              <p className="text-sm text-[var(--muted)]">
                {profile?.full_name ?? user.email ?? user.phone ?? "-"}
              </p>
            </div>
            <Badge>{roleLabel}</Badge>
          </div>

          <div className="grid gap-3 md:grid-cols-2">
            <Card className="space-y-2">
              <p className="text-xs text-[var(--muted)]">{t("dashboard.email")}</p>
              <p className="text-sm font-semibold">{user.email ?? "-"}</p>
            </Card>
            <Card className="space-y-2">
              <p className="text-xs text-[var(--muted)]">{t("dashboard.phone")}</p>
              <p className="text-sm font-semibold">{user.phone ?? profile?.phone ?? "-"}</p>
            </Card>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link href="/account">
              <Button>{t("dashboard.account")}</Button>
            </Link>
            {profile?.role === "developer" || profile?.role === "admin" || profile?.role === "owner" ? (
              <Link href="/developer">
                <Button variant="secondary">{t("dashboard.partner")}</Button>
              </Link>
            ) : null}
            {profile?.role === "admin" || profile?.role === "owner" ? (
              <Link href="/admin">
                <Button variant="secondary">{t("dashboard.admin")}</Button>
              </Link>
            ) : null}
            {profile?.role === "ops" || profile?.role === "staff" || profile?.role === "admin" || profile?.role === "owner" ? (
              <Link href="/staff">
                <Button variant="secondary">{t("nav.staff")}</Button>
              </Link>
            ) : null}
          </div>

          <form action={logoutAction}>
            <input type="hidden" name="next" value="/dashboard" />
            <Button type="submit" variant="danger">
              {t("dashboard.logout")}
            </Button>
          </form>
        </Card>
      </main>
      <SiteFooter />
    </div>
  );
}



