import { Card } from "@/components/ui/card";

const scenarios = [
  {
    title: "You have one job in mind and need a sharper application tonight",
    points: [
      "Paste the job description and see whether your current resume already covers the stack and responsibilities.",
      "Use the missing-skills list to decide what to add before applying.",
      "Tighten the summary and top bullets without guessing what matters."
    ]
  },
  {
    title: "You keep multiple resume versions and want to know which one is stronger",
    points: [
      "Save each analysis in your history instead of renaming files manually.",
      "Open two reports side by side and compare score, stack coverage, and readability.",
      "Choose the stronger version for the role instead of relying on gut feel."
    ]
  },
  {
    title: "You are applying across different role families in the same week",
    points: [
      "Switch from frontend to product engineering, data, DevOps, or QA roles without losing your past runs.",
      "See how the important terms change by role and where your resume needs retargeting.",
      "Avoid over-optimising for one job at the cost of another."
    ]
  }
];

export function ArchitectureSection() {
  return (
    <section id="scenarios" className="px-6 py-20 lg:px-8">
      <div className="mx-auto grid max-w-7xl gap-6 lg:grid-cols-[0.88fr_1.12fr]">
        <Card>
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[var(--color-brand-300)]">Scenarios</p>
          <h2 className="mt-4 font-heading text-4xl text-[var(--foreground)] sm:text-5xl">
            Designed around the way people actually tailor resumes.
          </h2>
          <p className="mt-5 text-base leading-8 text-[var(--muted-foreground)]">
            Resume Signal is most useful when you already have a draft and need clear direction. It helps you decide
            what to keep, what to rewrite, and which version deserves the next application.
          </p>

          <div className="mt-8 space-y-4">
            {[
              "Bring one resume and one job description when you need a quick confidence check.",
              "Bring two resume versions when you want to know which one is actually stronger.",
              "Bring repeated applications over time when you want a private history of what is improving."
            ].map((item, index) => (
              <div key={item} className="flex gap-4 rounded-2xl border border-[var(--border-soft)] bg-[var(--surface-2)] p-4">
                <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-[var(--color-brand-500)] font-semibold text-white">
                  {index + 1}
                </div>
                <p className="text-sm leading-7 text-[var(--muted-foreground)]">{item}</p>
              </div>
            ))}
          </div>
        </Card>

        <div className="grid gap-5">
          {scenarios.map((scenario) => (
            <Card key={scenario.title}>
              <h3 className="text-2xl font-semibold text-[var(--foreground)]">{scenario.title}</h3>
              <div className="mt-5 space-y-3">
                {scenario.points.map((item) => (
                  <div key={item} className="rounded-2xl border border-[var(--border-soft)] bg-[var(--surface-2)] px-4 py-3">
                    <p className="text-sm leading-7 text-[var(--muted-foreground)]">{item}</p>
                  </div>
                ))}
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
