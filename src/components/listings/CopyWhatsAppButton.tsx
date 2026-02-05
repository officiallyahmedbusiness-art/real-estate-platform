"use client";

import { useState } from "react";
import { Button } from "@/components/ui";
import { useToast } from "@/components/Toast";

export function CopyWhatsAppButton({
  message,
  labels,
}: {
  message: string;
  labels: { copy: string; success: string; error: string; hint?: string };
}) {
  const { push } = useToast();
  const [copying, setCopying] = useState(false);

  async function handleCopy() {
    if (!message) return;
    setCopying(true);
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(message);
      } else {
        const textarea = document.createElement("textarea");
        textarea.value = message;
        textarea.setAttribute("readonly", "true");
        textarea.style.position = "absolute";
        textarea.style.left = "-9999px";
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand("copy");
        document.body.removeChild(textarea);
      }
      push(labels.success);
    } catch {
      push(labels.error);
    } finally {
      setCopying(false);
    }
  }

  return (
    <div className="space-y-2">
      <Button
        type="button"
        size="sm"
        variant="secondary"
        onClick={handleCopy}
        disabled={copying}
      >
        {labels.copy}
      </Button>
      {labels.hint ? <p className="text-xs text-[var(--muted)]">{labels.hint}</p> : null}
    </div>
  );
}
