import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { DeveloperSupplyForm } from "@/components/supply/DeveloperSupplyForm";
import { createT } from "@/lib/i18n";
import { getServerLocale } from "@/lib/i18n.server";

export default async function SupplyDeveloperPage() {
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

  const inventoryOptions = [
    { value: "مشروع كامل", label: t("supply.developer.inventory.full") },
    { value: "وحدات متفرقة", label: t("supply.developer.inventory.units") },
    { value: "مرحلة", label: t("supply.developer.inventory.phase") },
  ];

  const labels = {
    title: t("supply.developer.title"),
    subtitle: t("supply.developer.subtitle"),
    companyName: t("supply.developer.form.company_name"),
    contactPerson: t("supply.developer.form.contact_person_name"),
    roleTitle: t("supply.developer.form.role_title"),
    phone: t("supply.developer.form.phone"),
    email: t("supply.developer.form.email"),
    contactMethod: t("supply.developer.form.contact_method"),
    preferredTime: t("supply.developer.form.preferred_time"),
    preferredDay: t("supply.developer.form.preferred_day"),
    preferredNotes: t("supply.developer.form.preferred_contact_notes"),
    contactReason: t("supply.developer.form.contact_reason"),
    city: t("supply.developer.form.city"),
    projectsSummary: t("supply.developer.form.projects_summary"),
    inventoryType: t("supply.developer.form.inventory_type"),
    unitCount: t("supply.developer.form.unit_count_estimate"),
    brochureUrl: t("supply.developer.form.brochure_url"),
    attachments: t("supply.developer.form.attachments"),
    cooperationTerms: t("supply.developer.form.cooperation_terms_interest"),
    submit: t("supply.developer.form.submit"),
    submitting: t("supply.developer.form.submitting"),
    successTitle: t("supply.developer.success.title"),
    successBody: t("supply.developer.success.body"),
    successId: t("supply.success.id"),
    whatsappCta: t("supply.success.whatsapp"),
    backToSupply: t("supply.success.back"),
    error: t("supply.error"),
  };

  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--text)]">
      <SiteHeader />
      <main className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
        <DeveloperSupplyForm
          labels={labels}
          contactMethods={contactMethods}
          contactTimes={contactTimes}
          inventoryOptions={inventoryOptions}
        />
      </main>
      <SiteFooter />
    </div>
  );
}
