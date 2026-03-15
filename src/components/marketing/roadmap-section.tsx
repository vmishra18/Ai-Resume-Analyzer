import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

const comparisonReasons = [
  {
    title: "Compare two resume versions",
    description: "Open two analyses side by side to see which version has the stronger score, better keyword coverage, and cleaner content."
  },
  {
    title: "Keep role-specific history",
    description: "Save each run privately so you can revisit what worked for one application without losing another."
  },
  {
    title: "Reuse repeated job descriptions",
    description: "When you analyse the same role again, the app reuses cached job-description signals to keep the workflow fast."
  }
];

export function RoadmapSection() {
  return (
    <section id="compare" className="px-6 py-20 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <Card className="relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(245,106,72,0.14),transparent_32%),radial-gradient(circle_at_bottom_right,rgba(52,211,153,0.12),transparent_28%)]" />
          <div className="relative grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[var(--color-brand-300)]">Compare</p>
              <h2 className="mt-4 font-heading text-4xl text-[var(--foreground)] sm:text-5xl">
                Compare saved reports when two resume drafts are close.
              </h2>
              <p className="mt-5 max-w-2xl text-lg leading-8 text-[var(--muted-foreground)]">
                Keep your analyses in one place, reopen them later, and compare two saved reports when you need a quick
                answer on which draft is stronger for the role.
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Button asChild size="lg">
                  <Link href="/auth">Create workspace</Link>
                </Button>
                <Button asChild variant="secondary" size="lg">
                  <Link href="/compare">Open compare view</Link>
                </Button>
              </div>
            </div>

            <div className="grid gap-4">
              {comparisonReasons.map((item) => (
                <div key={item.title} className="rounded-2xl border border-[var(--border-soft)] bg-[var(--surface-2)] p-5">
                  <h3 className="text-xl font-semibold text-[var(--foreground)]">{item.title}</h3>
                  <p className="mt-3 text-sm leading-7 text-[var(--muted-foreground)]">{item.description}</p>
                </div>
              ))}
            </div>
          </div>
        </Card>
      </div>
    </section>
  );
}
