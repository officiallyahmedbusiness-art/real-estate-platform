// src/app/dashboard/page.tsx
import type { CSSProperties } from "react";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabaseServer";
import { logoutAction } from "./actions";

// عشان ما ندوّخش Turbopack/Edge caching مع sessions أثناء التطوير
export const dynamic = "force-dynamic";

function isAuthSessionMissing(msg?: string | null) {
  return (msg ?? "").toLowerCase().includes("auth session missing");
}

function prettyError(err: unknown) {
  if (!err) return "Unknown error";
  if (typeof err === "string") return err;
  if (err instanceof Error) return err.message;
  try {
    return JSON.stringify(err, null, 2);
  } catch {
    return String(err);
  }
}

export default async function DashboardPage() {
  const nextPath = "/dashboard";
  const authUrl = `/auth?next=${encodeURIComponent(nextPath)}`;

  const supabase = await createSupabaseServerClient();

  // Get user (server-side)
  const { data, error } = await supabase.auth.getUser();

  // Redirect if session missing
  if (error) {
    if (isAuthSessionMissing(error.message)) {
      redirect(authUrl);
    }

    return (
      <main style={styles.page}>
        <h1 style={styles.h1}>Dashboard</h1>

        <div style={styles.card}>
          <p style={{ ...styles.badge, ...styles.badgeDanger }}>Supabase Error</p>
          <p style={styles.muted}>
            حصل خطأ غير متوقع وإحنا بنقرأ بيانات المستخدم من السيرفر.
          </p>

          <pre style={styles.pre}>{prettyError(error.message)}</pre>

          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <a href={authUrl} style={{ ...styles.btn, ...styles.btnPrimary }}>
              رجوع لتسجيل الدخول
            </a>
            <a href="/" style={{ ...styles.btn, ...styles.btnGhost }}>
              الصفحة الرئيسية
            </a>
          </div>
        </div>
      </main>
    );
  }

  const user = data.user;

  if (!user) {
    redirect(authUrl);
  }

  return (
    <main style={styles.page}>
      <h1 style={styles.h1}>Dashboard</h1>

      <div style={styles.card}>
        <p style={{ ...styles.badge, ...styles.badgeOk }}>Authenticated</p>

        <p style={styles.line}>
          أنت داخل كـ: <b>{user.email ?? user.phone ?? "unknown"}</b>
        </p>

        <pre style={styles.pre}>
          {JSON.stringify(
            {
              id: user.id,
              email: user.email,
              phone: user.phone,
              role: user.role,
              last_sign_in_at: user.last_sign_in_at,
              created_at: user.created_at,
            },
            null,
            2
          )}
        </pre>

        {/* ✅ Logout via actions.ts + next sent reliably via hidden input */}
        <form action={logoutAction}>
          <input type="hidden" name="next" value="/dashboard" />
          <button type="submit" style={{ ...styles.btn, ...styles.btnDanger }}>
            Logout
          </button>
        </form>

        <p style={styles.muted}>
          ملاحظة: لو فتحت الصفحة دي من Incognito من غير تسجيل دخول، لازم يحولك على{" "}
          <code>/auth</code>.
        </p>
      </div>
    </main>
  );
}

const styles: Record<string, CSSProperties> = {
  page: {
    minHeight: "100vh",
    padding: 24,
    fontFamily: "system-ui",
    background: "#0b0b0b",
    color: "#fff",
  },
  h1: { margin: 0, marginBottom: 14, fontSize: 28 },
  card: {
    width: "min(760px, 100%)",
    border: "1px solid rgba(255,255,255,0.12)",
    borderRadius: 16,
    padding: 18,
    background: "rgba(255,255,255,0.04)",
    backdropFilter: "blur(8px)",
  },
  badge: {
    display: "inline-block",
    padding: "6px 10px",
    borderRadius: 999,
    fontSize: 12,
    fontWeight: 800,
    marginBottom: 10,
  },
  badgeOk: {
    border: "1px solid rgba(0,255,140,0.25)",
    background: "rgba(0,255,140,0.08)",
  },
  badgeDanger: {
    border: "1px solid rgba(255,80,80,0.35)",
    background: "rgba(255,80,80,0.12)",
  },
  line: { margin: "10px 0 12px" },
  pre: {
    whiteSpace: "pre-wrap",
    background: "rgba(0,0,0,0.35)",
    border: "1px solid rgba(255,255,255,0.12)",
    borderRadius: 12,
    padding: 12,
    overflowX: "auto",
    margin: "0 0 14px",
  },
  muted: { opacity: 0.75, marginTop: 12, fontSize: 12 },
  btn: {
    padding: "10px 14px",
    borderRadius: 10,
    border: "1px solid rgba(255,255,255,0.18)",
    cursor: "pointer",
    fontWeight: 800,
    textDecoration: "none",
    display: "inline-block",
  },
  btnPrimary: {
    background: "#ffffff",
    color: "#0b0b0b",
  },
  btnGhost: {
    background: "transparent",
    color: "#fff",
  },
  btnDanger: {
    background: "rgba(255,80,80,0.12)",
    color: "#fff",
    border: "1px solid rgba(255,80,80,0.35)",
  },
};
