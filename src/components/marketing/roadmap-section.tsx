import { Card } from "@/components/ui/card";
import { implementationPhases } from "@/features/analysis/lib/project-plan";

export function RoadmapSection() {
  return (
    <section id="roadmap" className="px-6 py-20 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="max-w-3xl">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[var(--color-brand-300)]">
            Build roadmap
          </p>
          <h2 className="mt-4 font-heading text-4xl text-white sm:text-5xl">
            A phased plan you can actually implement and explain.
          </h2>
        </div>

        <div className="mt-12 grid gap-5">
          {implementationPhases.map((phase) => (
            <Card key={phase.name} className="grid gap-6 lg:grid-cols-[240px_1fr]">
              <div>
                <p className="text-sm uppercase tracking-[0.18em] text-[var(--muted-foreground)]">
                  {phase.name}
                </p>
                <h3 className="mt-2 text-2xl font-semibold text-white">{phase.goal}</h3>
              </div>
              <div>
                <p className="text-sm leading-7 text-[var(--muted-foreground)]">{phase.outcome}</p>
                <div className="mt-4 flex flex-wrap gap-2">
                  {phase.files.map((file) => (
                    <span
                      key={file}
                      className="rounded-full border border-white/10 bg-white/6 px-3 py-1 text-xs text-[var(--muted-foreground)]"
                    >
                      {file}
                    </span>
                  ))}
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
