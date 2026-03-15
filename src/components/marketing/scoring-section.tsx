import { Card } from "@/components/ui/card";
import { scoringWeights } from "@/features/analysis/lib/scoring-design";

const resultHighlights = [
  "Skill aliases are normalized so ReactJS still matches React and JS still counts as JavaScript.",
  "Years-of-experience cues are treated as evidence instead of being surfaced as awkward literal keywords.",
  "Readability and bullet quality help explain whether the resume is easy to scan once the right terms are present.",
  "Company overview and benefits copy are filtered out so the score stays focused on actual requirements."
];

export function ScoringSection() {
  return (
    <section id="results" className="px-6 py-20 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="max-w-3xl">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[var(--color-brand-300)]">Scoring</p>
          <h2 className="mt-4 font-heading text-4xl text-[var(--foreground)] sm:text-5xl">
            A score you can actually reason about.
          </h2>
          <p className="mt-5 text-lg leading-8 text-[var(--muted-foreground)]">
            The report combines role-specific keyword coverage, must-have skills, structure, readability, and role
            alignment so you can see both fit and what to improve next.
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
            <h3 className="text-2xl font-semibold text-[var(--foreground)]">Why the score is useful</h3>
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
