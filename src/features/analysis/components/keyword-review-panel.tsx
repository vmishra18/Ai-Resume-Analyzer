"use client";

import { startTransition, useState } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

interface KeywordReviewPanelProps {
  sessionId: string;
  mustHaveKeywordsText: string;
  supportingKeywordsText: string;
  extractedKeywordCount: number;
  filteredOutPhrases: string[];
  currentOverallScore?: number | null;
  currentScoreBreakdown?: Array<{
    label: string;
    value: number;
  }>;
  redirectToOnSuccess?: string | null;
}

export function KeywordReviewPanel({
  sessionId,
  mustHaveKeywordsText,
  supportingKeywordsText,
  extractedKeywordCount,
  filteredOutPhrases,
  currentOverallScore = null,
  currentScoreBreakdown = [],
  redirectToOnSuccess = null
}: KeywordReviewPanelProps) {
  const router = useRouter();
  const [mustHaveValue, setMustHaveValue] = useState(mustHaveKeywordsText);
  const [supportingValue, setSupportingValue] = useState(supportingKeywordsText);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [scoreDiff, setScoreDiff] = useState<{
    before: {
      overallScore: number | null;
      scoreBreakdown: Array<{ label: string; value: number }>;
    };
    after: {
      overallScore: number | null;
      scoreBreakdown: Array<{ label: string; value: number }>;
    };
  } | null>(null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSuccessMessage(null);
    setIsSaving(true);

    try {
      const response = await fetch(`/api/analyses/${sessionId}/score-inputs`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          mustHaveKeywordsText: mustHaveValue,
          supportingKeywordsText: supportingValue
        })
      });

      const payload = (await response.json().catch(() => null)) as
        | {
            message?: string;
            before?: {
              overallScore: number | null;
              scoreBreakdown: Array<{ label: string; value: number }>;
            };
            after?: {
              overallScore: number | null;
              scoreBreakdown: Array<{ label: string; value: number }>;
            };
          }
        | null;

      if (!response.ok) {
        throw new Error(payload?.message ?? "We couldn't rerun the score right now.");
      }

      if (payload?.before && payload?.after) {
        setScoreDiff({
          before: payload.before,
          after: payload.after
        });
      }

      setSuccessMessage(
        redirectToOnSuccess
          ? "Keywords reviewed. Opening the full analysis now."
          : "Scoring inputs updated. Refreshing the report now."
      );

      startTransition(() => {
        if (redirectToOnSuccess) {
          router.push(redirectToOnSuccess);
          return;
        }

        router.refresh();
      });
    } catch (submissionError) {
      setError(
        submissionError instanceof Error ? submissionError.message : "We couldn't rerun the score right now."
      );
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <form className="space-y-5" onSubmit={handleSubmit}>
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="rounded-[14px] border border-[var(--border-soft)] bg-[var(--surface-1)] px-4 py-4">
          <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-[var(--muted-foreground)]">
            Extracted keywords
          </p>
          <p className="mt-2 text-2xl font-semibold text-[var(--foreground)]">{extractedKeywordCount}</p>
        </div>
        <div className="rounded-[14px] border border-[var(--border-soft)] bg-[var(--surface-1)] px-4 py-4">
          <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-[var(--muted-foreground)]">
            Filtered phrases
          </p>
          <p className="mt-2 text-2xl font-semibold text-[var(--foreground)]">{filteredOutPhrases.length}</p>
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <div>
          <label className="mb-3 block text-sm font-medium text-[var(--foreground)]" htmlFor="must-have-keywords">
            Must-have keywords
          </label>
          <Textarea
            id="must-have-keywords"
            value={mustHaveValue}
            onChange={(event) => setMustHaveValue(event.target.value)}
            placeholder="React&#10;TypeScript&#10;AWS"
            className="min-h-[220px]"
          />
          <p className="mt-3 text-sm leading-7 text-[var(--muted-foreground)]">
            One keyword per line. Keep this list tight and reserve it for skills that are genuinely required.
          </p>
        </div>

        <div>
          <label className="mb-3 block text-sm font-medium text-[var(--foreground)]" htmlFor="supporting-keywords">
            Supporting keywords
          </label>
          <Textarea
            id="supporting-keywords"
            value={supportingValue}
            onChange={(event) => setSupportingValue(event.target.value)}
            placeholder="GraphQL&#10;Design systems&#10;Accessibility"
            className="min-h-[220px]"
          />
          <p className="mt-3 text-sm leading-7 text-[var(--muted-foreground)]">
            Use this for nice-to-have skills, domain language, and terms you still want counted in the score.
          </p>
        </div>
      </div>

      {filteredOutPhrases.length > 0 ? (
        <div className="rounded-[14px] border border-[var(--border-soft)] bg-[var(--surface-1)] p-4">
          <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-[var(--muted-foreground)]">
            Filtered from the job description
          </p>
          <p className="mt-3 text-sm leading-7 text-[var(--muted-foreground)]">
            These phrases were ignored during extraction because they looked like noise or benefits copy.
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            {filteredOutPhrases.slice(0, 12).map((phrase) => (
              <span
                key={phrase}
                className="rounded-full border border-[var(--border-soft)] bg-[var(--surface-2)] px-3 py-1 text-xs text-[var(--muted-foreground)]"
              >
                {phrase}
              </span>
            ))}
          </div>
        </div>
      ) : null}

      {scoreDiff ? (
        <div className="rounded-[14px] border border-[var(--tone-info-border)] bg-[var(--tone-info-bg)] p-4">
          <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-[var(--tone-info-foreground)]">
            Before / after rerun
          </p>
          <div className="mt-4 grid gap-4 lg:grid-cols-2">
            {[
              {
                label: "Before",
                data: scoreDiff.before
              },
              {
                label: "After",
                data: scoreDiff.after
              }
            ].map((entry) => (
              <div key={entry.label} className="rounded-[12px] border border-[var(--border-soft)] bg-[var(--surface-1)] p-4">
                <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-[var(--muted-foreground)]">
                  {entry.label}
                </p>
                <p className="mt-2 text-4xl font-semibold text-[var(--foreground)]">
                  {entry.data.overallScore ?? "--"}
                </p>
                <div className="mt-4 space-y-2">
                  {entry.data.scoreBreakdown.map((item) => (
                    <div key={`${entry.label}-${item.label}`} className="flex items-center justify-between gap-4 text-sm">
                      <span className="text-[var(--muted-foreground)]">{item.label}</span>
                      <span className="font-semibold text-[var(--foreground)]">{item.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : null}

      {!scoreDiff && currentOverallScore !== null ? (
        <div className="rounded-[14px] border border-[var(--border-soft)] bg-[var(--surface-1)] p-4">
          <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-[var(--muted-foreground)]">Current score</p>
          <p className="mt-2 text-4xl font-semibold text-[var(--foreground)]">{currentOverallScore}</p>
          {currentScoreBreakdown.length > 0 ? (
            <div className="mt-4 grid gap-2 sm:grid-cols-2">
              {currentScoreBreakdown.map((item) => (
                <div key={item.label} className="flex items-center justify-between gap-4 rounded-[12px] border border-[var(--border-soft)] bg-[var(--surface-2)] px-3 py-2 text-sm">
                  <span className="text-[var(--muted-foreground)]">{item.label}</span>
                  <span className="font-semibold text-[var(--foreground)]">{item.value}</span>
                </div>
              ))}
            </div>
          ) : null}
        </div>
      ) : null}

      {error ? (
        <div className="rounded-[14px] border border-[var(--tone-danger-border)] bg-[var(--tone-danger-bg)] px-4 py-3 text-sm text-[var(--tone-danger-foreground)]">
          {error}
        </div>
      ) : null}

      {successMessage ? (
        <div className="rounded-[14px] border border-[var(--tone-success-border)] bg-[var(--tone-success-bg)] px-4 py-3 text-sm text-[var(--tone-success-foreground)]">
          {successMessage}
        </div>
      ) : null}

      <div className="flex flex-col gap-3 sm:flex-row">
        <Button type="submit" disabled={isSaving}>
          {isSaving ? "Rerunning score" : "Rerun score with reviewed keywords"}
        </Button>
        <Button
          type="button"
          variant="secondary"
          disabled={isSaving}
          onClick={() => {
            setMustHaveValue(mustHaveKeywordsText);
            setSupportingValue(supportingKeywordsText);
            setError(null);
            setSuccessMessage(null);
            setScoreDiff(null);
          }}
        >
          Reset changes
        </Button>
      </div>
    </form>
  );
}
