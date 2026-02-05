"use client";

import { useState } from "react";
import { Button } from "@/components/ui";
import { track, type AnalyticsPayload } from "@/lib/analytics";

export function ShareButton({
  url,
  label,
  analytics,
}: {
  url: string;
  label: string;
  analytics?: AnalyticsPayload;
}) {
  const [copied, setCopied] = useState(false);

  const handleClick = async () => {
    if (typeof navigator === "undefined") return;
    try {
      if (navigator.share) {
        await navigator.share({ url });
      } else if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(url);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
      track("share_click", analytics ?? {});
    } catch {
      // ignore
    }
  };

  return (
    <Button size="sm" variant="ghost" type="button" onClick={handleClick} aria-label={label}>
      {copied ? "✓" : null}
      {label}
    </Button>
  );
}
