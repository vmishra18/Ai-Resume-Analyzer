import { redirect } from "next/navigation";

import { ComparisonDashboard } from "@/features/analysis/components/comparison-dashboard";
import { buildAnalysisDashboardData } from "@/features/analysis/server/get-analysis-session";
import { requireCurrentUser } from "@/features/auth/server/session";
import { ComparisonPicker } from "@/features/history/components/comparison-picker";
import { Card } from "@/components/ui/card";
import { db } from "@/lib/db";

interface ComparePageProps {
  searchParams: Promise<{
    left?: string;
    right?: string;
  }>;
}

export default async function ComparePage({ searchParams }: ComparePageProps) {
  const user = await requireCurrentUser();
  const { left, right } = await searchParams;
  const sessions = await db.analysisSession.findMany({
    where: {
      userId: user.id
    },
    include: {
      uploadedFile: true,
      parsedResume: true,
      jobDescription: true,
      scoringSummary: true,
      keywordResults: true,
      suggestions: true
    },
    orderBy: {
      createdAt: "desc"
    }
  });

  if (sessions.length === 0) {
    redirect("/upload");
  }

  const leftSession = sessions.find((session) => session.id === left) ?? sessions[0];
  const rightSession = sessions.find((session) => session.id === right) ?? sessions[1] ?? sessions[0];

  return (
    <>
      <section className="px-6 pt-16 lg:px-8 lg:pt-20">
        <div className="mx-auto max-w-7xl">
          <ComparisonPicker
            sessions={sessions.map((session) => ({
              id: session.id,
              title: session.title,
              overallScore: session.overallScore
            }))}
            initialLeftId={leftSession.id}
            initialRightId={rightSession.id}
          />
        </div>
      </section>

      {leftSession.id === rightSession.id ? (
        <section className="px-6 py-8 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <Card>
              <p className="text-sm leading-7 text-[var(--muted-foreground)]">
                Pick two different analyses to open the side-by-side comparison view.
              </p>
            </Card>
          </div>
        </section>
      ) : (
        <ComparisonDashboard
          left={(() => {
            const data = buildAnalysisDashboardData(leftSession);

            return {
              id: leftSession.id,
              title: data.sessionTitle,
              overallScore: data.overallScore,
              createdAt: data.createdAt,
              roleTitle: data.roleMeta?.title ?? null,
              keywordCoverage: data.scoreSummary?.keywordCoverage ?? null,
              mustHaveCoverage: data.scoreSummary?.mustHaveCoverage ?? null,
              readabilityScore: data.scoreSummary?.readabilityScore ?? null,
              bulletQualityScore: data.scoreSummary?.bulletQualityScore ?? null,
              matchedKeywords: data.matchedKeywords.map((item) => item.label),
              missingKeywords: data.missingKeywords.map((item) => item.label),
              suggestions: data.suggestions
            };
          })()}
          right={(() => {
            const data = buildAnalysisDashboardData(rightSession);

            return {
              id: rightSession.id,
              title: data.sessionTitle,
              overallScore: data.overallScore,
              createdAt: data.createdAt,
              roleTitle: data.roleMeta?.title ?? null,
              keywordCoverage: data.scoreSummary?.keywordCoverage ?? null,
              mustHaveCoverage: data.scoreSummary?.mustHaveCoverage ?? null,
              readabilityScore: data.scoreSummary?.readabilityScore ?? null,
              bulletQualityScore: data.scoreSummary?.bulletQualityScore ?? null,
              matchedKeywords: data.matchedKeywords.map((item) => item.label),
              missingKeywords: data.missingKeywords.map((item) => item.label),
              suggestions: data.suggestions
            };
          })()}
        />
      )}
    </>
  );
}
