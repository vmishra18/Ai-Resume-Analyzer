import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ScoreBreakdownChart } from "@/features/analysis/components/score-breakdown-chart";
import { requireCurrentUser } from "@/features/auth/server/session";
import { HistoryEmptyState } from "@/features/history/components/history-empty-state";
import { HistorySummary } from "@/features/history/components/history-summary";
import { SessionHistoryCard } from "@/features/history/components/session-history-card";
import { buildTrendData, formatHistoryDate, summarizeHistory } from "@/features/history/lib/history-mappers";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function AnalysesPage() {
  const user = await requireCurrentUser();
  const sessions = await db.analysisSession.findMany({
    where: {
      userId: user.id
    },
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
            <h1 className="mt-4 font-heading text-4xl text-[var(--foreground)] sm:text-5xl">
              Revisit past analyses and keep track of what is improving.
            </h1>
            <p className="mt-5 max-w-3xl text-base leading-8 text-[var(--muted-foreground)]">
              Use your saved analyses to reopen results, spot stronger revisions, and keep a cleaner record of the
              roles you have already checked.
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
            <h2 className="mt-4 text-2xl font-semibold text-[var(--foreground)]">Latest score movement</h2>
            <p className="mt-3 text-sm leading-7 text-[var(--muted-foreground)]">
              See whether your latest resume changes are improving the overall match.
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
              Useful at a glance
            </p>
            <h2 className="mt-4 text-2xl font-semibold text-[var(--foreground)]">What history helps you do</h2>
            <div className="mt-5 space-y-3">
              {[
                "See which resume changes improved the score.",
                "Reopen older analyses without starting from scratch.",
                "Spot failed uploads that may need a cleaner source file.",
                "Keep a clearer record of the roles you have already targeted."
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
