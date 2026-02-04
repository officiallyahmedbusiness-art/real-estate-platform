"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { safeNextPath } from "@/lib/paths";
import { Button, Card, Input } from "@/components/ui";
import { FieldInput, FieldWrapper } from "@/components/FieldHelp";
import { createT } from "@/lib/i18n";
import { getClientLocale } from "@/lib/i18n.client";
import Link from "next/link";

function safeMsg(err: unknown) {
  if (!err) return "";
  if (typeof err === "string") return err;
  if (err instanceof Error) return err.message;
  try {
    return JSON.stringify(err);
  } catch {
    return "Unknown error";
  }
}

export default function AuthClient() {
  const locale = getClientLocale();
  const t = createT(locale);

  const sp = useSearchParams();

  const nextPath = useMemo(
    () => safeNextPath(sp.get("next"), "/dashboard"),
    [sp]
  );

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [sessionEmail, setSessionEmail] = useState<string | null>(null);

  const [info, setInfo] = useState<string>("");
  const [error, setError] = useState<string>("");

  const hardRedirect = useCallback(() => {
    window.location.assign(nextPath);
  }, [nextPath]);

  async function bootstrapProfile() {
    try {
      await fetch("/api/profile-bootstrap", { method: "POST" });
    } catch {
      // ignore
    }
  }

  useEffect(() => {
    let mounted = true;

    (async () => {
      const { data } = await supabase.auth.getSession();
      if (!mounted) return;
      setSessionEmail(data.session?.user?.email ?? null);
      if (data.session) {
        await bootstrapProfile();
      }
    })();

    const { data: sub } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setSessionEmail(session?.user?.email ?? null);

      if (session) {
        await bootstrapProfile();
        hardRedirect();
      }
    });

    return () => {
      mounted = false;
      sub.subscription.unsubscribe();
    };
  }, [hardRedirect]);

  function resetMessages() {
    setInfo("");
    setError("");
  }

  async function handleEmailSignIn() {
    resetMessages();
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (error) throw error;

      setInfo(t("auth.msg.signInSuccess"));
      await bootstrapProfile();
      hardRedirect();
    } catch (e) {
      setError(t("auth.error.signIn", { message: safeMsg(e) }));
    } finally {
      setLoading(false);
    }
  }

  async function handleLogout() {
    resetMessages();
    setLoading(true);
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      setInfo(t("auth.msg.logout"));
      setSessionEmail(null);
    } catch (e) {
      setError(t("auth.error.logout", { message: safeMsg(e) }));
    } finally {
      setLoading(false);
    }
  }

  const disabledEmail = loading || email.trim().length === 0 || password.length < 6;
  return (
    <main className="min-h-screen bg-[var(--bg)] text-[var(--text)]">
      <div className="mx-auto flex min-h-screen w-full max-w-6xl items-center justify-center px-6 py-12">
        <Card className="w-full max-w-xl space-y-6">
          <div className="space-y-2">
            <h1 className="text-2xl font-semibold">{t("auth.title")}</h1>
            <p className="text-sm text-[var(--muted)]">{t("auth.subtitle")}</p>
          </div>

          {sessionEmail ? (
            <Card className="space-y-3">
              <p className="text-sm text-[var(--muted)]">{t("auth.session.title")}</p>
              <p className="text-sm font-semibold">{sessionEmail}</p>
              <div className="flex flex-wrap gap-3">
                <Button onClick={hardRedirect}>{t("auth.session.go")}</Button>
                <Button onClick={handleLogout} variant="danger">
                  {t("auth.session.logout")}
                </Button>
              </div>
            </Card>
          ) : null}

          <section className="grid gap-4">
            <FieldInput
              label={t("auth.email.label")}
              helpKey="auth.email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={t("auth.email.placeholder")}
              autoComplete="email"
              disabled={loading}
            />
            <FieldWrapper label={t("auth.password.label")} helpKey="auth.password">
              <div className="relative">
                <Input
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="******"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  disabled={loading}
                  className="pr-24"
                  data-no-help
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-[var(--muted)] hover:text-[var(--text)]"
                  aria-pressed={showPassword}
                >
                  {showPassword ? t("auth.password.hide") : t("auth.password.show")}
                </button>
              </div>
              <small className="text-xs text-[var(--muted)]">{t("auth.password.hint")}</small>
            </FieldWrapper>
            <div className="flex flex-wrap gap-3">
              <Button onClick={handleEmailSignIn} disabled={disabledEmail}>
                {t("auth.action.signIn")}
              </Button>
              <Link href="/auth/forgot" className="text-sm text-[var(--muted)] hover:text-[var(--text)]">
                {t("auth.reset.link")}
              </Link>
            </div>
          </section>

          {(info || error) && (
            <div className="space-y-2">
              {info ? (
                <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-3 text-sm">
                  {info}
                </div>
              ) : null}
              {error ? (
                <div className="rounded-xl border border-[rgba(244,63,94,0.35)] bg-[rgba(244,63,94,0.15)] p-3 text-sm">
                  {error}
                </div>
              ) : null}
            </div>
          )}

          <footer className="text-xs text-[var(--muted)]">
            {t("auth.footer.redirect", { path: nextPath })}
          </footer>
        </Card>
      </div>
    </main>
  );
}
