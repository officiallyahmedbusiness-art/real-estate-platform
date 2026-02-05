import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { OwnerSupplyForm } from "@/components/supply/OwnerSupplyForm";
import { createT } from "@/lib/i18n";
import { getServerLocale } from "@/lib/i18n.server";

export default async function SupplyOwnerPage() {
  const locale = await getServerLocale();
  const t = createT(locale);

  const ownerTypes = [
    { value: "مالك", label: t("supply.owner.type.owner") },
    { value: "وسيط", label: t("supply.owner.type.broker") },
    { value: "مفوّض", label: t("supply.owner.type.authorized") },
  ];

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

  const propertyTypes = [
    { value: "شقة", label: t("propertyType.apartment") },
    { value: "فيلا", label: t("propertyType.villa") },
    { value: "دوبلكس", label: t("propertyType.duplex") },
    { value: "ستوديو", label: t("propertyType.studio") },
    { value: "محل", label: t("propertyType.shop") },
    { value: "إداري", label: t("propertyType.office") },
    { value: "أرض", label: t("propertyType.land") },
  ];

  const purposes = [
    { value: "بيع", label: t("supply.owner.purpose.sale") },
    { value: "إيجار", label: t("supply.owner.purpose.rent") },
  ];

  const readyOptions = [
    { value: "yes", label: t("supply.owner.ready.yes") },
    { value: "no", label: t("supply.owner.ready.no") },
  ];

  const labels = {
    title: t("supply.owner.title"),
    subtitle: t("supply.owner.subtitle"),
    ownerType: t("supply.owner.form.owner_type"),
    fullName: t("supply.owner.form.full_name"),
    phone: t("supply.owner.form.phone"),
    email: t("supply.owner.form.email"),
    contactMethod: t("supply.owner.form.contact_method"),
    preferredTime: t("supply.owner.form.preferred_time"),
    preferredDay: t("supply.owner.form.preferred_day"),
    contactReason: t("supply.owner.form.contact_reason"),
    propertyType: t("supply.owner.form.property_type"),
    purpose: t("supply.owner.form.purpose"),
    area: t("supply.owner.form.area"),
    addressNotes: t("supply.owner.form.address_notes"),
    sizeM2: t("supply.owner.form.size_m2"),
    rooms: t("supply.owner.form.rooms"),
    baths: t("supply.owner.form.baths"),
    priceExpectation: t("supply.owner.form.price_expectation"),
    readyToShow: t("supply.owner.form.ready_to_show"),
    photos: t("supply.owner.form.photos"),
    mediaLink: t("supply.owner.form.media_link"),
    notes: t("supply.owner.form.notes"),
    submit: t("supply.owner.form.submit"),
    submitting: t("supply.owner.form.submitting"),
    successTitle: t("supply.owner.success.title"),
    successBody: t("supply.owner.success.body"),
    successId: t("supply.success.id"),
    whatsappCta: t("supply.success.whatsapp"),
    backToSupply: t("supply.success.back"),
    error: t("supply.error"),
  };

  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--text)]">
      <SiteHeader />
      <main className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
        <OwnerSupplyForm
          labels={labels}
          ownerTypes={ownerTypes}
          contactMethods={contactMethods}
          contactTimes={contactTimes}
          propertyTypes={propertyTypes}
          purposes={purposes}
          readyOptions={readyOptions}
        />
      </main>
      <SiteFooter />
    </div>
  );
}
