"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { createT } from "@/lib/i18n";
import { getClientLocale } from "@/lib/i18n.client";
import { Button, Card } from "@/components/ui";
import { FieldInput } from "@/components/FieldHelp";

type Step = "info" | "code" | "password";

function normalizeEmail(value: string) {
  return value.trim().toLowerCase();
}

function normalizePhone(value: string) {
  return value.trim();
}

export default function TeamActivateClient() {
  const locale = getClientLocale();
  const t = createT(locale);
  const router = useRouter();

  const [step, setStep] = useState<Step>("info");
  const [loading, setLoading] = useState(false);

  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [fullName, setFullName] = useState("");
  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");

  const [info, setInfo] = useState("");
  const [error, setError] = useState("");

  const emailValue = useMemo(() => normalizeEmail(email), [email]);
  const phoneValue = useMemo(() => normalizePhone(phone), [phone]);

  function resetMessages() {
    setInfo("");
    setError("");
  }

  function setErrorFromPrecheck(codeValue: string) {
    if (codeValue === "not_invited") return t("team.activate.error.notInvited");
    if (codeValue === "mismatch") return t("team.activate.error.mismatch");
    return t("team.activate.error.invalid");
  }

  async function handleSendCode() {
    resetMessages();
    setLoading(true);
    try {
      const res = await fetch("/api/team/precheck", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: emailValue, phone: phoneValue }),
      });

      const payload = (await res.json().catch(() => null)) as { ok?: boolean; error?: string } | null;
      if (!res.ok || !payload?.ok) {
        setError(setErrorFromPrecheck(payload?.error ?? "invalid_input"));
        return;
      }

      const { error: otpError } = await supabase.auth.signInWithOtp({
        email: emailValue,
        options: {
          shouldCreateUser: false,
          emailRedirectTo: `${window.location.origin}/team/activate`,
        },
      });

      if (otpError) {
        setError(t("team.activate.error.send"));
        return;
      }

      setInfo(t("team.activate.info.sent"));
      setStep("code");
    } catch {
      setError(t("team.activate.error.send"));
    } finally {
      setLoading(false);
    }
  }

  async function handleVerifyCode() {
    resetMessages();
    setLoading(true);
    try {
      const { error: verifyError } = await supabase.auth.verifyOtp({
        email: emailValue,
        token: code.trim(),
        type: "email",
      });

      if (verifyError) {
        setError(t("team.activate.error.verify"));
        return;
      }

      setInfo(t("team.activate.info.verified"));
      setStep("password");
    } catch {
      setError(t("team.activate.error.verify"));
    } finally {
      setLoading(false);
    }
  }

  async function handleSetPassword() {
    resetMessages();

    if (password.length < 6 || password !== passwordConfirm) {
      setError(t("team.activate.error.password"));
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/team/activate/complete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phone: phoneValue,
          full_name: fullName.trim() || null,
          password,
        }),
      });

      const payload = (await res.json().catch(() => null)) as { ok?: boolean; error?: string } | null;
      if (!res.ok || !payload?.ok) {
        setError(t("team.activate.error.complete"));
        return;
      }

      setInfo(t("team.activate.info.done"));
      router.push("/team");
    } catch {
      setError(t("team.activate.error.complete"));
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold">{t("team.activate.title")}</h1>
        <p className="text-sm text-[var(--muted)]">{t("team.activate.subtitle")}</p>
      </div>

      {step === "info" ? (
        <div className="space-y-4">
          <FieldInput
            label={t("team.activate.email")}
            helpKey="auth.email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder={t("team.activate.email")}
            autoComplete="email"
            disabled={loading}
          />
          <FieldInput
            label={t("team.activate.phone")}
            helpKey="account.profile.phone"
            value={phone}
            onChange={(event) => setPhone(event.target.value)}
            placeholder={t("team.activate.phone")}
            autoComplete="tel"
            disabled={loading}
          />
          <FieldInput
            label={t("team.activate.fullName")}
            helpKey="account.profile.full_name"
            value={fullName}
            onChange={(event) => setFullName(event.target.value)}
            placeholder={t("team.activate.fullName")}
            disabled={loading}
          />
          <Button onClick={handleSendCode} disabled={loading || !emailValue || !phoneValue}>
            {loading ? t("team.activate.sending") : t("team.activate.send")}
          </Button>
        </div>
      ) : null}

      {step === "code" ? (
        <div className="space-y-4">
          <p className="text-sm text-[var(--muted)]">{t("team.activate.codeHint")}</p>
          <FieldInput
            label={t("team.activate.code")}
            helpKey="team.activate.code"
            value={code}
            onChange={(event) => setCode(event.target.value)}
            placeholder={t("team.activate.code")}
            disabled={loading}
          />
          <div className="flex flex-wrap gap-3">
            <Button onClick={handleVerifyCode} disabled={loading || code.trim().length < 4}>
              {loading ? t("team.activate.verifying") : t("team.activate.verify")}
            </Button>
            <Button
              variant="secondary"
              onClick={() => setStep("info")}
              disabled={loading}
            >
              {t("team.activate.back")}
            </Button>
          </div>
        </div>
      ) : null}

      {step === "password" ? (
        <div className="space-y-4">
          <FieldInput
            label={t("team.activate.password")}
            helpKey="auth.password"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder={t("team.activate.password")}
            disabled={loading}
          />
          <FieldInput
            label={t("team.activate.passwordConfirm")}
            helpKey="auth.passwordConfirm"
            type="password"
            value={passwordConfirm}
            onChange={(event) => setPasswordConfirm(event.target.value)}
            placeholder={t("team.activate.passwordConfirm")}
            disabled={loading}
          />
          <Button onClick={handleSetPassword} disabled={loading}>
            {loading ? t("team.activate.creating") : t("team.activate.create")}
          </Button>
        </div>
      ) : null}

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
    </Card>
  );
}

