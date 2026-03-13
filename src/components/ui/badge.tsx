import type { HTMLAttributes } from "react";

import { cn } from "@/lib/utils";

export function Badge({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "inline-flex items-center rounded-full border border-[var(--border-soft)] bg-[var(--surface-2)] px-3 py-1 text-xs font-medium tracking-[0.18em] text-[var(--muted-foreground)] uppercase backdrop-blur",
        className
      )}
      {...props}
    />
  );
}
