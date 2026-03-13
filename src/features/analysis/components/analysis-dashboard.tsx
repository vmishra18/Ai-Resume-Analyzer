import Link from "next/link";
import type { Route } from "next";
import { Activity, BriefcaseBusiness, CheckCircle2, CircleAlert, FileText, Sparkles, Target } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { KeywordGroup } from "@/features/analysis/components/keyword-group";
import { ScoreBreakdownChart } from "@/features/analysis/components/score-breakdown-chart";

export interface AnalysisDashboardProps {
  sessionTitle: string;
  status: string;
  createdAt: string;
  overallScore: number | null;
  scoreBreakdown: Array<{
    label: string;
    value: number;
  }>;
  scoreSummary: {
    keywordCoverage: number;
    mustHaveCoverage: number;
    matchedKeywords: number;
    partialKeywords: number;
    totalKeywords: number;
    bonusSignals: string[];
  } | null;
  roleMeta: {
    title: string | null;
    seniority: string | null;
    extractedKeywordCount: number;
  } | null;
  fileMeta: {
    originalName: string;
    mimeType: string;
    sizeLabel: string;
  } | null;
  parsedResume: {
    wordCount: number;
    structureScore: number;
    summary: string | null;
    normalizedPreview: string;
    sections: Array<{
      label: string;
      value: boolean;
    }>;
  } | null;
  jobDescriptionRawText: string | null;
  mustHaveKeywords: Array<{
    id: string;
    label: string;
  }>;
  niceToHaveKeywords: Array<{
    id: string;
    label: string;
  }>;
  matchedKeywords: Array<{
    id: string;
    label: string;
  }>;
  partialKeywords: Array<{
    id: string;
    label: string;
  }>;
  missingKeywords: Array<{
    id: string;
    label: string;
  }>;
  suggestions: Array<{
    id: string;
    title: string;
    description: string;
    priority: string;
  }>;
  actions?: {
    reportHref: string;
    shareHref: Route;
    historyHref: Route;
    uploadHref: Route;
  };
  headerBadge?: string;
}

function getScoreTone(score: number | null) {
  if (score === null) {
    return "text-white";
  }

  if (score >= 80) {
    return "text-emerald-300";
  }

  if (score >= 60) {
    return "text-amber-200";
  }

  return "text-rose-200";
}

function getStatusMessage(status: string, hasParsedResume: boolean) {
  if (status === "FAILED") {
    return {
      title: "Resume parsing needs another pass",
      description:
        "We could not extract reliable text from this file. This usually happens with scanned PDFs, password-protected files, or image-heavy exports."
    };
  }

  if (status === "PROCESSING") {
    return {
      title: "Analysis is still processing",
      description:
        "The intake service is still extracting text and computing resume-to-job matches. Refresh in a moment if this state persists."
    };
  }

  if (status === "PENDING" && hasParsedResume) {
    return {
      title: "Resume parsed, waiting for job-match scoring",
      description:
        "The resume text was extracted successfully, but a job description was not available for full ATS scoring."
    };
  }

  return null;
}

export function AnalysisDashboard({
  sessionTitle,
  status,
  createdAt,
  overallScore,
  scoreBreakdown,
  scoreSummary,
  roleMeta,
  fileMeta,
  parsedResume,
  jobDescriptionRawText,
  mustHaveKeywords,
  niceToHaveKeywords,
  matchedKeywords,
  partialKeywords,
  missingKeywords,
  suggestions,
  actions,
  headerBadge = "Analysis dashboard"
}: AnalysisDashboardProps) {
  const statusMessage = getStatusMessage(status, Boolean(parsedResume));

  return (
    <section className="px-6 py-16 lg:px-8 lg:py-20">
      <div className="mx-auto max-w-7xl">
        <div className="grid gap-6 xl:grid-cols-[1.25fr_0.75fr]">
          <Card className="relative min-w-0 overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(52,211,153,0.18),transparent_34%),radial-gradient(circle_at_bottom_left,rgba(245,106,72,0.16),transparent_32%)]" />
            <div className="relative">
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[var(--color-brand-300)]">
                {headerBadge}
              </p>
              <div className="mt-4 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
                <div>
                  <h1 className="max-w-3xl break-words font-heading text-4xl text-white sm:text-5xl">
                    {sessionTitle}
                  </h1>
                  <p className="mt-4 max-w-3xl text-base leading-8 text-[var(--muted-foreground)]">
                    See how your resume matches this role, where it falls short, and what to improve before you apply.
                  </p>
                </div>

                <div className="rounded-[28px] border border-white/10 bg-[rgba(5,7,12,0.48)] px-6 py-5 text-right shadow-[0_16px_40px_rgba(7,10,18,0.25)]">
                  <p className="text-xs uppercase tracking-[0.18em] text-[var(--muted-foreground)]">ATS score</p>
                  <p className={`mt-2 font-heading text-6xl ${getScoreTone(overallScore)}`}>
                    {overallScore ?? "--"}
                  </p>
                  <p className="mt-2 text-sm text-[var(--muted-foreground)]">Status: {status}</p>
                </div>
              </div>

              {actions ? (
                <div className="mt-6 flex flex-wrap gap-3">
                  <Button asChild size="sm">
                    <Link href={actions.uploadHref}>New analysis</Link>
                  </Button>
                  <Button asChild size="sm" variant="secondary">
                    <a href={actions.reportHref}>Download report</a>
                  </Button>
                  <Button asChild size="sm" variant="secondary">
                    <Link href={actions.shareHref}>Share view</Link>
                  </Button>
                  <Button asChild size="sm" variant="ghost">
                    <Link href={actions.historyHref}>History</Link>
                  </Button>
                </div>
              ) : null}

              <div className="mt-8 grid gap-4 md:grid-cols-4">
                {[
                  { label: "Created", value: createdAt, icon: Activity },
                  {
                    label: "Keyword coverage",
                    value:
                      scoreSummary ? `${scoreSummary.keywordCoverage}%` : status === "FAILED" ? "Unavailable" : "Pending",
                    icon: Target
                  },
                  {
                    label: "Must-have coverage",
                    value:
                      scoreSummary ? `${scoreSummary.mustHaveCoverage}%` : status === "FAILED" ? "Unavailable" : "Pending",
                    icon: CheckCircle2
                  },
                  {
                    label: "Role title",
                    value: roleMeta?.title ?? "Not detected",
                    icon: BriefcaseBusiness
                  }
                ].map((item) => {
                  const Icon = item.icon;

                  return (
                    <div key={item.label} className="rounded-2xl border border-white/8 bg-white/4 p-4">
                      <div className="flex items-center gap-2 text-[var(--muted-foreground)]">
                        <Icon className="size-4" />
                        <p className="text-xs uppercase tracking-[0.18em]">{item.label}</p>
                      </div>
                      <p className="mt-3 text-lg font-semibold text-white">{item.value}</p>
                    </div>
                  );
                })}
              </div>

              {statusMessage ? (
                <div className="mt-6 rounded-[24px] border border-white/10 bg-[rgba(255,255,255,0.04)] p-5">
                  <div className="flex items-start gap-3">
                    <CircleAlert className="mt-0.5 size-5 text-[var(--color-brand-300)]" />
                    <div>
                      <p className="text-base font-semibold text-white">{statusMessage.title}</p>
                      <p className="mt-2 text-sm leading-7 text-[var(--muted-foreground)]">
                        {statusMessage.description}
                      </p>
                    </div>
                  </div>
                </div>
              ) : null}
            </div>
          </Card>

          <Card className="min-w-0">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[var(--color-brand-300)]">
              Score breakdown
            </p>
            <h2 className="mt-4 text-2xl font-semibold text-white">Weighted ATS breakdown</h2>
            <p className="mt-3 text-sm leading-7 text-[var(--muted-foreground)]">
              Your score combines keyword coverage, must-have skills, section completeness, relevance, structure, and
              overall alignment with the role.
            </p>
            <div className="mt-6">
              {scoreBreakdown.length > 0 ? (
                <ScoreBreakdownChart data={scoreBreakdown} />
              ) : (
                <div className="flex min-h-[260px] items-center justify-center rounded-[24px] border border-dashed border-white/10 bg-white/4 px-6 text-center text-sm leading-7 text-[var(--muted-foreground)]">
                  The score breakdown appears once resume text extraction and job-description scoring complete.
                </div>
              )}
            </div>
          </Card>
        </div>

        <div className="mt-6 grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
          <div className="space-y-6">
            <Card>
              <h2 className="text-2xl font-semibold text-white">Keyword signals</h2>
              <div className="mt-5 space-y-5">
                <KeywordGroup
                  title="Matched"
                  emptyMessage="No matched keywords yet."
                  items={matchedKeywords}
                  tone="success"
                />
                <KeywordGroup
                  title="Partial"
                  emptyMessage="No partial keyword matches."
                  items={partialKeywords}
                  tone="warning"
                  limit={10}
                />
                <KeywordGroup
                  title="Missing"
                  emptyMessage="No missing keywords."
                  items={missingKeywords}
                  tone="danger"
                />
              </div>
            </Card>

            <Card>
              <h2 className="text-2xl font-semibold text-white">Job description insights</h2>
              {roleMeta ? (
                <div className="mt-5 space-y-5">
                  <div className="grid gap-4 sm:grid-cols-3">
                    <div className="rounded-2xl border border-white/8 bg-white/4 p-4">
                      <p className="text-xs uppercase tracking-[0.18em] text-[var(--muted-foreground)]">Role</p>
                      <p className="mt-2 text-base font-semibold text-white">{roleMeta.title ?? "Not detected"}</p>
                    </div>
                    <div className="rounded-2xl border border-white/8 bg-white/4 p-4">
                      <p className="text-xs uppercase tracking-[0.18em] text-[var(--muted-foreground)]">Seniority</p>
                      <p className="mt-2 text-base font-semibold text-white">{roleMeta.seniority ?? "Not detected"}</p>
                    </div>
                    <div className="rounded-2xl border border-white/8 bg-white/4 p-4">
                      <p className="text-xs uppercase tracking-[0.18em] text-[var(--muted-foreground)]">Keywords</p>
                      <p className="mt-2 text-base font-semibold text-white">{roleMeta.extractedKeywordCount}</p>
                    </div>
                  </div>

                  <KeywordGroup
                    title="Must-have signals"
                    emptyMessage="No must-have keywords detected."
                    items={mustHaveKeywords}
                    tone="success"
                  />
                  <KeywordGroup
                    title="Nice-to-have signals"
                    emptyMessage="No nice-to-have keywords detected."
                    items={niceToHaveKeywords}
                    tone="neutral"
                    limit={14}
                  />

                  <div className="rounded-[24px] border border-white/8 bg-white/4 p-5">
                    <p className="text-xs uppercase tracking-[0.18em] text-[var(--muted-foreground)]">Raw job description</p>
                    <div className="mt-3 max-h-[360px] overflow-y-auto rounded-2xl bg-[rgba(255,255,255,0.02)] p-4">
                      <p className="whitespace-pre-wrap break-words text-sm leading-7 text-white/82">
                        {jobDescriptionRawText ?? "No job description was provided for this session."}
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <p className="mt-4 text-sm leading-7 text-[var(--muted-foreground)]">
                  Upload a job description to unlock keyword extraction, must-have classification, and ATS scoring.
                </p>
              )}
            </Card>

            <Card>
              <h2 className="text-2xl font-semibold text-white">Improvement suggestions</h2>
              {suggestions.length > 0 ? (
                <div className="mt-5 space-y-3">
                  {suggestions.map((suggestion) => (
                    <div key={suggestion.id} className="rounded-2xl border border-white/8 bg-white/4 p-4">
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2">
                          <Sparkles className="size-4 text-[var(--color-brand-300)]" />
                          <p className="text-base font-semibold text-white">{suggestion.title}</p>
                        </div>
                        <span className="rounded-full border border-white/10 bg-white/6 px-3 py-1 text-xs uppercase tracking-[0.14em] text-[var(--muted-foreground)]">
                          {suggestion.priority}
                        </span>
                      </div>
                      <p className="mt-3 text-sm leading-7 text-[var(--muted-foreground)]">
                        {suggestion.description}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="mt-4 text-sm leading-7 text-[var(--muted-foreground)]">
                  Suggestions appear once the scoring engine has enough signals to identify resume gaps.
                </p>
              )}
            </Card>
          </div>

          <div className="space-y-6">
            <Card>
              <h2 className="text-2xl font-semibold text-white">Resume intake summary</h2>
              {fileMeta ? (
                <div className="mt-5 grid gap-4 sm:grid-cols-3">
                  <div className="rounded-2xl border border-white/8 bg-white/4 p-4">
                    <div className="flex items-center gap-2 text-[var(--muted-foreground)]">
                      <FileText className="size-4" />
                      <p className="text-xs uppercase tracking-[0.18em]">Filename</p>
                    </div>
                    <p className="mt-3 break-all text-sm font-medium text-white">{fileMeta.originalName}</p>
                  </div>
                  <div className="rounded-2xl border border-white/8 bg-white/4 p-4">
                    <p className="text-xs uppercase tracking-[0.18em] text-[var(--muted-foreground)]">File type</p>
                    <p className="mt-3 break-all text-sm font-medium text-white">{fileMeta.mimeType}</p>
                  </div>
                  <div className="rounded-2xl border border-white/8 bg-white/4 p-4">
                    <p className="text-xs uppercase tracking-[0.18em] text-[var(--muted-foreground)]">File size</p>
                    <p className="mt-3 text-sm font-medium text-white">{fileMeta.sizeLabel}</p>
                  </div>
                </div>
              ) : (
                <p className="mt-4 text-sm leading-7 text-[var(--muted-foreground)]">
                  Resume metadata is unavailable for this session.
                </p>
              )}
            </Card>

            <Card>
              <h2 className="text-2xl font-semibold text-white">Parsed resume insights</h2>
              {parsedResume ? (
                <div className="mt-5 space-y-5">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="rounded-2xl border border-white/8 bg-white/4 p-4">
                      <p className="text-xs uppercase tracking-[0.18em] text-[var(--muted-foreground)]">Word count</p>
                      <p className="mt-2 text-2xl font-semibold text-white">{parsedResume.wordCount}</p>
                    </div>
                    <div className="rounded-2xl border border-white/8 bg-white/4 p-4">
                      <p className="text-xs uppercase tracking-[0.18em] text-[var(--muted-foreground)]">Structure score</p>
                      <p className="mt-2 text-2xl font-semibold text-white">{parsedResume.structureScore}/100</p>
                    </div>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2">
                    {parsedResume.sections.map((item) => (
                      <div key={item.label} className="rounded-2xl border border-white/8 bg-white/4 px-4 py-3">
                        <div className="flex items-center justify-between gap-3">
                          <p className="text-xs uppercase tracking-[0.18em] text-[var(--muted-foreground)]">{item.label}</p>
                          {item.value ? (
                            <CheckCircle2 className="size-4 text-emerald-300" />
                          ) : (
                            <CircleAlert className="size-4 text-amber-200" />
                          )}
                        </div>
                        <p className="mt-2 text-sm font-medium text-white">{item.value ? "Detected" : "Missing"}</p>
                      </div>
                    ))}
                  </div>

                  <div className="rounded-[24px] border border-white/8 bg-white/4 p-5">
                    <p className="text-xs uppercase tracking-[0.18em] text-[var(--muted-foreground)]">Extracted summary</p>
                    <p className="mt-3 text-sm leading-7 text-white/82">
                      {parsedResume.summary ?? "No summary section was detected, so the parser could not extract one."}
                    </p>
                  </div>

                  <div className="rounded-[24px] border border-white/8 bg-white/4 p-5">
                    <p className="text-xs uppercase tracking-[0.18em] text-[var(--muted-foreground)]">Normalized text preview</p>
                    <p className="mt-3 whitespace-pre-wrap text-sm leading-7 text-white/82">
                      {parsedResume.normalizedPreview}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="mt-5 rounded-[24px] border border-white/8 bg-white/4 p-5">
                  <p className="text-base font-semibold text-white">
                    {status === "FAILED" ? "We could not extract text from this resume." : "Parsed resume text is not available yet."}
                  </p>
                  <p className="mt-3 text-sm leading-7 text-[var(--muted-foreground)]">
                    {status === "FAILED"
                      ? "Try a text-based PDF or DOCX export instead of a scanned or image-only file, then run the analysis again."
                      : "This usually means the upload is still processing or the analysis was created without a successful parse step."}
                  </p>
                </div>
              )}
            </Card>

            {scoreSummary?.bonusSignals.length ? (
              <Card>
                <h2 className="text-2xl font-semibold text-white">Bonus signals</h2>
                <div className="mt-5 space-y-3">
                  {scoreSummary.bonusSignals.map((signal) => (
                    <div key={signal} className="rounded-2xl border border-white/8 bg-white/4 px-4 py-3">
                      <p className="text-sm leading-7 text-[var(--muted-foreground)]">{signal}</p>
                    </div>
                  ))}
                </div>
              </Card>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  );
}
