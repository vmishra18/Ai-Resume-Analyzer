import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { KeywordReviewPanel } from "@/features/analysis/components/keyword-review-panel";
import { requireCurrentUser } from "@/features/auth/server/session";
import { buildAnalysisDashboardData, getAnalysisSessionOrNull } from "@/features/analysis/server/get-analysis-session";

interface AnalysisReviewPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function AnalysisReviewPage({ params }: AnalysisReviewPageProps) {
  const { id } = await params;
  const user = await requireCurrentUser();
  const session = await getAnalysisSessionOrNull(id, user.id);

  if (!session) {
    notFound();
  }

  const data = buildAnalysisDashboardData(session);

  if (!data.keywordReview || !data.parsedResume) {
    redirect(`/analyses/${id}`);
  }

  return (
    <section className="px-6 py-16 lg:px-8 lg:py-20">
      <div className="mx-auto max-w-7xl space-y-6">
        <Card className="overflow-hidden">
          <div className="grid gap-8 xl:grid-cols-[1.05fr_0.95fr]">
            <div>
              <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-[var(--color-brand-300)]">
                Review step
              </p>
              <h1 className="mt-4 font-heading text-4xl font-semibold text-[var(--foreground)] sm:text-5xl">
                Review the scoring inputs before the first result is created
              </h1>
              <p className="mt-5 max-w-3xl text-base leading-8 text-[var(--muted-foreground)]">
                We already parsed the resume and extracted role keywords. Take a minute to tighten the must-have and
                supporting terms so the first score reflects the role more accurately.
              </p>

              <div className="mt-8 grid gap-4 sm:grid-cols-3">
                <div className="rounded-[16px] border border-[var(--border-soft)] bg-[var(--surface-1)] px-4 py-4">
                  <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-[var(--muted-foreground)]">
                    Session
                  </p>
                  <p className="mt-2 text-base font-semibold text-[var(--foreground)]">{data.sessionTitle}</p>
                </div>
                <div className="rounded-[16px] border border-[var(--border-soft)] bg-[var(--surface-1)] px-4 py-4">
                  <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-[var(--muted-foreground)]">
                    Parsed words
                  </p>
                  <p className="mt-2 text-base font-semibold text-[var(--foreground)]">{data.parsedResume.wordCount}</p>
                </div>
                <div className="rounded-[16px] border border-[var(--border-soft)] bg-[var(--surface-1)] px-4 py-4">
                  <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-[var(--muted-foreground)]">
                    Structure
                  </p>
                  <p className="mt-2 text-base font-semibold text-[var(--foreground)]">{data.parsedResume.structureScore}/100</p>
                </div>
              </div>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Button asChild variant="secondary">
                  <Link href={`/analyses/${id}`}>Back to analysis shell</Link>
                </Button>
                <Button asChild>
                  <Link href="/analyses">History</Link>
                </Button>
              </div>
            </div>

            <div className="rounded-[20px] border border-[var(--border-soft)] bg-[var(--surface-1)] p-6">
              <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-[var(--color-brand-300)]">
                Parsed resume snapshot
              </p>
              <p className="mt-4 text-sm leading-7 text-[var(--muted-foreground)]">
                Use this snapshot as a sanity check before running the first score.
              </p>
              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                {data.parsedResume.sections.map((item) => (
                  <div key={item.label} className="rounded-[14px] border border-[var(--border-soft)] bg-[var(--surface-2)] px-4 py-4">
                    <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-[var(--muted-foreground)]">
                      {item.label}
                    </p>
                    <p className="mt-2 text-sm font-semibold text-[var(--foreground)]">
                      {item.value ? "Detected" : "Missing"}
                    </p>
                  </div>
                ))}
              </div>
              <details className="mt-5 rounded-[14px] border border-[var(--border-soft)] bg-[var(--surface-2)] p-4">
                <summary className="cursor-pointer text-sm font-semibold text-[var(--foreground)]">
                  Normalized resume preview
                </summary>
                <p className="mt-4 whitespace-pre-wrap text-sm leading-7 text-[var(--foreground)]">
                  {data.parsedResume.normalizedPreview}
                </p>
              </details>
            </div>
          </div>
        </Card>

        <Card>
          <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-[var(--color-brand-300)]">
            Score setup
          </p>
          <h2 className="mt-4 text-2xl font-semibold text-[var(--foreground)]">Confirm the job-description signals</h2>
          <p className="mt-3 max-w-3xl text-sm leading-7 text-[var(--muted-foreground)]">
            Once this looks right, run the first score and we&apos;ll take you straight to the finished report.
          </p>
          <div className="mt-6">
            <KeywordReviewPanel
              sessionId={data.sessionId}
              mustHaveKeywordsText={data.keywordReview.mustHaveKeywordsText}
              supportingKeywordsText={data.keywordReview.supportingKeywordsText}
              extractedKeywordCount={data.keywordReview.extractedKeywordCount}
              filteredOutPhrases={data.keywordReview.filteredOutPhrases}
              redirectToOnSuccess={`/analyses/${id}`}
            />
          </div>
        </Card>
      </div>
    </section>
  );
}
