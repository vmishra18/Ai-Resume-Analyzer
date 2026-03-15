import type { HTMLAttributes } from "react";

import { cn } from "@/lib/utils";

export function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "rounded-[20px] border border-[var(--border-soft)] bg-[linear-gradient(180deg,var(--card-gradient-start),var(--card-gradient-end))] p-5 shadow-[0_10px_24px_var(--card-shadow)] backdrop-blur-[2px] sm:p-6",
        className
      )}
      {...props}
    />
  );
}
