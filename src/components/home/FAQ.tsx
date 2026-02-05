type FaqItem = {
  question: string;
  answer: string;
};

type FAQProps = {
  items: FaqItem[];
};

export function FAQ({ items }: FAQProps) {
  return (
    <div className="space-y-3">
      {items.map((item) => (
        <details
          key={item.question}
          className="rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)]/90 p-4"
        >
          <summary className="cursor-pointer text-sm font-semibold text-[var(--text)]">
            {item.question}
          </summary>
          <p className="mt-2 text-sm text-[var(--muted)]">{item.answer}</p>
        </details>
      ))}
    </div>
  );
}
