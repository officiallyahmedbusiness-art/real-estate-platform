import Link from "next/link";
import { Card } from "@/components/ui";

type TFn = (key: string, params?: Record<string, string | number>) => string;

type AreaItem = {
  key: string;
  href: string;
};

type AreasProps = {
  t: TFn;
  areas: AreaItem[];
};

export function Areas({ t, areas }: AreasProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {areas.map((area, index) => (
        <Link key={area.key} href={area.href} className="block">
          <Card
            className="group relative overflow-hidden border border-[var(--border)] bg-[var(--surface)]/95 p-4 hrtaj-card transition hover:-translate-y-1 hover:border-[var(--accent)]"
            style={{ animationDelay: `${index * 70}ms` }}
          >
            <div className="space-y-2">
              <p className="text-base font-semibold line-clamp-2">
                {t(`home.areas.${area.key}.title`)}
              </p>
              <p className="text-sm text-[var(--muted)] line-clamp-2">
                {t(`home.areas.${area.key}.subtitle`)}
              </p>
            </div>
            <span className="mt-3 inline-flex text-xs font-semibold text-[var(--accent)]">
              {t("home.areas.cta")}
            </span>
          </Card>
        </Link>
      ))}
    </div>
  );
}
