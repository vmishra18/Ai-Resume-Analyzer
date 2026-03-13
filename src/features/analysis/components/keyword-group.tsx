interface KeywordGroupProps {
  title: string;
  emptyMessage: string;
  items: Array<{
    id: string;
    label: string;
  }>;
  tone: "success" | "warning" | "danger" | "neutral";
  limit?: number;
}

const toneStyles = {
  success: "border-emerald-400/20 bg-emerald-400/10 text-emerald-100",
  warning: "border-amber-400/20 bg-amber-400/10 text-amber-100",
  danger: "border-rose-400/20 bg-rose-400/10 text-rose-100",
  neutral: "border-white/10 bg-white/6 text-white/84"
} as const;

export function KeywordGroup({
  title,
  emptyMessage,
  items,
  tone,
  limit = 12
}: KeywordGroupProps) {
  const visibleItems = items.slice(0, limit);

  return (
    <div>
      <p className="text-xs uppercase tracking-[0.18em] text-[var(--muted-foreground)]">{title}</p>
      <div className="mt-3 flex flex-wrap gap-2">
        {visibleItems.length > 0 ? (
          visibleItems.map((item) => (
            <span
              key={item.id}
              className={`rounded-full border px-3 py-1 text-sm ${toneStyles[tone]}`}
            >
              {item.label}
            </span>
          ))
        ) : (
          <p className="text-sm text-[var(--muted-foreground)]">{emptyMessage}</p>
        )}
      </div>
    </div>
  );
}
