import { Card } from "@/components/ui/card";

const loadingSteps = [
  {
    title: "Reading your resume",
    detail: "Extracting sections, bullets, timeline clues, and structure signals."
  },
  {
    title: "Matching role family and skills",
    detail: "Checking semantic skills, seniority alignment, and keyword overlap."
  },
  {
    title: "Detecting impact and weak bullets",
    detail: "Looking for ownership, measurable outcomes, and vague phrasing."
  },
  {
    title: "Preparing rewrites and notebook insights",
    detail: "Building suggestions, rewrite assists, and the final report layout."
  }
];

export default function Loading() {
  return (
    <section className="px-6 py-20 lg:px-8">
      <div className="mx-auto max-w-4xl">
        <Card className="overflow-hidden">
          <div className="h-1 w-full bg-[var(--surface-2)]">
            <div className="h-full w-1/2 animate-pulse bg-[linear-gradient(90deg,var(--color-brand-500),var(--color-accent-500))]" />
          </div>

          <p className="mt-6 text-sm font-semibold uppercase tracking-[0.24em] text-[var(--color-brand-300)]">
            Analysis in progress
          </p>
          <h1 className="mt-4 font-heading text-4xl text-[var(--foreground)]">We&apos;re analyzing your resume.</h1>
          <p className="mt-5 max-w-2xl text-base leading-8 text-[var(--muted-foreground)]">
            This usually takes a moment while we extract your resume, map it to the target role, detect weak bullets,
            and prepare rewrite-ready feedback.
          </p>

          <div className="mt-8 space-y-3">
            {loadingSteps.map((step, index) => (
              <div
                key={step.title}
                className="flex items-center gap-4 rounded-2xl border border-[var(--border-soft)] bg-[var(--surface-2)] px-4 py-4"
              >
                <div className="flex size-9 items-center justify-center rounded-full bg-[var(--surface-3)] text-sm font-semibold text-[var(--foreground)]">
                  {index + 1}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm font-medium text-[var(--foreground)]">{step.title}</p>
                    <span className="font-mono text-[11px] uppercase tracking-[0.14em] text-[var(--muted-foreground)]">
                      running
                    </span>
                  </div>
                  <p className="mt-1 text-sm leading-7 text-[var(--muted-foreground)]">{step.detail}</p>
                  <div className="mt-3 h-2 rounded-full bg-[var(--surface-3)]">
                    <div
                      className="h-full animate-pulse rounded-full bg-[linear-gradient(90deg,var(--color-brand-500),var(--color-accent-500))]"
                      style={{ width: `${52 + index * 12}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </section>
  );
}
