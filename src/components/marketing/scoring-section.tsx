import { Card } from "@/components/ui/card";
import { scoringWeights } from "@/features/analysis/lib/scoring-design";

const scoringNotes = [
  "Keywords from the job description are checked against your resume content.",
  "Must-have skills carry more weight than general overlap.",
  "Section completeness helps flag resumes that are missing important basics.",
  "Strong project content and clear experience details can improve the final score."
];

export function ScoringSection() {
  return (
    <section id="results" className="px-6 py-20 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="max-w-3xl">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[var(--color-brand-300)]">
            Results
          </p>
          <h2 className="mt-4 font-heading text-4xl text-white sm:text-5xl">
            Results that are easy to understand and act on.
          </h2>
          <p className="mt-5 text-lg leading-8 text-[var(--muted-foreground)]">
            Your score combines keyword coverage, must-have skills, section checks, role relevance, resume structure,
            and overall job alignment.
          </p>
        </div>

        <div className="mt-12 grid gap-5 lg:grid-cols-[1fr_0.8fr]">
          <Card>
            <div className="space-y-4">
              {scoringWeights.map((item) => (
                <div
                  key={item.key}
                  className="grid gap-4 rounded-2xl border border-white/8 bg-white/4 p-4 md:grid-cols-[1fr_auto]"
                >
                  <div>
                    <h3 className="text-lg font-semibold text-white">{item.label}</h3>
                    <p className="mt-2 text-sm leading-7 text-[var(--muted-foreground)]">
                      {item.description}
                    </p>
                  </div>
                  <div className="rounded-full border border-white/10 bg-white/8 px-4 py-2 text-sm font-semibold text-white">
                    {item.weight}%
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <Card>
            <h3 className="text-2xl font-semibold text-white">What the score helps you see</h3>
            <div className="mt-6 space-y-3">
              {scoringNotes.map((note) => (
                <div key={note} className="rounded-2xl border border-white/8 bg-white/4 px-4 py-3">
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
