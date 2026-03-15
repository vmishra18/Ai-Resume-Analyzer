import {
  Eye,
  Filter,
  Gauge,
  GitCompareArrows,
  ListChecks
} from "lucide-react";

import { Card } from "@/components/ui/card";
import { scoringWeights } from "@/features/analysis/lib/scoring-design";

const scoringPrinciples = [
  {
    icon: Eye,
    title: "Direct evidence matters",
    description: "Exact resume evidence carries more weight than loose semantic guesses."
  },
  {
    icon: ListChecks,
    title: "Must-haves stay separate",
    description: "Required skills are tracked independently instead of being buried inside general overlap."
  },
  {
    icon: Filter,
    title: "Noise gets stripped out",
    description: "Benefits copy, company blurbs, and low-signal fragments are filtered before scoring."
  },
  {
    icon: GitCompareArrows,
    title: "The result is explainable",
    description: "Every score change maps back to matched skills, missing terms, structure, or bullet quality."
  }
];

export function ScoringSection() {
  return (
    <section id="results" className="px-6 py-24 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="grid gap-10 border-t border-[var(--border-soft)] pt-10 lg:grid-cols-[0.86fr_1.14fr]">
          <div className="lg:sticky lg:top-28 lg:self-start">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[var(--color-brand-300)]">Scoring</p>
            <h2 className="mt-4 max-w-xl font-heading text-4xl font-semibold text-[var(--foreground)] sm:text-5xl">
              Know exactly where the number comes from.
            </h2>
            <p className="mt-5 max-w-xl text-lg leading-8 text-[var(--muted-foreground)]">
              Resume Signal blends role keywords, must-have coverage, structure, readability, and alignment into one
              score you can actually reason about.
            </p>

            <Card className="relative mt-8 overflow-hidden">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(80,103,242,0.22),transparent_32%),radial-gradient(circle_at_bottom_right,rgba(41,182,167,0.18),transparent_34%)]" />
              <div className="relative grid gap-8 lg:grid-cols-[180px_1fr] lg:items-center">
                <div className="mx-auto flex size-[180px] items-center justify-center rounded-full border border-[rgba(255,255,255,0.08)] bg-[linear-gradient(180deg,rgba(17,27,47,0.92),rgba(13,21,37,0.96))] shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]">
                  <div className="flex size-[132px] flex-col items-center justify-center rounded-full border border-[var(--border-soft)] bg-[rgba(10,16,30,0.78)] text-center">
                    <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-[var(--muted-foreground)]">
                      Weighted score
                    </p>
                    <p className="mt-2 font-heading text-5xl font-semibold text-[var(--foreground)]">100</p>
                    <p className="mt-1 text-xs uppercase tracking-[0.18em] text-[var(--color-brand-300)]">max points</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="inline-flex items-center gap-2 rounded-full border border-[var(--border-soft)] bg-[rgba(17,27,47,0.68)] px-4 py-2">
                    <Gauge className="size-4 text-[var(--color-brand-300)]" />
                    <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-[var(--foreground)]">
                      6 weighted categories + bonus signals
                    </span>
                  </div>

                  <p className="text-base leading-8 text-[var(--muted-foreground)]">
                    The score is not a black box. It is a visible blend of coverage, structure, and role fit, so users
                    can tell whether the next improvement should be a keyword fix, a rewrite, or a layout cleanup.
                  </p>

                  <div className="grid gap-3 sm:grid-cols-2">
                    {[
                      "Keyword overlap stays tied to the actual role language.",
                      "Must-have skills are separated from general nice-to-have terms.",
                      "Readability and bullet quality affect the score only after the basics are present.",
                      "The explanation layer surfaces why the score moved, not just the final number."
                    ].map((item) => (
                      <div key={item} className="rounded-[14px] border border-[var(--border-soft)] bg-[rgba(17,27,47,0.62)] px-4 py-3">
                        <p className="text-sm leading-7 text-[var(--muted-foreground)]">{item}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </Card>
          </div>

          <div className="space-y-5">
            {scoringWeights.map((item, index) => (
              <div
                key={item.key}
                className="grid gap-4 rounded-[24px] border border-[var(--border-soft)] bg-[rgba(17,27,47,0.68)] p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.03)] sm:grid-cols-[auto_minmax(0,1fr)_auto]"
              >
                <div className="flex size-12 items-center justify-center rounded-[14px] border border-[var(--border-soft)] bg-[var(--surface-2)] font-mono text-xs font-semibold uppercase tracking-[0.18em] text-[var(--muted-foreground)]">
                  0{index + 1}
                </div>

                <div>
                  <div className="flex flex-wrap items-center gap-3">
                    <h3 className="text-xl font-semibold text-[var(--foreground)]">{item.label}</h3>
                    <span className="rounded-full border border-[var(--border-soft)] bg-[var(--surface-2)] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--muted-foreground)]">
                      {item.weight}% weight
                    </span>
                  </div>
                  <p className="mt-3 max-w-2xl text-sm leading-7 text-[var(--muted-foreground)]">{item.description}</p>
                  <div className="mt-4 h-2 overflow-hidden rounded-full bg-[rgba(255,255,255,0.06)]">
                    <div
                      className="h-full rounded-full bg-[linear-gradient(90deg,var(--color-brand-400),var(--color-accent-500))]"
                      style={{ width: `${item.weight}%` }}
                    />
                  </div>
                </div>

                <div className="hidden items-center sm:flex">
                  <div className="rounded-[18px] border border-[rgba(255,255,255,0.08)] bg-[rgba(37,49,78,0.74)] px-4 py-3 text-center">
                    <p className="font-heading text-2xl font-semibold text-[var(--foreground)]">{item.weight}</p>
                    <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-[var(--muted-foreground)]">
                      points
                    </p>
                  </div>
                </div>
              </div>
            ))}

            <div className="grid gap-4 pt-2 sm:grid-cols-2">
              {scoringPrinciples.map((item) => {
                const Icon = item.icon;

                return (
                  <div
                    key={item.title}
                    className="rounded-[22px] border border-[var(--border-soft)] bg-[linear-gradient(180deg,rgba(18,28,48,0.82),rgba(13,20,36,0.92))] p-5"
                  >
                    <div className="flex size-11 items-center justify-center rounded-[14px] bg-[rgba(80,103,242,0.12)] text-[var(--color-brand-300)]">
                      <Icon className="size-5" />
                    </div>
                    <h3 className="mt-4 text-lg font-semibold text-[var(--foreground)]">{item.title}</h3>
                    <p className="mt-2 text-sm leading-7 text-[var(--muted-foreground)]">{item.description}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
