import { cookies } from "next/headers";
import { createT } from "@/lib/i18n";
import { getServerLocale } from "@/lib/i18n.server";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { Button, Card, Section, Stat } from "@/components/ui";
import { FieldInput } from "@/components/FieldHelp";
import { createSupabaseServerClient } from "@/lib/supabaseServer";
import AutoRefresh from "@/components/team/AutoRefresh";
import ActiveDuration from "@/components/team/ActiveDuration";
import { unlockOwnerAction } from "./actions";

const ONLINE_THRESHOLD_MS = 2 * 60 * 1000;
const IDLE_THRESHOLD_MS = 10 * 60 * 1000;

type SessionRow = {
  id: string;
  user_id: string;
  started_at: string;
  last_seen_at: string;
  ended_at: string | null;
};

type ProfileRow = {
  id: string;
  full_name: string | null;
  email: string | null;
  role: string | null;
  is_active?: boolean | null;
};

type PresenceStatus = "online" | "idle" | "offline";

type OwnerErrorKey = "owner.unlock.missing" | "owner.unlock.rate" | "owner.unlock.error";

function formatMinutes(minutes: number | null | undefined) {
  const total = Math.max(0, Math.round(minutes ?? 0));
  const hours = Math.floor(total / 60);
  const mins = total % 60;
  return `${hours}:${String(mins).padStart(2, "0")}`;
}

function getStatus(session: SessionRow | null, nowMs: number): PresenceStatus {
  if (!session) return "offline";
  if (session.ended_at) return "offline";
  const lastSeenMs = new Date(session.last_seen_at).getTime();
  const diff = nowMs - lastSeenMs;
  if (diff <= ONLINE_THRESHOLD_MS) return "online";
  if (diff <= IDLE_THRESHOLD_MS) return "idle";
  return "offline";
}

export default async function OwnerPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const locale = await getServerLocale();
  const t = createT(locale);
  const params = await searchParams;
  const errorParam = typeof params.error === "string" ? params.error : "";
  const nextPath = typeof params.next === "string" ? params.next : "/owner";

  const secret = (process.env.OWNER_SECRET ?? "").trim();
  const hasSecret = Boolean(secret);

  const supabase = await createSupabaseServerClient();
  const { data: userData } = await supabase.auth.getUser();
  const userId = userData?.user?.id ?? null;

  const { data: profileData } = userId
    ? await supabase
        .from("profiles")
        .select("id, full_name, email, role, is_active")
        .eq("id", userId)
        .maybeSingle()
    : { data: null };

  const isOwner = profileData?.role === "owner";
  const cookieStore = await cookies();
  const hasToken = Boolean(secret) && cookieStore.get("owner_token")?.value === secret;
  const canViewDashboard = Boolean(hasSecret && isOwner && hasToken);

  if (!canViewDashboard) {
    const errorKey: OwnerErrorKey | null = !hasSecret
      ? "owner.unlock.missing"
      : errorParam === "missing"
        ? "owner.unlock.missing"
        : errorParam === "rate"
          ? "owner.unlock.rate"
          : errorParam === "1"
            ? "owner.unlock.error"
            : null;

    return (
      <div className="min-h-screen bg-[var(--bg)] text-[var(--text)]">
        <SiteHeader />
        <main className="mx-auto w-full max-w-xl space-y-6 px-6 py-16">
          <div className="space-y-2">
            <h1 className="text-2xl font-semibold">{t("owner.unlock.title")}</h1>
            <p className="text-sm text-[var(--muted)]">{t("owner.unlock.subtitle")}</p>
          </div>
          <Card className="space-y-4">
            <p className="text-xs text-[var(--muted)]">{t("owner.unlock.hint")}</p>
            <form action={unlockOwnerAction} className="space-y-3">
              <input type="hidden" name="next" value={nextPath} />
              <FieldInput
                name="owner_token"
                label={t("owner.unlock.input")}
                helpKey="owner.unlock.token"
                type="password"
                placeholder={t("owner.unlock.input")}
              />
              {errorKey ? (
                <p className="text-xs text-[var(--danger)]">{t(errorKey)}</p>
              ) : null}
              <Button type="submit" size="sm">
                {t("owner.unlock.action")}
              </Button>
            </form>
          </Card>
        </main>
        <SiteFooter />
      </div>
    );
  }

  // eslint-disable-next-line react-hooks/purity
  const now = Date.now();
  const recentCutoff = new Date(now - 14 * 24 * 60 * 60 * 1000).toISOString();

  const { data: sessionsData, error: sessionsError } = await supabase
    .from("team_sessions")
    .select("id, user_id, started_at, last_seen_at, ended_at")
    .gte("last_seen_at", recentCutoff)
    .order("last_seen_at", { ascending: false });

  const sessions = sessionsError ? [] : ((sessionsData ?? []) as SessionRow[]);
  const latestByUser = new Map<string, SessionRow>();
  for (const session of sessions) {
    if (!latestByUser.has(session.user_id)) {
      latestByUser.set(session.user_id, session);
    }
  }

  const { data: teamProfilesData, error: profilesError } = await supabase
    .from("profiles")
    .select("id, full_name, email, role, is_active")
    .in("role", ["owner", "admin", "ops", "staff", "agent", "developer"]);

  const teamProfiles = profilesError ? [] : ((teamProfilesData ?? []) as ProfileRow[]);

  const { data: todayData, error: todayError } = await supabase
    .from("report_team_time_today")
    .select("user_id, minutes");
  const { data: weekData, error: weekError } = await supabase
    .from("report_team_time_7d")
    .select("user_id, minutes");

  const todayMap = new Map<string, number>();
  for (const row of (todayError ? [] : todayData ?? []) as Array<{
    user_id: string;
    minutes: number;
  }>) {
    todayMap.set(row.user_id, Number(row.minutes ?? 0));
  }

  const weekMap = new Map<string, number>();
  for (const row of (weekError ? [] : weekData ?? []) as Array<{
    user_id: string;
    minutes: number;
  }>) {
    weekMap.set(row.user_id, Number(row.minutes ?? 0));
  }

  const rows = teamProfiles
    .filter((profile) => profile.is_active !== false)
    .map((profile) => {
      const session = latestByUser.get(profile.id) ?? null;
      const status = getStatus(session, now);
      const todayMinutes = todayMap.get(profile.id) ?? 0;
      const weekMinutes = weekMap.get(profile.id) ?? 0;
      return {
        profile,
        session,
        status,
        todayMinutes,
        weekMinutes,
      };
    });

  const counts = rows.reduce(
    (acc, row) => {
      acc[row.status] += 1;
      return acc;
    },
    { online: 0, idle: 0, offline: 0 } as Record<PresenceStatus, number>
  );

  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--text)]">
      <AutoRefresh intervalMs={30_000} />
      <SiteHeader />
      <main className="mx-auto w-full max-w-6xl space-y-8 px-6 py-10">
        <div className="space-y-2">
          <h1 className="text-2xl font-semibold">{t("owner.dashboard.title")}</h1>
          <p className="text-sm text-[var(--muted)]">{t("owner.dashboard.subtitle")}</p>
        </div>

        <Section title={t("owner.dashboard.presence.title")} subtitle={t("owner.dashboard.presence.subtitle")}>
          <div className="grid gap-4 md:grid-cols-3">
            <Stat label={t("owner.dashboard.presence.countOnline")} value={counts.online} />
            <Stat label={t("owner.dashboard.presence.countIdle")} value={counts.idle} />
            <Stat label={t("owner.dashboard.presence.countOffline")} value={counts.offline} />
          </div>

          <Card className="overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-[var(--surface)] text-xs text-[var(--muted)]">
                  <tr>
                    <th className="px-4 py-3 text-start">{t("owner.dashboard.table.name")}</th>
                    <th className="px-4 py-3 text-start">{t("owner.dashboard.table.role")}</th>
                    <th className="px-4 py-3 text-start">{t("owner.dashboard.table.status")}</th>
                    <th className="px-4 py-3 text-start">{t("owner.dashboard.table.started")}</th>
                    <th className="px-4 py-3 text-start">{t("owner.dashboard.table.active")}</th>
                    <th className="px-4 py-3 text-start">{t("owner.dashboard.table.today")}</th>
                    <th className="px-4 py-3 text-start">{t("owner.dashboard.table.week")}</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row) => {
                    const displayName =
                      row.profile.full_name || row.profile.email || row.profile.id.slice(0, 8);
                    const startedAt = row.session?.started_at;
                    const endedAt = row.session?.ended_at ?? row.session?.last_seen_at ?? null;
                    const statusLabel =
                      row.status === "online"
                        ? t("owner.dashboard.status.online")
                        : row.status === "idle"
                          ? t("owner.dashboard.status.idle")
                          : t("owner.dashboard.status.offline");

                    const statusColor =
                      row.status === "online"
                        ? "text-[var(--success)]"
                        : row.status === "idle"
                          ? "text-[var(--warning)]"
                          : "text-[var(--muted)]";

                    return (
                      <tr key={row.profile.id} className="border-t border-[var(--border)]">
                        <td className="px-4 py-3 font-semibold">{displayName}</td>
                        <td className="px-4 py-3 text-[var(--muted)]">{row.profile.role ?? "-"}</td>
                        <td className={`px-4 py-3 font-semibold ${statusColor}`}>{statusLabel}</td>
                        <td className="px-4 py-3 text-[var(--muted)]">
                          {startedAt ? new Date(startedAt).toLocaleString(locale) : "-"}
                        </td>
                        <td className="px-4 py-3">
                          {startedAt ? (
                            <ActiveDuration start={startedAt} end={row.status === "offline" ? endedAt : null} />
                          ) : (
                            "-"
                          )}
                        </td>
                        <td className="px-4 py-3">{formatMinutes(row.todayMinutes)}</td>
                        <td className="px-4 py-3">{formatMinutes(row.weekMinutes)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </Card>
        </Section>
      </main>
      <SiteFooter />
    </div>
  );
}
