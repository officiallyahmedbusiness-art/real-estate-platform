"use client";

import { useState } from "react";
import { Button, Card, Input, Select, Textarea } from "@/components/ui";

type ImportResult = {
  ok?: boolean;
  data?: {
    rows_total?: number;
    rows_inserted?: number;
    rows_updated?: number;
    rows_failed?: number;
    errors?: Array<{ row: number; field: string; message: string }>;
  };
  error?: string;
};

export function ImportClient({ labels, type }: { labels: Record<string, string>; type: string }) {
  const [result, setResult] = useState<ImportResult | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setResult(null);
    const form = event.currentTarget;
    const formData = new FormData(form);
    formData.set("type", type);

    const res = await fetch("/api/hrtaj-import", {
      method: "POST",
      body: formData,
    });
    const data = await res.json();
    setResult(data);
    setLoading(false);
  }

  return (
    <Card className="space-y-4">
      <form onSubmit={onSubmit} className="grid gap-3 md:grid-cols-2">
        <Input type="file" name="file" required />
        <Select name="format" defaultValue="">
          <option value="">{labels.format}</option>
          <option value="csv">CSV</option>
          <option value="xlsx">Excel</option>
        </Select>
        <Textarea
          name="notes"
          placeholder={labels.notes}
          className="md:col-span-2"
        />
        <Button type="submit" size="sm" disabled={loading}>
          {loading ? labels.loading : labels.submit}
        </Button>
      </form>

      {result ? (
        <div className="space-y-2 text-sm text-[var(--muted)]">
          {result.error ? (
            <p className="text-[var(--danger)]">{result.error}</p>
          ) : (
            <>
              <p>
                {labels.rowsTotal}: {result.data?.rows_total ?? "-"}
              </p>
              <p>
                {labels.rowsInserted}: {result.data?.rows_inserted ?? "-"}
              </p>
              <p>
                {labels.rowsUpdated}: {result.data?.rows_updated ?? "-"}
              </p>
              <p>
                {labels.rowsFailed}: {result.data?.rows_failed ?? "-"}
              </p>
              {result.data?.errors?.length ? (
                <div className="space-y-1">
                  {result.data.errors.slice(0, 5).map((err, idx) => (
                    <p key={idx}>
                      #{err.row} {err.field}: {err.message}
                    </p>
                  ))}
                </div>
              ) : null}
            </>
          )}
        </div>
      ) : null}
    </Card>
  );
}
