import { Card } from "@/components/ui/card";

const loadingSteps = [
  "Reading your resume",
  "Matching it to the job description",
  "Preparing your score and suggestions"
];

export default function Loading() {
  return (
    <section className="px-6 py-20 lg:px-8">
      <div className="mx-auto max-w-4xl">
        <Card className="overflow-hidden">
          <div className="h-1 w-full bg-white/8">
            <div className="h-full w-1/2 animate-pulse bg-[linear-gradient(90deg,var(--color-brand-500),var(--color-accent-500))]" />
          </div>

          <p className="mt-6 text-sm font-semibold uppercase tracking-[0.24em] text-[var(--color-brand-300)]">
            Analysis in progress
          </p>
          <h1 className="mt-4 font-heading text-4xl text-white">We&apos;re analyzing your resume.</h1>
          <p className="mt-5 max-w-2xl text-base leading-8 text-[var(--muted-foreground)]">
            This usually takes a moment while your resume is processed, matched against the role, and turned into a
            complete results dashboard.
          </p>

          <div className="mt-8 space-y-3">
            {loadingSteps.map((step, index) => (
              <div
                key={step}
                className="flex items-center gap-4 rounded-2xl border border-white/8 bg-white/4 px-4 py-4"
              >
                <div className="flex size-9 items-center justify-center rounded-full bg-white/8 text-sm font-semibold text-white">
                  {index + 1}
                </div>
                <div className="h-2 flex-1 rounded-full bg-white/8">
                  <div
                    className="h-full animate-pulse rounded-full bg-[linear-gradient(90deg,var(--color-brand-500),var(--color-accent-500))]"
                    style={{ width: `${60 + index * 10}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </section>
  );
}
