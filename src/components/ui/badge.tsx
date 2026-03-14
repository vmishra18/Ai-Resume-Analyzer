import type { HTMLAttributes } from "react";

import { cn } from "@/lib/utils";

export function Badge({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "inline-flex items-center rounded-[999px] border border-[var(--border-soft)] bg-[var(--surface-2)] px-3 py-1.5 text-[11px] font-semibold tracking-[0.18em] text-[var(--muted-foreground)] uppercase",
        className
      )}
      {...props}
    />
  );
}
