import { Card } from "@/components/ui/card";

const useCases = [
  {
    title: "Tailor one resume for a specific role",
    description: "Paste a job description and quickly see which skills and phrases are already covered in your resume.",
    tags: ["Keyword match", "Missing skills", "Section review"]
  },
  {
    title: "Compare multiple resume versions",
    description: "Save each analysis so you can check whether your latest edits improved the match score.",
    tags: ["Saved history", "Score trends", "Version tracking"]
  },
  {
    title: "Prepare before you apply",
    description: "Use the suggestion panel to tighten your summary, highlight relevant experience, and close keyword gaps.",
    tags: ["Actionable suggestions", "Resume polish", "Application prep"]
  }
];

export function RoadmapSection() {
  return (
    <section id="use-cases" className="px-6 py-20 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="max-w-3xl">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[var(--color-brand-300)]">
            Use cases
          </p>
          <h2 className="mt-4 font-heading text-4xl text-white sm:text-5xl">
            Useful whether you are polishing one application or many.
          </h2>
          <p className="mt-5 text-lg leading-8 text-[var(--muted-foreground)]">
            Keep the process simple: check the role, update your resume, save the result, and come back whenever you
            want to compare the next version.
          </p>
        </div>

        <div className="mt-12 grid gap-5">
          {useCases.map((useCase) => (
            <Card key={useCase.title} className="grid gap-6 lg:grid-cols-[240px_1fr]">
              <div>
                <h3 className="text-2xl font-semibold text-white">{useCase.title}</h3>
              </div>
              <div>
                <p className="text-sm leading-7 text-[var(--muted-foreground)]">{useCase.description}</p>
                <div className="mt-4 flex flex-wrap gap-2">
                  {useCase.tags.map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full border border-white/10 bg-white/6 px-3 py-1 text-xs text-[var(--muted-foreground)]"
                    >
                      {tag}
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
