import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

interface ComparisonAnalysis {
  id: string;
  title: string;
  overallScore: number | null;
  createdAt: string;
  roleTitle: string | null;
  keywordCoverage: number | null;
  mustHaveCoverage: number | null;
  readabilityScore: number | null;
  bulletQualityScore: number | null;
  matchedKeywords: string[];
  missingKeywords: string[];
  suggestions: Array<{
    title: string;
    priority: string;
  }>;
}

interface ComparisonDashboardProps {
  left: ComparisonAnalysis;
  right: ComparisonAnalysis;
}

function ComparisonColumn({ analysis, sideLabel }: { analysis: ComparisonAnalysis; sideLabel: string }) {
  return (
    <Card className="shadow-none">
      <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[var(--color-brand-300)]">{sideLabel}</p>
      <h2 className="mt-4 font-heading text-4xl font-semibold text-[var(--foreground)]">{analysis.title}</h2>
      <p className="mt-2 text-sm text-[var(--muted-foreground)]">
        {analysis.roleTitle ?? "Role not detected"} · {analysis.createdAt}
      </p>

      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        {[
          { label: "ATS score", value: analysis.overallScore ?? "--" },
          { label: "Keyword coverage", value: analysis.keywordCoverage !== null ? `${analysis.keywordCoverage}%` : "--" },
          { label: "Must-have coverage", value: analysis.mustHaveCoverage !== null ? `${analysis.mustHaveCoverage}%` : "--" },
          { label: "Readability", value: analysis.readabilityScore !== null ? `${analysis.readabilityScore}/100` : "--" },
          { label: "Bullet quality", value: analysis.bulletQualityScore !== null ? `${analysis.bulletQualityScore}/100` : "--" }
        ].map((item) => (
          <div key={item.label} className="border-t border-[var(--border-soft)] pt-4">
            <p className="text-xs uppercase tracking-[0.18em] text-[var(--muted-foreground)]">{item.label}</p>
            <p className="mt-3 font-heading text-4xl text-[var(--foreground)]">{item.value}</p>
          </div>
        ))}
      </div>

      <div className="mt-6 grid gap-4">
        <div className="border-t border-[var(--border-soft)] pt-4">
          <p className="text-xs uppercase tracking-[0.18em] text-[var(--muted-foreground)]">Matched keywords</p>
          <p className="mt-3 text-sm leading-7 text-[var(--foreground)]">
            {analysis.matchedKeywords.slice(0, 8).join(", ") || "No matched keywords yet."}
          </p>
        </div>
        <div className="border-t border-[var(--border-soft)] pt-4">
          <p className="text-xs uppercase tracking-[0.18em] text-[var(--muted-foreground)]">Missing keywords</p>
          <p className="mt-3 text-sm leading-7 text-[var(--foreground)]">
            {analysis.missingKeywords.slice(0, 8).join(", ") || "No missing keywords."}
          </p>
        </div>
        <div className="border-t border-[var(--border-soft)] pt-4">
          <p className="text-xs uppercase tracking-[0.18em] text-[var(--muted-foreground)]">Top suggestions</p>
          <div className="mt-3 space-y-3">
            {analysis.suggestions.slice(0, 3).map((suggestion) => (
              <div key={suggestion.title} className="flex items-start justify-between gap-3">
                <p className="text-sm leading-7 text-[var(--foreground)]">{suggestion.title}</p>
                <span className="border border-[var(--border-soft)] px-3 py-1 text-[11px] uppercase tracking-[0.16em] text-[var(--muted-foreground)]">
                  {suggestion.priority}
                </span>
              </div>
            ))}
            {analysis.suggestions.length === 0 ? (
              <p className="text-sm text-[var(--muted-foreground)]">No suggestions available yet.</p>
            ) : null}
          </div>
        </div>
      </div>

      <div className="mt-6">
        <Button asChild variant="secondary" className="w-full">
          <Link href={`/analyses/${analysis.id}`}>Open full dashboard</Link>
        </Button>
      </div>
    </Card>
  );
}

export function ComparisonDashboard({ left, right }: ComparisonDashboardProps) {
  return (
    <section className="px-6 py-16 lg:px-8 lg:py-20">
      <div className="mx-auto max-w-7xl">
        <div className="max-w-3xl">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[var(--color-brand-300)]">Comparison</p>
          <h1 className="mt-4 font-heading text-4xl font-semibold text-[var(--foreground)] sm:text-5xl">
            Compare two saved resume analyses side by side.
          </h1>
          <p className="mt-5 text-base leading-8 text-[var(--muted-foreground)]">
            Use the overview below to see which version has the stronger score, cleaner writing, and tighter role
            alignment before sending the next application.
          </p>
        </div>

        <div className="mt-8 grid gap-6 xl:grid-cols-2">
          <ComparisonColumn analysis={left} sideLabel="Left analysis" />
          <ComparisonColumn analysis={right} sideLabel="Right analysis" />
        </div>
      </div>
    </section>
  );
}
