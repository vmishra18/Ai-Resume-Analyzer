import { Card } from "@/components/ui/card";
import { scoringWeights } from "@/features/analysis/lib/scoring-design";

const resultHighlights = [
  "Skill aliases are normalised so ReactJS still matches React and JS still counts as JavaScript.",
  "Years-of-experience signals are treated as evidence, not as awkward literal missing keywords.",
  "Readability and bullet quality surface whether the resume is easy to scan once the right keywords are present.",
  "Company overview sections and benefits copy are filtered down so the score stays focused on actual requirements."
];

export function ScoringSection() {
  return (
    <section id="results" className="px-6 py-20 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="max-w-3xl">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[var(--color-brand-300)]">Results</p>
          <h2 className="mt-4 font-heading text-4xl text-[var(--foreground)] sm:text-5xl">
            A clearer score and a stronger explanation above the fold.
          </h2>
          <p className="mt-5 text-lg leading-8 text-[var(--muted-foreground)]">
            The score now reflects canonical skill overlap, must-have coverage, structure, readability, role relevance,
            and job alignment rather than brittle phrase matching.
          </p>
        </div>

        <div className="mt-12 grid gap-5 lg:grid-cols-[1fr_0.82fr]">
          <Card>
            <div className="space-y-4">
              {scoringWeights.map((item) => (
                <div
                  key={item.key}
                  className="grid gap-4 rounded-2xl border border-[var(--border-soft)] bg-[var(--surface-2)] p-4 md:grid-cols-[1fr_auto]"
                >
                  <div>
                    <h3 className="text-lg font-semibold text-[var(--foreground)]">{item.label}</h3>
                    <p className="mt-2 text-sm leading-7 text-[var(--muted-foreground)]">{item.description}</p>
                  </div>
                  <div className="rounded-full border border-[var(--border-soft)] bg-[var(--surface-3)] px-4 py-2 text-sm font-semibold text-[var(--foreground)]">
                    {item.weight}%
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <Card>
            <h3 className="text-2xl font-semibold text-[var(--foreground)]">What changed in the score</h3>
            <div className="mt-6 space-y-3">
              {resultHighlights.map((note) => (
                <div key={note} className="rounded-2xl border border-[var(--border-soft)] bg-[var(--surface-2)] px-4 py-3">
                  <p className="text-sm leading-7 text-[var(--muted-foreground)]">{note}</p>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </section>
  );
}
