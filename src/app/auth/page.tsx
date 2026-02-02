import { Suspense } from "react";
import AuthClient from "./AuthClient";
import { createT } from "@/lib/i18n";
import { getServerLocale } from "@/lib/i18n.server";

export default async function AuthPage() {
  const locale = await getServerLocale();
  const t = createT(locale);

  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-[var(--bg)] text-[var(--text)]">
          {t("auth.loading")}
        </div>
      }
    >
      <AuthClient />
    </Suspense>
  );
}
