import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ScoreBreakdownChart } from "@/features/analysis/components/score-breakdown-chart";
import { HistoryEmptyState } from "@/features/history/components/history-empty-state";
import { HistorySummary } from "@/features/history/components/history-summary";
import { SessionHistoryCard } from "@/features/history/components/session-history-card";
import { buildTrendData, formatHistoryDate, summarizeHistory } from "@/features/history/lib/history-mappers";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function AnalysesPage() {
  const sessions = await db.analysisSession.findMany({
    include: {
      uploadedFile: true,
      jobDescription: true
    },
    orderBy: {
      createdAt: "desc"
    }
  });

  if (sessions.length === 0) {
    return (
      <section className="px-6 py-20 lg:px-8">
        <div className="mx-auto max-w-5xl">
          <HistoryEmptyState />
        </div>
      </section>
    );
  }

  const historySummary = summarizeHistory(sessions);
  const trendData = buildTrendData(sessions);

  return (
    <section className="px-6 py-16 lg:px-8 lg:py-20">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[var(--color-brand-300)]">
              Analysis history
            </p>
            <h1 className="mt-4 font-heading text-4xl text-white sm:text-5xl">
              Revisit resume analyses, compare progress, and track score trends.
            </h1>
            <p className="mt-5 max-w-3xl text-base leading-8 text-[var(--muted-foreground)]">
              This page turns saved sessions into a useful product surface: recent ATS results, historical trend context,
              and fast navigation back to any full dashboard.
            </p>
          </div>

          <Button asChild size="lg">
            <Link href="/upload">Create new analysis</Link>
          </Button>
        </div>

        <div className="mt-8">
          <HistorySummary {...historySummary} />
        </div>

        <div className="mt-6 grid gap-6 xl:grid-cols-[0.8fr_1.2fr]">
          <Card>
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[var(--color-brand-300)]">
              Recent trend
            </p>
            <h2 className="mt-4 text-2xl font-semibold text-white">Latest score movement</h2>
            <p className="mt-3 text-sm leading-7 text-[var(--muted-foreground)]">
              Compare recent completed analyses and see whether resume revisions are improving your fit over time.
            </p>
            <div className="mt-6">
              {trendData.length > 0 ? (
                <ScoreBreakdownChart data={trendData} />
              ) : (
                <p className="text-sm text-[var(--muted-foreground)]">
                  Complete more scored analyses to unlock historical trend visualization.
                </p>
              )}
            </div>
          </Card>

          <Card>
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[var(--color-brand-300)]">
              Workspace snapshot
            </p>
            <h2 className="mt-4 text-2xl font-semibold text-white">What this history view tells you</h2>
            <div className="mt-5 space-y-3">
              {[
                "Which resume version is currently scoring best against target roles.",
                "Whether your recent edits are improving ATS alignment or creating regressions.",
                "Which sessions failed parsing and may need a cleaner source file.",
                "How many JD keywords each saved analysis captured for future comparison work."
              ].map((item) => (
                <div key={item} className="rounded-2xl border border-white/8 bg-white/4 px-4 py-3">
                  <p className="text-sm leading-7 text-[var(--muted-foreground)]">{item}</p>
                </div>
              ))}
            </div>
          </Card>
        </div>

        <div className="mt-6 space-y-5">
          {sessions.map((session) => {
            const extractedKeywordCount = Array.isArray(session.jobDescription?.extractedKeywords)
              ? session.jobDescription.extractedKeywords.length
              : 0;

            return (
              <SessionHistoryCard
                key={session.id}
                id={session.id}
                title={session.title}
                status={session.status}
                overallScore={session.overallScore}
                createdAt={formatHistoryDate(session.createdAt)}
                fileName={session.uploadedFile?.originalName ?? null}
                roleTitle={session.jobDescription?.title ?? null}
                keywordCount={extractedKeywordCount}
              />
            );
          })}
        </div>
      </div>
    </section>
  );
}
