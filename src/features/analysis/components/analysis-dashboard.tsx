"use client";

import Link from "next/link";
import type { Route } from "next";
import { useState } from "react";
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
import { KeywordReviewPanel } from "@/features/analysis/components/keyword-review-panel";
import { RewriteCopyButton } from "@/features/analysis/components/rewrite-copy-button";
import { ScoreBreakdownChart } from "@/features/analysis/components/score-breakdown-chart";

type RoleFamily = "frontend" | "backend" | "product" | "data" | "devops" | "qa" | "general" | null;
type RoleAlignment = "aligned" | "adjacent" | "mismatch" | "unknown";
type ConfidenceLevel = "high" | "medium" | "low";
type DashboardTab = "overview" | "keywords" | "rewrite" | "evidence";

export interface AnalysisDashboardProps {
  sessionId: string;
  sessionTitle: string;
  status: string;
  createdAt: string;
  overallScore: number | null;
  scoreBreakdown: Array<{
    label: string;
    value: number;
  }>;
  scoreDrivers: Array<{
    label: string;
    value: string;
    score: number;
    summary: string;
  }>;
  confidence: {
    parser: {
      level: ConfidenceLevel;
      tone: ConfidenceLevel;
      label: string;
      summary: string;
      notes: string[];
    };
    scoring: {
      level: ConfidenceLevel;
      tone: ConfidenceLevel;
      label: string;
      summary: string;
      notes: string[];
    };
  };
  summaryCards: {
    strengths: Array<{
      label: string;
      reason: string;
    }>;
    gaps: Array<{
      label: string;
      reason: string;
    }>;
    nextMove: string;
  };
  scoreSummary: {
    keywordCoverage: number;
    matchedKeywords: number;
    partialKeywords: number;
    totalKeywords: number;
    mustHaveCoverage: number;
    matchedMustHaveCount: number;
    partialMustHaveCount: number;
    totalMustHaveCount: number;
    readabilityScore: number;
    bulletQualityScore: number;
    estimatedYearsExperience: number | null;
    requiredYearsExperience: number | null;
    bonusSignals: string[];
    canonicalMatchedKeywords: string[];
    canonicalPartialKeywords: string[];
    canonicalMissingKeywords: string[];
    filteredOutPhrases: string[];
    roleFamily: RoleFamily;
    resumeRoleFamily: RoleFamily;
    roleFamilyAlignment: RoleAlignment;
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
  keywordReview: {
    mustHaveKeywordsText: string;
    supportingKeywordsText: string;
    extractedKeywordCount: number;
    filteredOutPhrases: string[];
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
    reviewHref?: Route;
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

function getConfidenceTone(level: ConfidenceLevel) {
  switch (level) {
    case "high":
      return "border-[var(--tone-success-border)] bg-[var(--tone-success-bg)] text-[var(--tone-success-foreground)]";
    case "medium":
      return "border-[var(--tone-warning-border)] bg-[var(--tone-warning-bg)] text-[var(--tone-warning-foreground)]";
    default:
      return "border-[var(--tone-danger-border)] bg-[var(--tone-danger-bg)] text-[var(--tone-danger-foreground)]";
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
        "The service is still extracting text and computing role fit. Refresh in a moment if this state persists."
    };
  }

  if (status === "PENDING" && hasParsedResume) {
    return {
      title: "Resume parsed, waiting for job-match scoring",
      description: "Resume text was extracted successfully, but a job description was not available for full scoring."
    };
  }

  return null;
}

function formatRoleFamilyLabel(value: RoleFamily) {
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

function formatAlignmentLabel(value: RoleAlignment) {
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

function getAlignmentTone(value: RoleAlignment) {
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
  scoreSummary: AnalysisDashboardProps["scoreSummary"];
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
      `Some skills are only being inferred indirectly, like ${scoreSummary.semanticMatches
        .slice(0, 2)
        .map((match) => `${match.keyword} via ${match.evidence}`)
        .join(" and ")}. Naming them directly would strengthen the match.`
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

function ConfidenceCard({
  title,
  level,
  summary,
  notes
}: {
  title: string;
  level: ConfidenceLevel;
  summary: string;
  notes: string[];
}) {
  return (
    <div className="rounded-[16px] border border-[var(--border-soft)] bg-[var(--surface-1)] p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-[var(--muted-foreground)]">{title}</p>
          <p className="mt-3 text-base font-semibold text-[var(--foreground)]">{summary}</p>
        </div>
        <span className={`rounded-full border px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] ${getConfidenceTone(level)}`}>
          {level}
        </span>
      </div>
      <div className="mt-4 space-y-2">
        {notes.map((note) => (
          <p key={note} className="text-sm leading-7 text-[var(--muted-foreground)]">
            {note}
          </p>
        ))}
      </div>
    </div>
  );
}

export function AnalysisDashboard({
  sessionId,
  sessionTitle,
  status,
  createdAt,
  overallScore,
  scoreBreakdown,
  scoreDrivers,
  confidence,
  summaryCards,
  scoreSummary,
  roleMeta,
  keywordReview,
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
  const [activeTab, setActiveTab] = useState<DashboardTab>("overview");
  const statusMessage = getStatusMessage(status, Boolean(parsedResume));
  const prioritizedSuggestions = [...suggestions]
    .sort((left, right) => {
      const priorityDelta = getPriorityWeight(left.priority) - getPriorityWeight(right.priority);

      return priorityDelta !== 0 ? priorityDelta : left.title.localeCompare(right.title);
    })
    .slice(0, 4);
  const scoreNarrative = buildScoreNarrative({
    overallScore,
    scoreSummary,
    missingKeywordCount: missingKeywords.length
  });
  const overviewStats = [
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
  const tabs: Array<{ id: DashboardTab; label: string }> = [
    { id: "overview", label: "Overview" },
    { id: "keywords", label: "Keywords" },
    { id: "rewrite", label: "Rewrite help" },
    { id: "evidence", label: "Raw evidence" }
  ];

  return (
    <section className="px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
      <div className="mx-auto max-w-7xl space-y-6">
        <Card className="overflow-hidden">
          <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
            <div className="space-y-6">
              <div className="flex flex-wrap items-center gap-3">
                <span className="rounded-full border border-[var(--border-soft)] bg-[var(--surface-2)] px-3 py-1 font-mono text-[11px] uppercase tracking-[0.16em] text-[var(--color-brand-300)]">
                  {headerBadge}
                </span>
                <span className={`rounded-full border px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] ${getStatusTone(status)}`}>
                  {status}
                </span>
              </div>

              <div>
                <h1 className="max-w-4xl font-heading text-4xl font-semibold leading-tight text-[var(--foreground)] sm:text-5xl [overflow-wrap:anywhere]">
                  {sessionTitle}
                </h1>
                <p className="mt-4 max-w-3xl text-base leading-8 text-[var(--muted-foreground)]">
                  Start with the decision-making summary below, then open the tabs only when you need to inspect how the
                  score was built.
                </p>
              </div>

              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                {overviewStats.map((item) => {
                  const Icon = item.icon;

                  return (
                    <div key={item.label} className="rounded-[16px] border border-[var(--border-soft)] bg-[color-mix(in_srgb,var(--surface-1)_76%,transparent)] px-4 py-4">
                      <div className="flex items-center gap-2 text-[var(--muted-foreground)]">
                        <Icon className="size-4" />
                        <p className="font-mono text-[11px] uppercase tracking-[0.18em]">{item.label}</p>
                      </div>
                      <p className="mt-3 text-base font-semibold text-[var(--foreground)]">{item.value}</p>
                    </div>
                  );
                })}
              </div>

              {statusMessage ? (
                <div className="rounded-[16px] border border-[var(--border-soft)] bg-[var(--surface-1)] p-4">
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

            <div className="rounded-[24px] border border-[var(--border-soft)] bg-[var(--panel-strong)] p-6">
              <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-[var(--muted-foreground)]">Overall score</p>
              <p className={`mt-4 font-heading text-8xl leading-none ${getScoreTone(overallScore)}`}>{overallScore ?? "--"}</p>
              <p className="mt-4 text-sm leading-7 text-[var(--muted-foreground)]">
                A high score is only useful when it is supported by clear evidence. The cards below show what is helping,
                what is missing, and what to fix next.
              </p>

              <div className="mt-6 space-y-3">
                <div className="rounded-[16px] border border-[var(--border-soft)] bg-[var(--surface-1)] p-4">
                  <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-[var(--muted-foreground)]">Top strengths</p>
                  <div className="mt-3 space-y-3">
                    {summaryCards.strengths.length > 0 ? (
                      summaryCards.strengths.map((item) => (
                        <div key={item.label}>
                          <p className="text-sm font-semibold text-[var(--foreground)]">{item.label}</p>
                          <p className="mt-1 text-sm leading-7 text-[var(--muted-foreground)]">{item.reason}</p>
                        </div>
                      ))
                    ) : (
                      <p className="text-sm leading-7 text-[var(--muted-foreground)]">
                        Strengths appear once direct resume-to-role matches have been detected.
                      </p>
                    )}
                  </div>
                </div>

                <div className="rounded-[16px] border border-[var(--border-soft)] bg-[var(--surface-1)] p-4">
                  <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-[var(--muted-foreground)]">Highest-priority gaps</p>
                  <div className="mt-3 space-y-3">
                    {summaryCards.gaps.length > 0 ? (
                      summaryCards.gaps.map((item) => (
                        <div key={item.label}>
                          <p className="text-sm font-semibold text-[var(--foreground)]">{item.label}</p>
                          <p className="mt-1 text-sm leading-7 text-[var(--muted-foreground)]">{item.reason}</p>
                        </div>
                      ))
                    ) : (
                      <p className="text-sm leading-7 text-[var(--muted-foreground)]">
                        No major role gaps are being surfaced right now.
                      </p>
                    )}
                  </div>
                </div>

                <div className="rounded-[16px] border border-[var(--tone-info-border)] bg-[var(--tone-info-bg)] p-4">
                  <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-[var(--tone-info-foreground)]">What to fix next</p>
                  <p className="mt-3 text-sm leading-7 text-[var(--foreground)]">{summaryCards.nextMove}</p>
                </div>
              </div>
            </div>
          </div>
        </Card>

        <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
          <Card>
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-[var(--color-brand-300)]">Scoring trace</p>
                <h2 className="mt-4 text-2xl font-semibold text-[var(--foreground)]">How the score is built</h2>
                <p className="mt-3 text-sm leading-7 text-[var(--muted-foreground)]">
                  The chart shows the weighted contribution from each scoring area. Use the driver list below it to see
                  what each number actually means.
                </p>
              </div>
              <Gauge className="mt-1 hidden size-5 text-[var(--color-brand-300)] sm:block" />
            </div>
            <div className="mt-6">
              {scoreBreakdown.length > 0 ? (
                <ScoreBreakdownChart data={scoreBreakdown} />
              ) : (
                <div className="flex min-h-[260px] items-center justify-center rounded-[16px] border border-dashed border-[var(--border-soft)] px-6 text-center text-sm leading-7 text-[var(--muted-foreground)]">
                  The score breakdown appears once resume text extraction and job-description scoring complete.
                </div>
              )}
            </div>
          </Card>

          <Card className="space-y-4">
            <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-[var(--color-brand-300)]">Trust check</p>
            <h2 className="text-2xl font-semibold text-[var(--foreground)]">How much to trust this result</h2>
            <ConfidenceCard {...confidence.parser} title={confidence.parser.label} />
            <ConfidenceCard {...confidence.scoring} title={confidence.scoring.label} />
          </Card>
        </div>

        <Card>
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-[var(--color-brand-300)]">Workspace</p>
              <h2 className="mt-3 text-2xl font-semibold text-[var(--foreground)]">Dive deeper only when you need it</h2>
            </div>
            {actions ? (
              <div className="flex flex-col gap-3 sm:flex-row">
                {actions.reviewHref ? (
                  <Button asChild variant="secondary" size="sm">
                    <Link href={actions.reviewHref}>Review keywords</Link>
                  </Button>
                ) : null}
                <Button asChild variant="secondary" size="sm">
                  <Link href={actions.historyHref}>History</Link>
                </Button>
                <Button asChild size="sm">
                  <Link href={actions.uploadHref}>New analysis</Link>
                </Button>
              </div>
            ) : null}
          </div>

          <div className="mt-6 flex flex-wrap gap-2 border-b border-[var(--border-soft)] pb-3">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                type="button"
                className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                  activeTab === tab.id
                    ? "bg-[rgba(245,106,72,0.12)] text-[var(--foreground)]"
                    : "text-[var(--muted-foreground)] hover:bg-[color-mix(in_srgb,var(--surface-1)_78%,transparent)] hover:text-[var(--foreground)]"
                }`}
                onClick={() => setActiveTab(tab.id)}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {activeTab === "overview" ? (
            <div className="mt-8 space-y-6">
              <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
                <div className="space-y-4">
                  {scoreDrivers.length > 0 ? (
                    scoreDrivers.map((item) => (
                      <div key={item.label} className="rounded-[16px] border border-[var(--border-soft)] bg-[var(--surface-1)] p-4">
                        <div className="flex items-center justify-between gap-4">
                          <div>
                            <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-[var(--muted-foreground)]">
                              {item.label}
                            </p>
                            <p className="mt-2 text-2xl font-semibold text-[var(--foreground)]">{item.value}</p>
                          </div>
                          <div className="rounded-full border border-[var(--border-soft)] bg-[var(--surface-2)] px-4 py-2 text-sm font-semibold text-[var(--foreground)]">
                            {item.score} pts
                          </div>
                        </div>
                        <p className="mt-3 text-sm leading-7 text-[var(--muted-foreground)]">{item.summary}</p>
                      </div>
                    ))
                  ) : (
                    <div className="rounded-[16px] border border-[var(--border-soft)] bg-[var(--surface-1)] p-4">
                      <p className="text-sm leading-7 text-[var(--muted-foreground)]">
                        Score drivers appear once the analysis has enough role-specific evidence to break the result down.
                      </p>
                    </div>
                  )}
                </div>

                <div className="space-y-6">
                  <Card className="border-0 bg-[var(--surface-1)] shadow-none">
                    <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-[var(--color-brand-300)]">Score explanation</p>
                    <h3 className="mt-4 text-2xl font-semibold text-[var(--foreground)]">{scoreNarrative.title}</h3>
                    <p className="mt-4 text-sm leading-7 text-[var(--muted-foreground)]">{scoreNarrative.summary}</p>
                    <div className="mt-5 space-y-3">
                      {scoreNarrative.points.map((point, index) => (
                        <div key={point} className="rounded-[14px] border border-[var(--border-soft)] bg-[var(--surface-2)] px-4 py-4">
                          <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-[var(--muted-foreground)]">
                            Driver {index + 1}
                          </p>
                          <p className="mt-2 text-sm leading-7 text-[var(--foreground)]">{point}</p>
                        </div>
                      ))}
                    </div>
                  </Card>

                  <Card className="border-0 bg-[var(--surface-1)] shadow-none">
                    <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-[var(--color-brand-300)]">Fit diagnosis</p>
                    <h3 className="mt-4 text-2xl font-semibold text-[var(--foreground)]">Role and seniority read</h3>
                    {scoreSummary ? (
                      <div className="mt-5 space-y-4">
                        <div className="grid gap-3 sm:grid-cols-2">
                          <div className="rounded-[14px] border border-[var(--border-soft)] bg-[var(--surface-2)] px-4 py-4">
                            <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-[var(--muted-foreground)]">
                              Target family
                            </p>
                            <p className="mt-2 text-xl font-semibold text-[var(--foreground)]">
                              {formatRoleFamilyLabel(scoreSummary.roleFamily)}
                            </p>
                          </div>
                          <div className="rounded-[14px] border border-[var(--border-soft)] bg-[var(--surface-2)] px-4 py-4">
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

                        <div className="rounded-[14px] border border-[var(--border-soft)] bg-[var(--surface-2)] p-4">
                          <div className="flex items-start gap-3">
                            {scoreSummary.seniorityMismatch.hasMismatch ? (
                              <CircleAlert className="mt-0.5 size-5 text-[var(--tone-warning-foreground)]" />
                            ) : (
                              <CheckCircle2 className="mt-0.5 size-5 text-[var(--tone-success-foreground)]" />
                            )}
                            <div>
                              <p className="text-base font-semibold text-[var(--foreground)]">
                                {scoreSummary.seniorityMismatch.hasMismatch
                                  ? "Seniority mismatch detected"
                                  : "Seniority looks broadly consistent"}
                              </p>
                              <p className="mt-2 text-sm leading-7 text-[var(--muted-foreground)]">
                                {scoreSummary.seniorityMismatch.summary ??
                                  "The current resume and job description are not showing a major seniority gap."}
                              </p>
                            </div>
                          </div>
                        </div>

                        <div className="rounded-[14px] border border-[var(--border-soft)] bg-[var(--surface-2)] p-4">
                          <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-[var(--muted-foreground)]">
                            Semantic matches
                          </p>
                          {scoreSummary.semanticMatches.length > 0 ? (
                            <div className="mt-3 space-y-3">
                              {scoreSummary.semanticMatches.map((match) => (
                                <div key={`${match.keyword}-${match.evidence}`}>
                                  <p className="text-sm font-semibold text-[var(--foreground)]">{match.keyword}</p>
                                  <p className="mt-1 text-sm leading-7 text-[var(--muted-foreground)]">
                                    Nearby evidence found via <span className="text-[var(--foreground)]">{match.evidence}</span>.
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
                </div>
              </div>
            </div>
          ) : null}

          {activeTab === "keywords" ? (
            <div className="mt-8 space-y-6">
              {keywordReview ? (
                <Card className="border-0 bg-[var(--surface-1)] shadow-none">
                  <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-[var(--color-brand-300)]">Review scoring inputs</p>
                  <h3 className="mt-4 text-2xl font-semibold text-[var(--foreground)]">Adjust the role keywords before trusting close calls</h3>
                  <p className="mt-3 max-w-3xl text-sm leading-7 text-[var(--muted-foreground)]">
                    If the extractor missed a requirement or over-weighted a noisy phrase, edit the lists below and rerun
                    the score using the parsed resume that is already saved.
                  </p>
                  <div className="mt-6">
                    <KeywordReviewPanel
                      sessionId={sessionId}
                      mustHaveKeywordsText={keywordReview.mustHaveKeywordsText}
                      supportingKeywordsText={keywordReview.supportingKeywordsText}
                      extractedKeywordCount={keywordReview.extractedKeywordCount}
                      filteredOutPhrases={keywordReview.filteredOutPhrases}
                    />
                  </div>
                </Card>
              ) : null}

              <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
                <Card className="border-0 bg-[var(--surface-1)] shadow-none">
                  <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-[var(--color-brand-300)]">Signal map</p>
                  <h3 className="mt-4 text-2xl font-semibold text-[var(--foreground)]">Keyword evidence</h3>
                  <div className="mt-5 space-y-5">
                    <KeywordGroup title="Matched" emptyMessage="No matched keywords yet." items={matchedKeywords} tone="success" />
                    <KeywordGroup title="Partial" emptyMessage="No partial keyword matches." items={partialKeywords} tone="warning" limit={10} />
                    <KeywordGroup title="Missing" emptyMessage="No missing keywords." items={missingKeywords} tone="danger" />
                  </div>
                </Card>

                <Card className="border-0 bg-[var(--surface-1)] shadow-none">
                  <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-[var(--color-brand-300)]">Role notes</p>
                  <h3 className="mt-4 text-2xl font-semibold text-[var(--foreground)]">Job description insights</h3>
                  {roleMeta ? (
                    <div className="mt-5 space-y-5">
                      <div className="grid gap-3 sm:grid-cols-3">
                        <div className="rounded-[14px] border border-[var(--border-soft)] bg-[var(--surface-2)] px-4 py-4">
                          <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-[var(--muted-foreground)]">Role</p>
                          <p className="mt-2 text-base font-semibold text-[var(--foreground)]">{roleMeta.title ?? "Not detected"}</p>
                        </div>
                        <div className="rounded-[14px] border border-[var(--border-soft)] bg-[var(--surface-2)] px-4 py-4">
                          <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-[var(--muted-foreground)]">Seniority</p>
                          <p className="mt-2 text-base font-semibold text-[var(--foreground)]">{roleMeta.seniority ?? "Not detected"}</p>
                        </div>
                        <div className="rounded-[14px] border border-[var(--border-soft)] bg-[var(--surface-2)] px-4 py-4">
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

                      <details className="rounded-[14px] border border-[var(--border-soft)] bg-[var(--surface-2)] p-4">
                        <summary className="cursor-pointer text-sm font-semibold text-[var(--foreground)]">Role text used for scoring</summary>
                        <p className="mt-4 whitespace-pre-wrap break-words text-sm leading-7 text-[var(--foreground)]">
                          {jobDescriptionRawText ?? "No job description was provided for this session."}
                        </p>
                      </details>
                    </div>
                  ) : (
                    <p className="mt-4 text-sm leading-7 text-[var(--muted-foreground)]">
                      Upload a job description to unlock keyword extraction, must-have classification, and role scoring.
                    </p>
                  )}
                </Card>
              </div>
            </div>
          ) : null}

          {activeTab === "rewrite" ? (
            <div className="mt-8 grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
              <Card className="border-0 bg-[var(--surface-1)] shadow-none">
                <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-[var(--color-brand-300)]">Priority queue</p>
                <h3 className="mt-4 text-2xl font-semibold text-[var(--foreground)]">Top edits to make first</h3>
                <p className="mt-3 text-sm leading-7 text-[var(--muted-foreground)]">
                  Start here if you want the fastest improvement without rewriting the whole resume.
                </p>
                {prioritizedSuggestions.length > 0 ? (
                  <div className="mt-5 space-y-4">
                    {prioritizedSuggestions.map((suggestion, index) => (
                      <div key={suggestion.id} className="rounded-[14px] border border-[var(--border-soft)] bg-[var(--surface-2)] p-4">
                        <div className="flex items-center justify-between gap-3">
                          <div className="flex items-center gap-2">
                            <span className="flex size-6 items-center justify-center rounded-full border border-[var(--border-soft)] bg-[var(--surface-1)] font-mono text-[11px] text-[var(--muted-foreground)]">
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

              <div className="space-y-6">
                <Card className="border-0 bg-[var(--surface-1)] shadow-none">
                  <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-[var(--color-brand-300)]">Rewrite assist</p>
                  <h3 className="mt-4 text-2xl font-semibold text-[var(--foreground)]">Suggested line upgrades</h3>
                  {scoreSummary?.rewriteAssist.length ? (
                    <div className="mt-5 space-y-4">
                      {scoreSummary.rewriteAssist.map((item, index) => (
                        <div key={item.id} className="rounded-[14px] border border-[var(--border-soft)] bg-[var(--surface-2)] p-4">
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
                            <div className="mt-3 rounded-[12px] border border-[var(--border-soft)] bg-[var(--surface-1)] p-3">
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
                      Rewrite drafts appear after the engine identifies weak bullets or missing must-have evidence.
                    </p>
                  )}
                </Card>

                <Card className="border-0 bg-[var(--surface-1)] shadow-none">
                  <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-[var(--color-brand-300)]">Weak bullet detector</p>
                  <h3 className="mt-4 text-2xl font-semibold text-[var(--foreground)]">Lines that still read softly</h3>
                  {scoreSummary?.weakBullets.length ? (
                    <div className="mt-5 space-y-3">
                      {scoreSummary.weakBullets.map((item) => (
                        <div key={item.bullet} className="rounded-[14px] border border-[var(--border-soft)] bg-[var(--surface-2)] p-4">
                          <p className="text-sm leading-7 text-[var(--foreground)]">{item.bullet}</p>
                          <p className="mt-3 text-sm leading-7 text-[var(--muted-foreground)]">
                            Reads as {item.issues.join(", ")}.
                          </p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="mt-4 text-sm leading-7 text-[var(--muted-foreground)]">
                      The bullet scanner did not flag major weak-line patterns in this resume.
                    </p>
                  )}
                </Card>
              </div>
            </div>
          ) : null}

          {activeTab === "evidence" ? (
            <div className="mt-8 grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
              <div className="space-y-6">
                <Card className="border-0 bg-[var(--surface-1)] shadow-none">
                  <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-[var(--color-brand-300)]">Source file</p>
                  <h3 className="mt-4 text-2xl font-semibold text-[var(--foreground)]">Resume intake summary</h3>
                  {fileMeta ? (
                    <div className="mt-5 grid gap-3 sm:grid-cols-3">
                      <div className="rounded-[14px] border border-[var(--border-soft)] bg-[var(--surface-2)] px-4 py-4">
                        <div className="flex items-center gap-2 text-[var(--muted-foreground)]">
                          <FileText className="size-4" />
                          <p className="font-mono text-[11px] uppercase tracking-[0.18em]">Filename</p>
                        </div>
                        <p className="mt-3 break-all text-sm font-medium text-[var(--foreground)]">{fileMeta.originalName}</p>
                      </div>
                      <div className="rounded-[14px] border border-[var(--border-soft)] bg-[var(--surface-2)] px-4 py-4">
                        <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-[var(--muted-foreground)]">File type</p>
                        <p className="mt-3 break-all text-sm font-medium text-[var(--foreground)]">{fileMeta.mimeType}</p>
                      </div>
                      <div className="rounded-[14px] border border-[var(--border-soft)] bg-[var(--surface-2)] px-4 py-4">
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

                <Card className="border-0 bg-[var(--surface-1)] shadow-none">
                  <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-[var(--color-brand-300)]">Parse trace</p>
                  <h3 className="mt-4 text-2xl font-semibold text-[var(--foreground)]">Parsed resume evidence</h3>
                  {parsedResume ? (
                    <div className="mt-5 space-y-5">
                      <div className="grid gap-3 sm:grid-cols-2">
                        <div className="rounded-[14px] border border-[var(--border-soft)] bg-[var(--surface-2)] px-4 py-4">
                          <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-[var(--muted-foreground)]">Word count</p>
                          <p className="mt-2 text-2xl font-semibold text-[var(--foreground)]">{parsedResume.wordCount}</p>
                        </div>
                        <div className="rounded-[14px] border border-[var(--border-soft)] bg-[var(--surface-2)] px-4 py-4">
                          <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-[var(--muted-foreground)]">Structure score</p>
                          <p className="mt-2 text-2xl font-semibold text-[var(--foreground)]">{parsedResume.structureScore}/100</p>
                        </div>
                      </div>

                      <div className="grid gap-3 sm:grid-cols-2">
                        {parsedResume.sections.map((item) => (
                          <div key={item.label} className="rounded-[14px] border border-[var(--border-soft)] bg-[var(--surface-2)] px-4 py-4">
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

                      <div className="rounded-[14px] border border-[var(--border-soft)] bg-[var(--surface-2)] p-4">
                        <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-[var(--muted-foreground)]">Extracted summary</p>
                        <p className="mt-3 text-sm leading-7 text-[var(--foreground)]">
                          {parsedResume.summary ?? "No summary section was detected, so the parser could not extract one."}
                        </p>
                      </div>

                      <details className="rounded-[14px] border border-[var(--border-soft)] bg-[var(--surface-2)] p-4">
                        <summary className="cursor-pointer text-sm font-semibold text-[var(--foreground)]">Normalized text preview</summary>
                        <p className="mt-4 whitespace-pre-wrap text-sm leading-7 text-[var(--foreground)]">{parsedResume.normalizedPreview}</p>
                      </details>
                    </div>
                  ) : (
                    <div className="mt-5 rounded-[14px] border border-[var(--border-soft)] bg-[var(--surface-2)] p-5">
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
              </div>

              <div className="space-y-6">
                <Card className="border-0 bg-[var(--surface-1)] shadow-none">
                  <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-[var(--color-brand-300)]">Detected signals</p>
                  <h3 className="mt-4 text-2xl font-semibold text-[var(--foreground)]">Achievement and bonus evidence</h3>
                  <div className="mt-5 space-y-5">
                    <div>
                      <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-[var(--muted-foreground)]">Achievement signals</p>
                      {scoreSummary?.achievementSignals.length ? (
                        <div className="mt-3 space-y-3">
                          {scoreSummary.achievementSignals.map((item) => (
                            <div key={item.bullet} className="rounded-[14px] border border-[var(--border-soft)] bg-[var(--surface-2)] p-4">
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
                      <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-[var(--muted-foreground)]">Bonus signals</p>
                      {scoreSummary?.bonusSignals.length ? (
                        <div className="mt-3 space-y-3">
                          {scoreSummary.bonusSignals.map((signal) => (
                            <div key={signal} className="rounded-[14px] border border-[var(--border-soft)] bg-[var(--surface-2)] px-4 py-4">
                              <p className="text-sm leading-7 text-[var(--foreground)]">{signal}</p>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="mt-3 text-sm leading-7 text-[var(--muted-foreground)]">
                          No bonus signals were captured beyond the main scoring categories.
                        </p>
                      )}
                    </div>
                  </div>
                </Card>

                <Card className="border-0 bg-[var(--surface-1)] shadow-none">
                  <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-[var(--color-brand-300)]">Raw role evidence</p>
                  <h3 className="mt-4 text-2xl font-semibold text-[var(--foreground)]">Original role text</h3>
                  <details className="mt-5 rounded-[14px] border border-[var(--border-soft)] bg-[var(--surface-2)] p-4" open>
                    <summary className="cursor-pointer text-sm font-semibold text-[var(--foreground)]">Open role description</summary>
                    <p className="mt-4 whitespace-pre-wrap break-words text-sm leading-7 text-[var(--foreground)]">
                      {jobDescriptionRawText ?? "No job description was provided for this session."}
                    </p>
                  </details>
                </Card>
              </div>
            </div>
          ) : null}
        </Card>
      </div>
    </section>
  );
}
