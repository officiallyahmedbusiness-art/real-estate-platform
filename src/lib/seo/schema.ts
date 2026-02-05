type FaqItem = { question: string; answer: string };

export function buildLocalBusinessJsonLd({
  name,
  url,
  address,
  locale,
}: {
  name: string;
  url: string | null;
  address?: string | null;
  locale: "ar" | "en";
}) {
  const normalizedAddress = address?.trim();
  return {
    "@context": "https://schema.org",
    "@type": ["LocalBusiness", "RealEstateAgent"],
    name,
    url: url ?? undefined,
    areaServed: locale === "ar" ? "مصر" : "Egypt",
    address: normalizedAddress
      ? {
          "@type": "PostalAddress",
          streetAddress: normalizedAddress,
          addressCountry: "EG",
        }
      : undefined,
  };
}

export function buildFaqJsonLd(items: FaqItem[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
  };
}

export function buildBreadcrumbJsonLd({
  baseUrl,
  items,
}: {
  baseUrl: string | null;
  items: Array<{ name: string; path: string }>;
}) {
  const normalizedBase = baseUrl ?? "";
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: `${normalizedBase}${item.path}`,
    })),
  };
}
