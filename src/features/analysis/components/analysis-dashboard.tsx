import Link from "next/link";
import type { Route } from "next";
import {
  Activity,
  BriefcaseBusiness,
  CheckCircle2,
  CircleAlert,
  FileText,
  Gauge,
  Sparkles,
  Target
} from "lucide-react";

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
    readabilityScore: number;
    bulletQualityScore: number;
    estimatedYearsExperience: number | null;
    requiredYearsExperience: number | null;
  } | null;
  roleMeta: {
    title: string | null;
    seniority: string | null;
    extractedKeywordCount: number;
    requiredYearsExperience: number | null;
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
    historyHref: Route;
    uploadHref: Route;
  };
  headerBadge?: string;
}

function getScoreTone(score: number | null) {
  if (score === null) {
    return "text-[var(--foreground)]";
  }

  if (score >= 80) {
    return "text-emerald-300";
  }

  if (score >= 60) {
    return "text-amber-300";
  }

  return "text-rose-300";
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
    <section className="px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
      <div className="mx-auto max-w-7xl space-y-6">
        <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
          <Card className="relative overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(52,211,153,0.18),transparent_34%),radial-gradient(circle_at_bottom_left,rgba(245,106,72,0.16),transparent_32%)]" />
            <div className="relative">
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[var(--color-brand-300)]">
                {headerBadge}
              </p>
              <div className="mt-5 flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                <div className="min-w-0 max-w-3xl">
                  <h1 className="font-heading text-4xl text-[var(--foreground)] [overflow-wrap:anywhere] sm:text-5xl">
                    {sessionTitle}
                  </h1>
                  <p className="mt-4 text-base leading-8 text-[var(--muted-foreground)]">
                    Review the match at a glance, then inspect the skills, readability, and missing signals driving the
                    score.
                  </p>
                </div>

                <div className="grid min-w-[240px] gap-3 rounded-[28px] border border-[var(--border-soft)] bg-[rgba(5,7,12,0.32)] p-5 shadow-[0_16px_40px_rgba(7,10,18,0.25)]">
                  <div>
                    <p className="text-xs uppercase tracking-[0.18em] text-[var(--muted-foreground)]">ATS score</p>
                    <p className={`mt-2 font-heading text-6xl ${getScoreTone(overallScore)}`}>{overallScore ?? "--"}</p>
                    <p className="mt-2 text-sm text-[var(--muted-foreground)]">Status: {status}</p>
                  </div>
                  <div className="grid gap-2 rounded-2xl border border-[var(--border-soft)] bg-[var(--surface-2)] p-4">
                    <p className="text-xs uppercase tracking-[0.18em] text-[var(--muted-foreground)]">Role fit</p>
                    <p className="text-sm font-semibold text-[var(--foreground)]">
                      {roleMeta?.title ?? "Role not detected"}
                      {roleMeta?.requiredYearsExperience ? ` · ${roleMeta.requiredYearsExperience}+ years` : ""}
                    </p>
                  </div>
                </div>
              </div>

              {actions ? (
                <div className="mt-6 flex flex-wrap gap-3">
                  <Button asChild size="sm">
                    <Link href={actions.uploadHref}>New analysis</Link>
                  </Button>
                  <Button asChild size="sm" variant="ghost">
                    <Link href={actions.historyHref}>History</Link>
                  </Button>
                </div>
              ) : null}

              <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                {[
                  { label: "Created", value: createdAt, icon: Activity },
                  {
                    label: "Keyword coverage",
                    value: scoreSummary ? `${scoreSummary.keywordCoverage}%` : status === "FAILED" ? "Unavailable" : "Pending",
                    icon: Target
                  },
                  {
                    label: "Must-have coverage",
                    value: scoreSummary ? `${scoreSummary.mustHaveCoverage}%` : status === "FAILED" ? "Unavailable" : "Pending",
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
                    <div key={item.label} className="rounded-2xl border border-[var(--border-soft)] bg-[var(--surface-2)] p-4">
                      <div className="flex items-center gap-2 text-[var(--muted-foreground)]">
                        <Icon className="size-4" />
                        <p className="text-xs uppercase tracking-[0.18em]">{item.label}</p>
                      </div>
                      <p className="mt-3 text-lg font-semibold text-[var(--foreground)]">{item.value}</p>
                    </div>
                  );
                })}
              </div>

              {statusMessage ? (
                <div className="mt-6 rounded-[24px] border border-[var(--border-soft)] bg-[var(--surface-2)] p-5">
                  <div className="flex items-start gap-3">
                    <CircleAlert className="mt-0.5 size-5 text-[var(--color-brand-300)]" />
                    <div>
                      <p className="text-base font-semibold text-[var(--foreground)]">{statusMessage.title}</p>
                      <p className="mt-2 text-sm leading-7 text-[var(--muted-foreground)]">{statusMessage.description}</p>
                    </div>
                  </div>
                </div>
              ) : null}
            </div>
          </Card>

          <div className="grid gap-6">
            <Card className="min-w-0">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[var(--color-brand-300)]">
                    Score breakdown
                  </p>
                  <h2 className="mt-4 text-2xl font-semibold text-[var(--foreground)]">What is driving the score</h2>
                  <p className="mt-3 text-sm leading-7 text-[var(--muted-foreground)]">
                    Keyword overlap, must-have skills, structure, and role alignment all contribute to the total.
                  </p>
                </div>
                <Gauge className="mt-1 hidden size-5 text-[var(--color-brand-300)] sm:block" />
              </div>
              <div className="mt-6">
                {scoreBreakdown.length > 0 ? (
                  <ScoreBreakdownChart data={scoreBreakdown} />
                ) : (
                  <div className="flex min-h-[260px] items-center justify-center rounded-[24px] border border-dashed border-[var(--border-soft)] bg-[var(--surface-2)] px-6 text-center text-sm leading-7 text-[var(--muted-foreground)]">
                    The score breakdown appears once resume text extraction and job-description scoring complete.
                  </div>
                )}
              </div>
            </Card>

            <Card>
              <h2 className="text-2xl font-semibold text-[var(--foreground)]">Resume quality signals</h2>
              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                {[
                  {
                    label: "Readability",
                    value: scoreSummary ? `${scoreSummary.readabilityScore}/100` : "--"
                  },
                  {
                    label: "Bullet quality",
                    value: scoreSummary ? `${scoreSummary.bulletQualityScore}/100` : "--"
                  },
                  {
                    label: "Estimated experience",
                    value:
                      scoreSummary?.estimatedYearsExperience !== null && scoreSummary?.estimatedYearsExperience !== undefined
                        ? `${scoreSummary.estimatedYearsExperience}+ years`
                        : "Not detected"
                  },
                  {
                    label: "Required experience",
                    value:
                      roleMeta?.requiredYearsExperience !== null && roleMeta?.requiredYearsExperience !== undefined
                        ? `${roleMeta.requiredYearsExperience}+ years`
                        : "Not specified"
                  }
                ].map((item) => (
                  <div key={item.label} className="rounded-2xl border border-[var(--border-soft)] bg-[var(--surface-2)] p-4">
                    <p className="text-xs uppercase tracking-[0.18em] text-[var(--muted-foreground)]">{item.label}</p>
                    <p className="mt-3 text-2xl font-semibold text-[var(--foreground)]">{item.value}</p>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>

        <div className="grid gap-6 xl:grid-cols-[0.92fr_1.08fr]">
          <div className="space-y-6">
            <Card>
              <h2 className="text-2xl font-semibold text-[var(--foreground)]">Keyword signals</h2>
              <div className="mt-5 space-y-5">
                <KeywordGroup title="Matched" emptyMessage="No matched keywords yet." items={matchedKeywords} tone="success" />
                <KeywordGroup
                  title="Partial"
                  emptyMessage="No partial keyword matches."
                  items={partialKeywords}
                  tone="warning"
                  limit={10}
                />
                <KeywordGroup title="Missing" emptyMessage="No missing keywords." items={missingKeywords} tone="danger" />
              </div>
            </Card>

            <Card>
              <h2 className="text-2xl font-semibold text-[var(--foreground)]">Job description insights</h2>
              {roleMeta ? (
                <div className="mt-5 space-y-5">
                  <div className="grid gap-4 sm:grid-cols-3">
                    <div className="rounded-2xl border border-[var(--border-soft)] bg-[var(--surface-2)] p-4">
                      <p className="text-xs uppercase tracking-[0.18em] text-[var(--muted-foreground)]">Role</p>
                      <p className="mt-2 text-base font-semibold text-[var(--foreground)]">{roleMeta.title ?? "Not detected"}</p>
                    </div>
                    <div className="rounded-2xl border border-[var(--border-soft)] bg-[var(--surface-2)] p-4">
                      <p className="text-xs uppercase tracking-[0.18em] text-[var(--muted-foreground)]">Seniority</p>
                      <p className="mt-2 text-base font-semibold text-[var(--foreground)]">{roleMeta.seniority ?? "Not detected"}</p>
                    </div>
                    <div className="rounded-2xl border border-[var(--border-soft)] bg-[var(--surface-2)] p-4">
                      <p className="text-xs uppercase tracking-[0.18em] text-[var(--muted-foreground)]">Keywords</p>
                      <p className="mt-2 text-base font-semibold text-[var(--foreground)]">{roleMeta.extractedKeywordCount}</p>
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

                  <div className="rounded-[24px] border border-[var(--border-soft)] bg-[var(--surface-2)] p-5">
                    <p className="text-xs uppercase tracking-[0.18em] text-[var(--muted-foreground)]">Role text used for scoring</p>
                    <div className="mt-3 max-h-[320px] overflow-y-auto rounded-2xl bg-[var(--surface-1)] p-4">
                      <p className="whitespace-pre-wrap break-words text-sm leading-7 text-[var(--foreground)]">
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
              <h2 className="text-2xl font-semibold text-[var(--foreground)]">Improvement suggestions</h2>
              {suggestions.length > 0 ? (
                <div className="mt-5 space-y-3">
                  {suggestions.map((suggestion) => (
                    <div key={suggestion.id} className="rounded-2xl border border-[var(--border-soft)] bg-[var(--surface-2)] p-4">
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2">
                          <Sparkles className="size-4 text-[var(--color-brand-300)]" />
                          <p className="text-base font-semibold text-[var(--foreground)]">{suggestion.title}</p>
                        </div>
                        <span className="rounded-full border border-[var(--border-soft)] bg-[var(--surface-3)] px-3 py-1 text-xs uppercase tracking-[0.14em] text-[var(--muted-foreground)]">
                          {suggestion.priority}
                        </span>
                      </div>
                      <p className="mt-3 text-sm leading-7 text-[var(--muted-foreground)]">{suggestion.description}</p>
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
              <h2 className="text-2xl font-semibold text-[var(--foreground)]">Resume intake summary</h2>
              {fileMeta ? (
                <div className="mt-5 grid gap-4 sm:grid-cols-3">
                  <div className="rounded-2xl border border-[var(--border-soft)] bg-[var(--surface-2)] p-4">
                    <div className="flex items-center gap-2 text-[var(--muted-foreground)]">
                      <FileText className="size-4" />
                      <p className="text-xs uppercase tracking-[0.18em]">Filename</p>
                    </div>
                    <p className="mt-3 break-all text-sm font-medium text-[var(--foreground)]">{fileMeta.originalName}</p>
                  </div>
                  <div className="rounded-2xl border border-[var(--border-soft)] bg-[var(--surface-2)] p-4">
                    <p className="text-xs uppercase tracking-[0.18em] text-[var(--muted-foreground)]">File type</p>
                    <p className="mt-3 break-all text-sm font-medium text-[var(--foreground)]">{fileMeta.mimeType}</p>
                  </div>
                  <div className="rounded-2xl border border-[var(--border-soft)] bg-[var(--surface-2)] p-4">
                    <p className="text-xs uppercase tracking-[0.18em] text-[var(--muted-foreground)]">File size</p>
                    <p className="mt-3 text-sm font-medium text-[var(--foreground)]">{fileMeta.sizeLabel}</p>
                  </div>
                </div>
              ) : (
                <p className="mt-4 text-sm leading-7 text-[var(--muted-foreground)]">
                  Resume metadata is unavailable for this session.
                </p>
              )}
            </Card>

            <Card>
              <h2 className="text-2xl font-semibold text-[var(--foreground)]">Parsed resume insights</h2>
              {parsedResume ? (
                <div className="mt-5 space-y-5">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="rounded-2xl border border-[var(--border-soft)] bg-[var(--surface-2)] p-4">
                      <p className="text-xs uppercase tracking-[0.18em] text-[var(--muted-foreground)]">Word count</p>
                      <p className="mt-2 text-2xl font-semibold text-[var(--foreground)]">{parsedResume.wordCount}</p>
                    </div>
                    <div className="rounded-2xl border border-[var(--border-soft)] bg-[var(--surface-2)] p-4">
                      <p className="text-xs uppercase tracking-[0.18em] text-[var(--muted-foreground)]">Structure score</p>
                      <p className="mt-2 text-2xl font-semibold text-[var(--foreground)]">{parsedResume.structureScore}/100</p>
                    </div>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2">
                    {parsedResume.sections.map((item) => (
                      <div key={item.label} className="rounded-2xl border border-[var(--border-soft)] bg-[var(--surface-2)] px-4 py-3">
                        <div className="flex items-center justify-between gap-3">
                          <p className="text-xs uppercase tracking-[0.18em] text-[var(--muted-foreground)]">{item.label}</p>
                          {item.value ? (
                            <CheckCircle2 className="size-4 text-emerald-300" />
                          ) : (
                            <CircleAlert className="size-4 text-amber-300" />
                          )}
                        </div>
                        <p className="mt-2 text-sm font-medium text-[var(--foreground)]">{item.value ? "Detected" : "Missing"}</p>
                      </div>
                    ))}
                  </div>

                  <div className="rounded-[24px] border border-[var(--border-soft)] bg-[var(--surface-2)] p-5">
                    <p className="text-xs uppercase tracking-[0.18em] text-[var(--muted-foreground)]">Extracted summary</p>
                    <p className="mt-3 text-sm leading-7 text-[var(--foreground)]">
                      {parsedResume.summary ?? "No summary section was detected, so the parser could not extract one."}
                    </p>
                  </div>

                  <div className="rounded-[24px] border border-[var(--border-soft)] bg-[var(--surface-2)] p-5">
                    <p className="text-xs uppercase tracking-[0.18em] text-[var(--muted-foreground)]">Normalized text preview</p>
                    <p className="mt-3 whitespace-pre-wrap text-sm leading-7 text-[var(--foreground)]">{parsedResume.normalizedPreview}</p>
                  </div>
                </div>
              ) : (
                <div className="mt-5 rounded-[24px] border border-[var(--border-soft)] bg-[var(--surface-2)] p-5">
                  <p className="text-base font-semibold text-[var(--foreground)]">
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
                <h2 className="text-2xl font-semibold text-[var(--foreground)]">Bonus signals</h2>
                <div className="mt-5 space-y-3">
                  {scoreSummary.bonusSignals.map((signal) => (
                    <div key={signal} className="rounded-2xl border border-[var(--border-soft)] bg-[var(--surface-2)] px-4 py-3">
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
