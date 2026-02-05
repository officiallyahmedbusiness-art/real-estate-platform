import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { CallbackForm } from "@/components/callback/CallbackForm";
import { createT } from "@/lib/i18n";
import { getServerLocale } from "@/lib/i18n.server";

export default async function CallbackPage() {
  const locale = await getServerLocale();
  const t = createT(locale);

  const contactMethods = [
    { value: "whatsapp", label: t("contact.method.whatsapp") },
    { value: "call", label: t("contact.method.call") },
    { value: "email", label: t("contact.method.email") },
  ];

  const contactTimes = [
    { value: "morning", label: t("home.request.contact.morning") },
    { value: "afternoon", label: t("home.request.contact.afternoon") },
    { value: "evening", label: t("home.request.contact.evening") },
    { value: "any", label: t("home.request.contact.any") },
  ];

  const labels = {
    title: t("callback.title"),
    subtitle: t("callback.subtitle"),
    name: t("callback.form.name"),
    phone: t("callback.form.phone"),
    contactMethod: t("callback.form.contact_method"),
    preferredTime: t("callback.form.preferred_time"),
    preferredDay: t("callback.form.preferred_day"),
    reason: t("callback.form.reason"),
    submit: t("callback.form.submit"),
    submitting: t("callback.form.submitting"),
    successTitle: t("callback.success.title"),
    successBody: t("callback.success.body"),
    successId: t("supply.success.id"),
    whatsappCta: t("supply.success.whatsapp"),
    backHome: t("callback.success.back"),
    error: t("callback.error"),
  };

  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--text)]">
      <SiteHeader />
      <main className="mx-auto w-full max-w-4xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
        <CallbackForm labels={labels} contactMethods={contactMethods} contactTimes={contactTimes} />
      </main>
      <SiteFooter />
    </div>
  );
}
