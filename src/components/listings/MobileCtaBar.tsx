"use client";

import { Button } from "@/components/ui";
import { track, buildListingAnalyticsPayload } from "@/lib/analytics";

export function MobileCtaBar({
  listing,
  whatsappLink,
  callLink,
  labels,
}: {
  listing: { id: string; price?: number | null; area?: string | null; city?: string | null; size_m2?: number | null };
  whatsappLink?: string | null;
  callLink?: string | null;
  labels: { whatsapp: string; call: string; book: string };
}) {
  return (
    <div className="mobile-cta md:hidden">
      {whatsappLink ? (
        <a
          href={whatsappLink}
          target="_blank"
          rel="noreferrer"
          onClick={() => track("whatsapp_click", buildListingAnalyticsPayload(listing))}
        >
          <Button size="sm">{labels.whatsapp}</Button>
        </a>
      ) : null}
      {callLink ? (
        <a
          href={callLink}
          onClick={() => track("call_click", buildListingAnalyticsPayload(listing))}
        >
          <Button size="sm" variant="secondary">
            {labels.call}
          </Button>
        </a>
      ) : null}
      <a href="#lead-form">
        <Button size="sm" variant="ghost">
          {labels.book}
        </Button>
      </a>
    </div>
  );
}
