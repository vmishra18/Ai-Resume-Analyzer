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
      return "border-emerald-400/20 bg-emerald-400/10 text-emerald-100";
    case "FAILED":
      return "border-rose-400/20 bg-rose-400/10 text-rose-100";
    case "PROCESSING":
      return "border-sky-400/20 bg-sky-400/10 text-sky-100";
    default:
      return "border-white/10 bg-white/6 text-white/84";
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
    <Card className="grid gap-5 lg:grid-cols-[1.2fr_0.8fr]">
      <div>
        <div className="flex flex-wrap items-center gap-3">
          <span className={`rounded-full border px-3 py-1 text-xs uppercase tracking-[0.14em] ${getStatusTone(status)}`}>
            {status}
          </span>
          <p className="text-sm text-[var(--muted-foreground)]">{createdAt}</p>
        </div>

        <h2 className="mt-4 text-2xl font-semibold text-white">{title}</h2>

        <div className="mt-5 grid gap-3 sm:grid-cols-3">
          <div className="rounded-2xl border border-white/8 bg-white/4 p-4">
            <div className="flex items-center gap-2 text-[var(--muted-foreground)]">
              <FileText className="size-4" />
              <p className="text-xs uppercase tracking-[0.18em]">Resume</p>
            </div>
            <p className="mt-3 text-sm font-medium text-white">{fileName ?? "Unknown file"}</p>
          </div>
          <div className="rounded-2xl border border-white/8 bg-white/4 p-4">
            <div className="flex items-center gap-2 text-[var(--muted-foreground)]">
              <BriefcaseBusiness className="size-4" />
              <p className="text-xs uppercase tracking-[0.18em]">Target role</p>
            </div>
            <p className="mt-3 text-sm font-medium text-white">{roleTitle ?? "Not detected"}</p>
          </div>
          <div className="rounded-2xl border border-white/8 bg-white/4 p-4">
            <div className="flex items-center gap-2 text-[var(--muted-foreground)]">
              <Target className="size-4" />
              <p className="text-xs uppercase tracking-[0.18em]">JD keywords</p>
            </div>
            <p className="mt-3 text-sm font-medium text-white">{keywordCount}</p>
          </div>
        </div>
      </div>

      <div className="flex flex-col justify-between rounded-[28px] border border-white/8 bg-[rgba(5,7,12,0.45)] p-5">
        <div>
          <div className="flex items-center gap-2 text-[var(--muted-foreground)]">
            <Clock3 className="size-4" />
            <p className="text-xs uppercase tracking-[0.18em]">Match score</p>
          </div>
          <p className="mt-4 font-heading text-6xl text-white">{overallScore ?? "--"}</p>
          <p className="mt-2 text-sm text-[var(--muted-foreground)]">
            {overallScore !== null ? "Ready to review" : "Waiting for full analysis"}
          </p>
        </div>

        <div className="mt-6">
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
