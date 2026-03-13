import type { HTMLAttributes } from "react";

import { cn } from "@/lib/utils";

export function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "rounded-[28px] border border-[var(--border-soft)] bg-[linear-gradient(180deg,var(--card-gradient-start),var(--card-gradient-end))] p-6 shadow-[0_20px_60px_var(--card-shadow)] backdrop-blur-xl",
        className
      )}
      {...props}
    />
  );
}
