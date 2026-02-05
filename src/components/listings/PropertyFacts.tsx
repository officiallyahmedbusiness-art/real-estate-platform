export type PropertyFact = {
  label: string;
  value: string | number;
};

export function PropertyFacts({
  items,
  className = "",
}: {
  items: Array<PropertyFact | null | undefined>;
  className?: string;
}) {
  const visible = items.filter(
    (item): item is PropertyFact =>
      Boolean(item && item.value !== null && item.value !== undefined && item.value !== "")
  );

  if (!visible.length) return null;

  return (
    <div className={`property-facts ${className}`}>
      {visible.map((item) => (
        <div key={item.label} className="fact-item">
          <p className="fact-label">{item.label}</p>
          <p className="fact-value">{item.value}</p>
        </div>
      ))}
    </div>
  );
}
