import Link from "next/link";
import { ArrowRight, BriefcaseBusiness, Clock3, FileText, Target } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

interface SessionHistoryCardProps {
  id: string;
  title: string;
  status: string;
  overallScore: number | null;
  createdAt: string;
  fileName: string | null;
  roleTitle: string | null;
  keywordCount: number;
}

function getStatusTone(status: string) {
  switch (status) {
    case "COMPLETED":
      return "border-[var(--tone-success-border)] bg-[var(--tone-success-bg)] text-[var(--tone-success-foreground)]";
    case "FAILED":
      return "border-[var(--tone-danger-border)] bg-[var(--tone-danger-bg)] text-[var(--tone-danger-foreground)]";
    case "PROCESSING":
      return "border-[var(--tone-info-border)] bg-[var(--tone-info-bg)] text-[var(--tone-info-foreground)]";
    default:
      return "border-[var(--border-soft)] bg-[var(--surface-2)] text-[var(--foreground)]";
  }
}

export function SessionHistoryCard({
  id,
  title,
  status,
  overallScore,
  createdAt,
  fileName,
  roleTitle,
  keywordCount
}: SessionHistoryCardProps) {
  return (
    <Card className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_320px]">
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-3">
          <span className={`rounded-full border px-3 py-1 text-xs uppercase tracking-[0.14em] ${getStatusTone(status)}`}>
            {status}
          </span>
          <p className="text-sm text-[var(--muted-foreground)]">{createdAt}</p>
        </div>

        <h2 className="mt-4 font-heading text-4xl font-semibold text-[var(--foreground)] [overflow-wrap:anywhere]">
          {title}
        </h2>

        <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)_120px]">
          <div className="min-w-0 border-t border-[var(--border-soft)] pt-4">
            <div className="flex items-center gap-2 text-[var(--muted-foreground)]">
              <FileText className="size-4" />
              <p className="text-xs uppercase tracking-[0.18em]">Resume</p>
            </div>
            <p className="mt-3 text-sm font-medium text-[var(--foreground)] [overflow-wrap:anywhere]">
              {fileName ?? "Unknown file"}
            </p>
          </div>
          <div className="min-w-0 border-t border-[var(--border-soft)] pt-4">
            <div className="flex items-center gap-2 text-[var(--muted-foreground)]">
              <BriefcaseBusiness className="size-4" />
              <p className="text-xs uppercase tracking-[0.18em]">Target role</p>
            </div>
            <p className="mt-3 text-sm font-medium text-[var(--foreground)] [overflow-wrap:anywhere]">
              {roleTitle ?? "Not detected"}
            </p>
          </div>
          <div className="min-w-0 border-t border-[var(--border-soft)] pt-4">
            <div className="flex items-center gap-2 text-[var(--muted-foreground)]">
              <Target className="size-4" />
              <p className="text-xs uppercase tracking-[0.18em]">JD keywords</p>
            </div>
            <p className="mt-3 text-sm font-medium text-[var(--foreground)]">{keywordCount}</p>
          </div>
        </div>
      </div>

      <div className="flex flex-col justify-between border-t border-[var(--border-soft)] pt-5 lg:border-l lg:border-t-0 lg:pl-6 lg:pt-0">
        <div>
          <div className="flex items-center gap-2 text-[var(--muted-foreground)]">
            <Clock3 className="size-4" />
            <p className="text-xs uppercase tracking-[0.18em]">Match score</p>
          </div>
          <p className="mt-4 font-heading text-7xl leading-none text-[var(--foreground)]">{overallScore ?? "--"}</p>
          <p className="mt-2 text-sm text-[var(--muted-foreground)]">
            {overallScore !== null ? "Ready to review" : "Waiting for full analysis"}
          </p>
        </div>

        <div className="mt-6 grid gap-3">
          <Button asChild className="w-full">
            <Link href={`/analyses/${id}`}>
              Open dashboard
              <ArrowRight className="size-4" />
            </Link>
          </Button>
        </div>
      </div>
    </Card>
  );
}
