import { ArrowDownRight, ArrowUpRight, BarChart3, CheckCircle2, Flame, XCircle } from "lucide-react";

import { Card } from "@/components/ui/card";

interface HistorySummaryProps {
  totalSessions: number;
  completedSessions: number;
  averageScore: number | null;
  bestScore: number | null;
  failedCount: number;
  trendDelta: number | null;
}

export function HistorySummary({
  totalSessions,
  completedSessions,
  averageScore,
  bestScore,
  failedCount,
  trendDelta
}: HistorySummaryProps) {
  const trendUp = (trendDelta ?? 0) >= 0;

  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
      {[
        {
          label: "Total sessions",
          value: totalSessions,
          detail: "Saved analyses in the workspace",
          icon: BarChart3
        },
        {
          label: "Completed",
          value: completedSessions,
          detail: "Scored sessions ready to review",
          icon: CheckCircle2
        },
        {
          label: "Average score",
          value: averageScore ?? "--",
          detail: "Across completed analyses",
          icon: ArrowUpRight
        },
        {
          label: "Best score",
          value: bestScore ?? "--",
          detail: "Highest ATS result so far",
          icon: Flame
        },
        {
          label: "Failed",
          value: failedCount,
          detail:
            trendDelta === null
              ? "Need more completed history for trend"
              : `${trendUp ? "+" : ""}${trendDelta} vs previous completed batch`,
          icon: trendDelta === null ? XCircle : trendUp ? ArrowUpRight : ArrowDownRight
        }
      ].map((item) => {
        const Icon = item.icon;

        return (
          <Card key={item.label}>
            <div className="flex items-center gap-2 text-[var(--muted-foreground)]">
              <Icon className="size-4" />
              <p className="text-xs uppercase tracking-[0.18em]">{item.label}</p>
            </div>
            <p className="mt-4 font-heading text-4xl text-white">{item.value}</p>
            <p className="mt-2 text-sm leading-7 text-[var(--muted-foreground)]">{item.detail}</p>
          </Card>
        );
      })}
    </div>
  );
}
