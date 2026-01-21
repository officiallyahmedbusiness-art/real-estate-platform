"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { safeNextPath } from "@/lib/paths";

type Mode = "email" | "phone";

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
  const router = useRouter(); // هنسيبه موجود (مش هيضر)، بس التحويل الأساسي هيبقى Reload
  const sp = useSearchParams();

  const nextPath = useMemo(
    () => safeNextPath(sp.get("next"), "/dashboard"),
    [sp]
  );

  const [mode, setMode] = useState<Mode>("email");

  // Email/Password
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // Phone OTP
  const [phone, setPhone] = useState(""); // مثال: +2010xxxxxxx
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);

  // Session / UI state
  const [loading, setLoading] = useState(false);
  const [sessionEmail, setSessionEmail] = useState<string | null>(null);

  const [info, setInfo] = useState<string>("");
  const [error, setError] = useState<string>("");

  // ✅ تحويل “Hard Reload” (ده اللي هيحل Auth session missing على السيرفر)
  function hardRedirect() {
    // full page load → server sees cookies for sure
    window.location.assign(nextPath);
  }

  async function bootstrapProfile() {
    try {
      await fetch("/api/profile-bootstrap", { method: "POST" });
    } catch {
      // ignore
    }
  }

  // Read session initially + listen changes
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

      // ✅ بدل router.replace: اعمل Reload كامل بعد نجاح الدخول/وجود session
      if (session) {
        await bootstrapProfile();
        hardRedirect();
      }
    });

    return () => {
      mounted = false;
      sub.subscription.unsubscribe();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nextPath]);

  // Helpers
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

      setInfo("تم تسجيل الدخول بنجاح. جاري تحويلك...");

      // ✅ تحوّل فورًا (وتفضل onAuthStateChange كـ backup)
      await bootstrapProfile();
      hardRedirect();
    } catch (e) {
      setError(`فشل تسجيل الدخول: ${safeMsg(e)}`);
    } finally {
      setLoading(false);
    }
  }

  async function handleEmailSignUp() {
    resetMessages();
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth?next=${encodeURIComponent(
            nextPath
          )}`,
        },
      });

      if (error) throw error;

      // لو المشروع عنده email confirmation شغالة: غالبًا session = null
      if (!data.session) {
        setInfo(
          "تم إنشاء الحساب. راجع بريدك الإلكتروني واضغط رابط التأكيد، وبعدها ارجع هنا."
        );
      } else {
        setInfo("تم إنشاء الحساب وتسجيل الدخول. جاري تحويلك...");
        // ✅ لو session موجودة بالفعل، اعمل Reload كامل
        await bootstrapProfile();
        hardRedirect();
      }
    } catch (e) {
      setError(`فشل إنشاء الحساب: ${safeMsg(e)}`);
    } finally {
      setLoading(false);
    }
  }

  async function handleSendOtp() {
    resetMessages();
    setLoading(true);
    try {
      const cleaned = phone.trim();
      if (!cleaned.startsWith("+")) {
        throw new Error("لازم رقم الموبايل يبدأ بـ + (مثال: +2010xxxxxxx).");
      }

      const { error } = await supabase.auth.signInWithOtp({
        phone: cleaned,
      });

      if (error) throw error;

      setOtpSent(true);
      setInfo("تم إرسال الكود. اكتب OTP واضغط Verify.");
    } catch (e) {
      setError(`فشل إرسال OTP: ${safeMsg(e)}`);
    } finally {
      setLoading(false);
    }
  }

  async function handleVerifyOtp() {
    resetMessages();
    setLoading(true);
    try {
      const cleanedPhone = phone.trim();
      const cleanedOtp = otp.trim();

      if (!otpSent) throw new Error("ابعت OTP الأول.");
      if (cleanedOtp.length < 4) throw new Error("OTP قصير. اكتب الكود الصحيح.");

      const { error } = await supabase.auth.verifyOtp({
        phone: cleanedPhone,
        token: cleanedOtp,
        type: "sms",
      });

      if (error) throw error;

      setInfo("تم التحقق بنجاح. جاري تحويلك...");

      // ✅ Reload كامل بعد نجاح التحقق
      await bootstrapProfile();
      hardRedirect();
    } catch (e) {
      setError(`فشل التحقق: ${safeMsg(e)}`);
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
      setInfo("تم تسجيل الخروج.");
      setSessionEmail(null);
    } catch (e) {
      setError(`فشل تسجيل الخروج: ${safeMsg(e)}`);
    } finally {
      setLoading(false);
    }
  }

  const disabledEmail = loading || email.trim().length === 0 || password.length < 6;
  const disabledPhone =
    loading || phone.trim().length < 8 || (!otpSent ? false : otp.trim().length < 4);

  return (
    <main
      style={{
        minHeight: "100vh",
        display: "grid",
        placeItems: "center",
        padding: 24,
        fontFamily: "system-ui",
        background: "#0b0b0b",
        color: "#fff",
      }}
    >
      <div
        style={{
          width: "min(520px, 100%)",
          border: "1px solid rgba(255,255,255,0.12)",
          borderRadius: 16,
          padding: 20,
          background: "rgba(255,255,255,0.04)",
          backdropFilter: "blur(8px)",
        }}
      >
        <h1 style={{ margin: 0, marginBottom: 8 }}>تسجيل الدخول</h1>
        <p style={{ marginTop: 0, opacity: 0.8 }}>
          اختار الطريقة: Email/Password أو رقم موبايل بكود.
          <br />
          <span style={{ opacity: 0.85 }}>
            ملاحظة: بعد النجاح هنحوّلك بـ <b>Reload كامل</b> عشان السيرفر يشوف الـ Session.
          </span>
        </p>

        <div style={{ display: "flex", gap: 10, marginBottom: 16 }}>
          <button
            onClick={() => {
              resetMessages();
              setMode("email");
            }}
            disabled={loading}
            style={tabStyle(mode === "email")}
          >
            Email + Password
          </button>
          <button
            onClick={() => {
              resetMessages();
              setMode("phone");
            }}
            disabled={loading}
            style={tabStyle(mode === "phone")}
          >
            Phone OTP
          </button>
        </div>

        {sessionEmail ? (
          <div
            style={{
              border: "1px solid rgba(0,255,140,0.25)",
              background: "rgba(0,255,140,0.08)",
              padding: 12,
              borderRadius: 12,
              marginBottom: 16,
            }}
          >
            <div style={{ marginBottom: 8 }}>
              أنت داخل بالفعل: <b>{sessionEmail}</b>
            </div>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              <button
                // ✅ بدل router.push: Reload كامل
                onClick={hardRedirect}
                disabled={loading}
                style={primaryBtn}
              >
                افتح Dashboard
              </button>
              <button onClick={handleLogout} disabled={loading} style={dangerBtn}>
                Logout
              </button>
            </div>
          </div>
        ) : null}

        {mode === "email" ? (
          <section style={{ display: "grid", gap: 10 }}>
            <label style={labelStyle}>
              Email
              <input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                autoComplete="email"
                style={inputStyle}
                disabled={loading}
              />
            </label>

            <label style={labelStyle}>
              Password
              <input
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="******"
                type="password"
                autoComplete="current-password"
                style={inputStyle}
                disabled={loading}
              />
              <small style={{ opacity: 0.75 }}>
                ملاحظة: أقل حاجة 6 حروف عادةً.
              </small>
            </label>

            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              <button onClick={handleEmailSignIn} disabled={disabledEmail} style={primaryBtn}>
                دخول
              </button>
              <button onClick={handleEmailSignUp} disabled={disabledEmail} style={secondaryBtn}>
                إنشاء حساب
              </button>
            </div>
          </section>
        ) : (
          <section style={{ display: "grid", gap: 10 }}>
            <label style={labelStyle}>
              Phone (E.164)
              <input
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+2010xxxxxxxx"
                autoComplete="tel"
                style={inputStyle}
                disabled={loading}
              />
              <small style={{ opacity: 0.75 }}>
                لازم SMS Provider يتفعل في Supabase علشان OTP يوصلك.
              </small>
            </label>

            {!otpSent ? (
              <button
                onClick={handleSendOtp}
                disabled={loading || phone.trim().length < 8}
                style={primaryBtn}
              >
                Send OTP
              </button>
            ) : (
              <>
                <label style={labelStyle}>
                  OTP Code
                  <input
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    placeholder="123456"
                    style={inputStyle}
                    disabled={loading}
                  />
                </label>

                <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                  <button onClick={handleVerifyOtp} disabled={disabledPhone} style={primaryBtn}>
                    Verify
                  </button>
                  <button
                    onClick={() => {
                      resetMessages();
                      setOtpSent(false);
                      setOtp("");
                      setInfo("OK. ابعت OTP تاني.");
                    }}
                    disabled={loading}
                    style={secondaryBtn}
                  >
                    Resend / Reset
                  </button>
                </div>
              </>
            )}
          </section>
        )}

        {(info || error) && (
          <div style={{ marginTop: 16 }}>
            {info ? <div style={infoBox}>{info}</div> : null}
            {error ? <div style={errorBox}>{error}</div> : null}
          </div>
        )}

        <footer style={{ marginTop: 18, opacity: 0.75, fontSize: 12 }}>
          <div>
            المسار اللي هتروحه بعد النجاح: <code>{nextPath}</code>
          </div>
        </footer>

        {/* احتياطي: لو أنت محتاج ترجع Router لأي سبب */}
        <div style={{ marginTop: 10, opacity: 0.55, fontSize: 12 }}>
          (Router موجود كاحتياط، لكن التحويل الأساسي Reload كامل)
        </div>
      </div>
    </main>
  );
}

// Styles
const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "10px 12px",
  borderRadius: 10,
  border: "1px solid rgba(255,255,255,0.14)",
  outline: "none",
  background: "rgba(0,0,0,0.35)",
  color: "#fff",
  marginTop: 6,
};

const labelStyle: React.CSSProperties = {
  display: "grid",
  gap: 6,
  fontSize: 14,
};

const primaryBtn: React.CSSProperties = {
  padding: "10px 14px",
  borderRadius: 10,
  border: "1px solid rgba(255,255,255,0.18)",
  background: "#ffffff",
  color: "#0b0b0b",
  cursor: "pointer",
  fontWeight: 700,
};

const secondaryBtn: React.CSSProperties = {
  padding: "10px 14px",
  borderRadius: 10,
  border: "1px solid rgba(255,255,255,0.18)",
  background: "transparent",
  color: "#fff",
  cursor: "pointer",
  fontWeight: 700,
};

const dangerBtn: React.CSSProperties = {
  padding: "10px 14px",
  borderRadius: 10,
  border: "1px solid rgba(255,80,80,0.35)",
  background: "rgba(255,80,80,0.12)",
  color: "#fff",
  cursor: "pointer",
  fontWeight: 700,
};

const infoBox: React.CSSProperties = {
  border: "1px solid rgba(0,255,140,0.25)",
  background: "rgba(0,255,140,0.08)",
  padding: 12,
  borderRadius: 12,
};

const errorBox: React.CSSProperties = {
  border: "1px solid rgba(255,80,80,0.35)",
  background: "rgba(255,80,80,0.12)",
  padding: 12,
  borderRadius: 12,
  marginTop: 10,
};

function tabStyle(active: boolean): React.CSSProperties {
  return {
    padding: "10px 12px",
    borderRadius: 10,
    border: "1px solid rgba(255,255,255,0.18)",
    background: active ? "rgba(255,255,255,0.14)" : "transparent",
    color: "#fff",
    cursor: "pointer",
    fontWeight: 700,
    flex: 1,
  };
}
