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
  success: "border-[var(--tone-success-border)] bg-[var(--tone-success-bg)] text-[var(--tone-success-foreground)]",
  warning: "border-[var(--tone-warning-border)] bg-[var(--tone-warning-bg)] text-[var(--tone-warning-foreground)]",
  danger: "border-[var(--tone-danger-border)] bg-[var(--tone-danger-bg)] text-[var(--tone-danger-foreground)]",
  neutral: "border-[var(--border-soft)] bg-[var(--surface-2)] text-[var(--foreground)]"
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
              className={`rounded-[12px] border px-3 py-1.5 text-sm font-medium ${toneStyles[tone]}`}
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
