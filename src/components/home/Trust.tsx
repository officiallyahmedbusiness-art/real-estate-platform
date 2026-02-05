import { Card } from "@/components/ui";

export type TrustItem = { title: string; value: string };

export function Trust({ items }: { items: TrustItem[] }) {
  if (!items.length) return null;

  return (
    <div className="trust-strip">
      {items.map((item) => (
        <Card key={item.title} className="trust-card">
          <p className="trust-label">{item.title}</p>
          <p className="trust-value">{item.value}</p>
        </Card>
      ))}
    </div>
  );
}
