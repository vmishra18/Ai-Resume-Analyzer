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
import { RewriteCopyButton } from "@/features/analysis/components/rewrite-copy-button";
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
    roleFamily: "frontend" | "backend" | "product" | "data" | "devops" | "qa" | "general" | null;
    resumeRoleFamily: "frontend" | "backend" | "product" | "data" | "devops" | "qa" | "general" | null;
    roleFamilyAlignment: "aligned" | "adjacent" | "mismatch" | "unknown";
    detectedResumeSeniority: string | null;
    seniorityMismatch: {
      hasMismatch: boolean;
      jobSeniority: string | null;
      resumeSeniority: string | null;
      summary: string | null;
    };
    semanticMatches: Array<{
      keyword: string;
      evidence: string;
    }>;
    achievementSignals: Array<{
      bullet: string;
      evidence: string[];
    }>;
    weakBullets: Array<{
      bullet: string;
      issues: string[];
    }>;
    rewriteAssist: Array<{
      id: string;
      kind: "weak_bullet" | "missing_skill";
      original: string | null;
      suggestion: string;
      rationale: string;
    }>;
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
    return "text-[var(--score-high)]";
  }

  if (score >= 60) {
    return "text-[var(--score-medium)]";
  }

  return "text-[var(--score-low)]";
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

function formatRoleFamilyLabel(value: AnalysisDashboardProps["scoreSummary"] extends infer T
  ? T extends { roleFamily: infer U }
    ? U
    : never
  : never) {
  if (!value) {
    return "Not detected";
  }

  switch (value) {
    case "devops":
      return "DevOps";
    case "qa":
      return "QA";
    case "product":
      return "PM";
    case "general":
      return "Generalist";
    default:
      return `${value.charAt(0).toUpperCase()}${value.slice(1)}`;
  }
}

function formatAlignmentLabel(value: "aligned" | "adjacent" | "mismatch" | "unknown") {
  switch (value) {
    case "aligned":
      return "Aligned";
    case "adjacent":
      return "Adjacent";
    case "mismatch":
      return "Mismatch";
    default:
      return "Unknown";
  }
}

function getAlignmentTone(value: "aligned" | "adjacent" | "mismatch" | "unknown") {
  switch (value) {
    case "aligned":
      return "border-[var(--tone-success-border)] bg-[var(--tone-success-bg)] text-[var(--tone-success-foreground)]";
    case "adjacent":
      return "border-[var(--tone-warning-border)] bg-[var(--tone-warning-bg)] text-[var(--tone-warning-foreground)]";
    case "mismatch":
      return "border-[var(--tone-danger-border)] bg-[var(--tone-danger-bg)] text-[var(--tone-danger-foreground)]";
    default:
      return "border-[var(--border-soft)] bg-[var(--surface-2)] text-[var(--muted-foreground)]";
  }
}

function formatEvidenceLabel(value: string) {
  return value.replace(/_/g, " ");
}

function getPriorityWeight(priority: string) {
  switch (priority) {
    case "high":
      return 0;
    case "medium":
      return 1;
    default:
      return 2;
  }
}

function buildScoreNarrative({
  overallScore,
  scoreSummary,
  missingKeywordCount
}: {
  overallScore: number | null;
  scoreSummary: NonNullable<AnalysisDashboardProps["scoreSummary"]> | null;
  missingKeywordCount: number;
}) {
  if (!scoreSummary) {
    return {
      title: "What matters most",
      summary: "This explanation appears once the scoring engine has enough data to compare the resume with the target role.",
      points: [] as string[]
    };
  }

  const points: string[] = [];

  if (scoreSummary.mustHaveCoverage < 75) {
    points.push(`Only ${scoreSummary.mustHaveCoverage}% of the must-have signals are clearly represented right now.`);
  }

  if (missingKeywordCount > 0) {
    points.push(`${missingKeywordCount} role keywords are still missing or too indirect to count strongly.`);
  }

  if (scoreSummary.roleFamilyAlignment === "mismatch" || scoreSummary.roleFamilyAlignment === "adjacent") {
    points.push(
      `The resume reads more like a ${formatRoleFamilyLabel(scoreSummary.resumeRoleFamily).toLowerCase()} profile than the target ${formatRoleFamilyLabel(scoreSummary.roleFamily).toLowerCase()} role.`
    );
  }

  if (scoreSummary.seniorityMismatch.hasMismatch && scoreSummary.seniorityMismatch.summary) {
    points.push(scoreSummary.seniorityMismatch.summary);
  }

  if (scoreSummary.semanticMatches.length > 0) {
    points.push(
      `Some skills are only being inferred semantically, like ${scoreSummary.semanticMatches
        .slice(0, 2)
        .map((match) => `${match.keyword} via ${match.evidence}`)
        .join(" and ")}. Naming them directly would improve the match.`
    );
  }

  if (scoreSummary.bulletQualityScore < 70 || scoreSummary.weakBullets.length > 0) {
    points.push(
      `Bullet quality is ${scoreSummary.bulletQualityScore}/100, so stronger ownership, specificity, and measurable outcomes would help the score move faster.`
    );
  }

  if (points.length === 0) {
    points.push("Most of the score is already being supported by direct skill evidence, clear structure, and readable bullet writing.");
  }

  const summary =
    overallScore !== null && overallScore >= 80
      ? "The resume is close. The biggest opportunity is making the strongest evidence more explicit."
      : overallScore !== null && overallScore >= 60
        ? "The foundation is there, but a few high-signal gaps are still dragging the score down."
        : "The score is mainly being held back by missing role evidence and clarity in how recent work is described.";

  return {
    title: "What matters most",
    summary,
    points: points.slice(0, 3)
  };
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
  const seniorityMismatch = scoreSummary?.seniorityMismatch ?? {
    hasMismatch: false,
    jobSeniority: null,
    resumeSeniority: null,
    summary: null
  };
  const semanticMatches = scoreSummary?.semanticMatches ?? [];
  const achievementSignals = scoreSummary?.achievementSignals ?? [];
  const weakBullets = scoreSummary?.weakBullets ?? [];
  const rewriteAssist = scoreSummary?.rewriteAssist ?? [];
  const prioritizedSuggestions = [...suggestions]
    .sort((left, right) => {
      const priorityDelta = getPriorityWeight(left.priority) - getPriorityWeight(right.priority);

      return priorityDelta !== 0 ? priorityDelta : left.title.localeCompare(right.title);
    })
    .slice(0, 3);
  const scoreNarrative = buildScoreNarrative({
    overallScore,
    scoreSummary,
    missingKeywordCount: missingKeywords.length
  });
  const notebookStats = [
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
  ];

  return (
    <section className="px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
      <div className="mx-auto grid max-w-7xl gap-6 xl:grid-cols-[300px_minmax(0,1fr)]">
        <aside className="space-y-6 xl:sticky xl:top-24 xl:self-start">
          <Card className="space-y-6">
            <div>
              <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-[var(--color-brand-300)]">
                {headerBadge}
              </p>
              <h1 className="mt-4 font-heading text-3xl font-semibold leading-tight text-[var(--foreground)] [overflow-wrap:anywhere]">
                {sessionTitle}
              </h1>
              <p className="mt-4 text-sm leading-7 text-[var(--muted-foreground)]">
                Working notebook for fit, missing signals, and revision decisions.
              </p>
            </div>

            <div className="rounded-[16px] border border-[var(--border-soft)] bg-[var(--panel-strong)] p-5">
              <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-[var(--muted-foreground)]">
                Overall match
              </p>
              <p className={`mt-3 font-heading text-7xl leading-none ${getScoreTone(overallScore)}`}>{overallScore ?? "--"}</p>
              <div className="mt-4 flex flex-wrap items-center gap-2">
                <span className={`rounded-full border px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] ${getStatusTone(status)}`}>
                  {status}
                </span>
                <span className="rounded-full border border-[var(--border-soft)] bg-[var(--surface-2)] px-3 py-1 font-mono text-[11px] uppercase tracking-[0.14em] text-[var(--muted-foreground)]">
                  {roleMeta?.title ?? "role pending"}
                </span>
              </div>
            </div>

            <div className="space-y-4">
              {notebookStats.map((item) => {
                const Icon = item.icon;

                return (
                  <div key={item.label} className="rounded-[14px] border border-[var(--border-soft)] bg-[var(--surface-1)] px-4 py-4">
                    <div className="flex items-center gap-2 text-[var(--muted-foreground)]">
                      <Icon className="size-4" />
                      <p className="font-mono text-[11px] uppercase tracking-[0.18em]">{item.label}</p>
                    </div>
                    <p className="mt-3 text-base font-semibold text-[var(--foreground)]">{item.value}</p>
                  </div>
                );
              })}
            </div>

            {actions ? (
              <div className="grid gap-3">
                <Button asChild size="sm">
                  <Link href={actions.uploadHref}>New notebook</Link>
                </Button>
                <Button asChild size="sm" variant="secondary">
                  <Link href={actions.historyHref}>History</Link>
                </Button>
              </div>
            ) : null}

            {statusMessage ? (
              <div className="rounded-[14px] border border-[var(--border-soft)] bg-[var(--surface-1)] p-4">
                <div className="flex items-start gap-3">
                  <CircleAlert className="mt-0.5 size-5 text-[var(--color-brand-300)]" />
                  <div>
                    <p className="text-base font-semibold text-[var(--foreground)]">{statusMessage.title}</p>
                    <p className="mt-2 text-sm leading-7 text-[var(--muted-foreground)]">{statusMessage.description}</p>
                  </div>
                </div>
              </div>
            ) : null}
          </Card>
        </aside>

        <div className="space-y-6">
          <Card>
            <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr] lg:items-start">
              <div>
                <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-[var(--color-brand-300)]">
                  Executive brief
                </p>
                <h2 className="mt-4 font-heading text-4xl font-semibold text-[var(--foreground)]">
                  What the notebook sees first
                </h2>
                <p className="mt-4 max-w-2xl text-base leading-8 text-[var(--muted-foreground)]">
                  Review the match at a glance, then inspect the skills, readability, and missing signals driving the
                  score before deciding what to rewrite.
                </p>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
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
                  <div key={item.label} className="rounded-[14px] border border-[var(--border-soft)] bg-[var(--surface-1)] px-4 py-4">
                    <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-[var(--muted-foreground)]">{item.label}</p>
                    <p className="mt-3 text-2xl font-semibold text-[var(--foreground)]">{item.value}</p>
                  </div>
                ))}
              </div>
            </div>
          </Card>

          <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
            <Card className="min-w-0">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-[var(--color-brand-300)]">
                    Scoring trace
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
                  <div className="flex min-h-[260px] items-center justify-center rounded-[14px] border border-dashed border-[var(--border-soft)] px-6 text-center text-sm leading-7 text-[var(--muted-foreground)]">
                    The score breakdown appears once resume text extraction and job-description scoring complete.
                  </div>
                )}
              </div>
            </Card>

            <Card>
              <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-[var(--color-brand-300)]">
                Priority queue
              </p>
              <h2 className="mt-4 text-2xl font-semibold text-[var(--foreground)]">Top 3 prioritized fixes</h2>
              <p className="mt-3 text-sm leading-7 text-[var(--muted-foreground)]">
                These are the highest-leverage edits to make first if you want the score to move without overworking the resume.
              </p>
              {prioritizedSuggestions.length > 0 ? (
                <div className="mt-5 space-y-4">
                  {prioritizedSuggestions.map((suggestion, index) => (
                    <div key={suggestion.id} className="rounded-[14px] border border-[var(--border-soft)] bg-[var(--surface-1)] p-4">
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2">
                          <span className="flex size-6 items-center justify-center rounded-full border border-[var(--border-soft)] bg-[var(--surface-2)] font-mono text-[11px] text-[var(--muted-foreground)]">
                            {index + 1}
                          </span>
                          <Sparkles className="size-4 text-[var(--color-brand-300)]" />
                          <p className="text-base font-semibold text-[var(--foreground)]">{suggestion.title}</p>
                        </div>
                        <span className="rounded-full border border-[var(--border-soft)] px-3 py-1 font-mono text-[11px] uppercase tracking-[0.14em] text-[var(--muted-foreground)]">
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

          <Card>
            <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-[var(--color-brand-300)]">
              Score explanation
            </p>
            <h2 className="mt-4 text-2xl font-semibold text-[var(--foreground)]">{scoreNarrative.title}</h2>
            <p className="mt-4 max-w-3xl text-base leading-8 text-[var(--muted-foreground)]">{scoreNarrative.summary}</p>
            {scoreNarrative.points.length > 0 ? (
              <div className="mt-5 grid gap-3 lg:grid-cols-3">
                {scoreNarrative.points.map((point, index) => (
                  <div key={point} className="rounded-[14px] border border-[var(--border-soft)] bg-[var(--surface-1)] px-4 py-4">
                    <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-[var(--muted-foreground)]">
                      Driver {index + 1}
                    </p>
                    <p className="mt-3 text-sm leading-7 text-[var(--foreground)]">{point}</p>
                  </div>
                ))}
              </div>
            ) : null}
          </Card>

          <div className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
            <Card>
              <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-[var(--color-brand-300)]">
                Fit diagnosis
              </p>
              <h2 className="mt-4 text-2xl font-semibold text-[var(--foreground)]">Role family and seniority read</h2>
              {scoreSummary ? (
                <div className="mt-5 space-y-5">
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="rounded-[14px] border border-[var(--border-soft)] bg-[var(--surface-1)] px-4 py-4">
                      <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-[var(--muted-foreground)]">
                        Target family
                      </p>
                      <p className="mt-2 text-xl font-semibold text-[var(--foreground)]">
                        {formatRoleFamilyLabel(scoreSummary.roleFamily)}
                      </p>
                    </div>
                    <div className="rounded-[14px] border border-[var(--border-soft)] bg-[var(--surface-1)] px-4 py-4">
                      <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-[var(--muted-foreground)]">
                        Resume family
                      </p>
                      <p className="mt-2 text-xl font-semibold text-[var(--foreground)]">
                        {formatRoleFamilyLabel(scoreSummary.resumeRoleFamily)}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-3">
                    <span
                      className={`rounded-full border px-3 py-1 font-mono text-[11px] uppercase tracking-[0.14em] ${getAlignmentTone(scoreSummary.roleFamilyAlignment)}`}
                    >
                      {formatAlignmentLabel(scoreSummary.roleFamilyAlignment)}
                    </span>
                        <span className="rounded-full border border-[var(--border-soft)] bg-[var(--surface-2)] px-3 py-1 font-mono text-[11px] uppercase tracking-[0.14em] text-[var(--muted-foreground)]">
                          Resume reads as {scoreSummary.detectedResumeSeniority ?? "undetermined"}
                        </span>
                      </div>

                      <div className="rounded-[14px] border border-[var(--border-soft)] bg-[var(--surface-1)] p-4">
                        <div className="flex items-start gap-3">
                      {seniorityMismatch.hasMismatch ? (
                        <CircleAlert className="mt-0.5 size-5 text-[var(--tone-warning-foreground)]" />
                      ) : (
                        <CheckCircle2 className="mt-0.5 size-5 text-[var(--tone-success-foreground)]" />
                      )}
                      <div>
                        <p className="text-base font-semibold text-[var(--foreground)]">
                          {seniorityMismatch.hasMismatch ? "Seniority mismatch detected" : "Seniority looks broadly consistent"}
                        </p>
                        <p className="mt-2 text-sm leading-7 text-[var(--muted-foreground)]">
                          {seniorityMismatch.summary ??
                            "The current resume and job description are not showing a major seniority gap."}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-[var(--muted-foreground)]">
                      Semantic skill matches
                    </p>
                    {semanticMatches.length > 0 ? (
                      <div className="mt-3 space-y-3">
                        {semanticMatches.map((match) => (
                          <div
                            key={`${match.keyword}-${match.evidence}`}
                            className="rounded-[14px] border border-[var(--border-soft)] bg-[var(--surface-1)] px-4 py-4"
                          >
                            <p className="text-base font-semibold text-[var(--foreground)]">{match.keyword}</p>
                            <p className="mt-2 text-sm leading-7 text-[var(--muted-foreground)]">
                              Nearby evidence found via <span className="font-medium text-[var(--foreground)]">{match.evidence}</span>.
                              Naming the exact skill directly would strengthen the match.
                            </p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="mt-3 text-sm leading-7 text-[var(--muted-foreground)]">
                        No semantic-only matches were needed. Most detected skill overlap is already direct.
                      </p>
                    )}
                  </div>
                </div>
              ) : (
                <p className="mt-4 text-sm leading-7 text-[var(--muted-foreground)]">
                  Fit diagnosis appears after job-match scoring is available.
                </p>
              )}
            </Card>

            <Card>
              <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-[var(--color-brand-300)]">
                Rewrite assist
              </p>
              <h2 className="mt-4 text-2xl font-semibold text-[var(--foreground)]">Suggested resume line upgrades</h2>
              {rewriteAssist.length ? (
                <div className="mt-5 space-y-4">
                  {rewriteAssist.map((item, index) => (
                    <div key={item.id} className="rounded-[14px] border border-[var(--border-soft)] bg-[var(--surface-1)] p-4">
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <p className="text-base font-semibold text-[var(--foreground)]">Draft {index + 1}</p>
                          <span className="rounded-full border border-[var(--border-soft)] px-3 py-1 font-mono text-[11px] uppercase tracking-[0.14em] text-[var(--muted-foreground)]">
                            {item.kind === "weak_bullet" ? "Bullet rewrite" : "Missing skill"}
                          </span>
                        </div>
                        <RewriteCopyButton value={item.suggestion} />
                      </div>
                      {item.original ? (
                        <div className="mt-3 rounded-[12px] border border-[var(--border-soft)] bg-[var(--surface-2)] p-3">
                          <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-[var(--muted-foreground)]">
                            Original line
                          </p>
                          <p className="mt-2 text-sm leading-7 text-[var(--foreground)]">{item.original}</p>
                        </div>
                      ) : null}
                      <div className="mt-3 rounded-[12px] border border-[var(--tone-info-border)] bg-[var(--tone-info-bg)] p-3">
                        <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-[var(--tone-info-foreground)]">
                          Suggested rewrite
                        </p>
                        <p className="mt-2 text-sm leading-7 text-[var(--foreground)]">{item.suggestion}</p>
                      </div>
                      <p className="mt-3 text-sm leading-7 text-[var(--muted-foreground)]">{item.rationale}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="mt-4 text-sm leading-7 text-[var(--muted-foreground)]">
                  Rewrite drafts appear after the engine identifies weak bullets or high-value missing skill evidence.
                </p>
              )}
            </Card>
          </div>

          <div className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
            <div className="space-y-6">
              <Card>
                <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-[var(--color-brand-300)]">
                  Signal map
                </p>
                <h2 className="mt-4 text-2xl font-semibold text-[var(--foreground)]">Keyword signals</h2>
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
                <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-[var(--color-brand-300)]">
                  Role notes
                </p>
                <h2 className="mt-4 text-2xl font-semibold text-[var(--foreground)]">Job description insights</h2>
                {roleMeta ? (
                  <div className="mt-5 space-y-5">
                    <div className="grid gap-3 sm:grid-cols-3">
                      <div className="rounded-[14px] border border-[var(--border-soft)] bg-[var(--surface-1)] px-4 py-4">
                        <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-[var(--muted-foreground)]">Role</p>
                        <p className="mt-2 text-base font-semibold text-[var(--foreground)]">{roleMeta.title ?? "Not detected"}</p>
                      </div>
                      <div className="rounded-[14px] border border-[var(--border-soft)] bg-[var(--surface-1)] px-4 py-4">
                        <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-[var(--muted-foreground)]">Seniority</p>
                        <p className="mt-2 text-base font-semibold text-[var(--foreground)]">{roleMeta.seniority ?? "Not detected"}</p>
                      </div>
                      <div className="rounded-[14px] border border-[var(--border-soft)] bg-[var(--surface-1)] px-4 py-4">
                        <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-[var(--muted-foreground)]">Keywords</p>
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

                    <div>
                      <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-[var(--muted-foreground)]">
                        Role text used for scoring
                      </p>
                      <div className="mt-3 max-h-[320px] overflow-y-auto rounded-[14px] border border-[var(--border-soft)] bg-[var(--surface-1)] p-4">
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
            </div>

            <div className="space-y-6">
              <Card>
                <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-[var(--color-brand-300)]">
                  Source files
                </p>
                <h2 className="mt-4 text-2xl font-semibold text-[var(--foreground)]">Resume intake summary</h2>
                {fileMeta ? (
                  <div className="mt-5 grid gap-3 sm:grid-cols-3">
                    <div className="rounded-[14px] border border-[var(--border-soft)] bg-[var(--surface-1)] px-4 py-4">
                      <div className="flex items-center gap-2 text-[var(--muted-foreground)]">
                        <FileText className="size-4" />
                        <p className="font-mono text-[11px] uppercase tracking-[0.18em]">Filename</p>
                      </div>
                      <p className="mt-3 break-all text-sm font-medium text-[var(--foreground)]">{fileMeta.originalName}</p>
                    </div>
                    <div className="rounded-[14px] border border-[var(--border-soft)] bg-[var(--surface-1)] px-4 py-4">
                      <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-[var(--muted-foreground)]">File type</p>
                      <p className="mt-3 break-all text-sm font-medium text-[var(--foreground)]">{fileMeta.mimeType}</p>
                    </div>
                    <div className="rounded-[14px] border border-[var(--border-soft)] bg-[var(--surface-1)] px-4 py-4">
                      <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-[var(--muted-foreground)]">File size</p>
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
                <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-[var(--color-brand-300)]">
                  Parse trace
                </p>
                <h2 className="mt-4 text-2xl font-semibold text-[var(--foreground)]">Parsed resume insights</h2>
                {parsedResume ? (
                  <div className="mt-5 space-y-5">
                    <div className="grid gap-3 sm:grid-cols-2">
                      <div className="rounded-[14px] border border-[var(--border-soft)] bg-[var(--surface-1)] px-4 py-4">
                        <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-[var(--muted-foreground)]">Word count</p>
                        <p className="mt-2 text-2xl font-semibold text-[var(--foreground)]">{parsedResume.wordCount}</p>
                      </div>
                      <div className="rounded-[14px] border border-[var(--border-soft)] bg-[var(--surface-1)] px-4 py-4">
                        <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-[var(--muted-foreground)]">Structure score</p>
                        <p className="mt-2 text-2xl font-semibold text-[var(--foreground)]">{parsedResume.structureScore}/100</p>
                      </div>
                    </div>

                    <div className="grid gap-3 sm:grid-cols-2">
                      {parsedResume.sections.map((item) => (
                        <div key={item.label} className="rounded-[14px] border border-[var(--border-soft)] bg-[var(--surface-1)] px-4 py-4">
                          <div className="flex items-center justify-between gap-3">
                            <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-[var(--muted-foreground)]">{item.label}</p>
                            {item.value ? (
                              <CheckCircle2 className="size-4 text-[var(--tone-success-foreground)]" />
                            ) : (
                              <CircleAlert className="size-4 text-[var(--tone-warning-foreground)]" />
                            )}
                          </div>
                          <p className="mt-2 text-sm font-medium text-[var(--foreground)]">{item.value ? "Detected" : "Missing"}</p>
                        </div>
                      ))}
                    </div>

                    <div>
                      <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-[var(--muted-foreground)]">
                        Extracted summary
                      </p>
                      <p className="mt-3 text-sm leading-7 text-[var(--foreground)]">
                        {parsedResume.summary ?? "No summary section was detected, so the parser could not extract one."}
                      </p>
                    </div>

                    <div>
                      <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-[var(--muted-foreground)]">
                        Normalized text preview
                      </p>
                      <div className="mt-3 rounded-[14px] border border-[var(--border-soft)] bg-[var(--surface-1)] p-4">
                        <p className="whitespace-pre-wrap text-sm leading-7 text-[var(--foreground)]">{parsedResume.normalizedPreview}</p>
                      </div>
                    </div>

                    <div className="grid gap-5 xl:grid-cols-2">
                      <div>
                        <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-[var(--muted-foreground)]">
                          Achievement signals
                        </p>
                        {achievementSignals.length ? (
                          <div className="mt-3 space-y-3">
                            {achievementSignals.map((item) => (
                              <div
                                key={item.bullet}
                                className="rounded-[14px] border border-[var(--border-soft)] bg-[var(--surface-1)] p-4"
                              >
                                <p className="text-sm leading-7 text-[var(--foreground)]">{item.bullet}</p>
                                <div className="mt-3 flex flex-wrap gap-2">
                                  {item.evidence.map((evidence) => (
                                    <span
                                      key={`${item.bullet}-${evidence}`}
                                      className="rounded-full border border-[var(--tone-success-border)] bg-[var(--tone-success-bg)] px-3 py-1 font-mono text-[11px] uppercase tracking-[0.14em] text-[var(--tone-success-foreground)]"
                                    >
                                      {formatEvidenceLabel(evidence)}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="mt-3 text-sm leading-7 text-[var(--muted-foreground)]">
                            No strong ownership, impact, or metric-heavy bullets were detected yet.
                          </p>
                        )}
                      </div>

                      <div>
                        <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-[var(--muted-foreground)]">
                          Weak bullet detector
                        </p>
                        {weakBullets.length ? (
                          <div className="mt-3 space-y-3">
                            {weakBullets.map((item) => (
                              <div
                                key={item.bullet}
                                className="rounded-[14px] border border-[var(--border-soft)] bg-[var(--surface-1)] p-4"
                              >
                                <p className="text-sm leading-7 text-[var(--foreground)]">{item.bullet}</p>
                                <p className="mt-3 text-sm leading-7 text-[var(--muted-foreground)]">
                                  Reads as {item.issues.join(", ")}.
                                </p>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="mt-3 text-sm leading-7 text-[var(--muted-foreground)]">
                            The bullet scanner did not flag major weak-line patterns in this resume.
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="mt-5 rounded-[14px] border border-[var(--border-soft)] bg-[var(--surface-1)] p-5">
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
                  <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-[var(--color-brand-300)]">
                    Supporting evidence
                  </p>
                  <h2 className="mt-4 text-2xl font-semibold text-[var(--foreground)]">Bonus signals</h2>
                  <div className="mt-5 space-y-3">
                    {scoreSummary.bonusSignals.map((signal) => (
                      <div key={signal} className="rounded-[14px] border border-[var(--border-soft)] bg-[var(--surface-1)] px-4 py-4">
                        <p className="text-sm leading-7 text-[var(--muted-foreground)]">{signal}</p>
                      </div>
                    ))}
                  </div>
                </Card>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
