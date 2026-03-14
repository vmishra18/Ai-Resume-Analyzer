import { LayoutDashboard, ScanSearch, Sparkles, Target } from "lucide-react";

import { Card } from "@/components/ui/card";

const features = [
  {
    icon: ScanSearch,
    title: "Role-aware feedback",
    description: "Check how well your resume lines up with the role before you send the application."
  },
  {
    icon: Target,
    title: "Clear match summary",
    description: "See what already fits, what is missing, and which gaps matter most for this role."
  },
  {
    icon: Sparkles,
    title: "Actionable suggestions",
    description: "Get practical next steps for missing skills, stronger bullets, and clearer section coverage."
  },
  {
    icon: LayoutDashboard,
    title: "Private saved history",
    description: "Keep your resume checks together so you can revisit earlier versions without starting from scratch."
  }
];

export function FeatureGrid() {
  return (
    <section id="features" className="px-6 py-20 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="max-w-3xl">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[var(--color-brand-300)]">Features</p>
          <h2 className="mt-4 font-heading text-4xl text-[var(--foreground)] sm:text-5xl">
            A simpler way to tailor each application.
          </h2>
          <p className="mt-5 max-w-2xl text-lg leading-8 text-[var(--muted-foreground)]">
            The workflow stays focused on the questions people actually have before applying: does this resume fit, what
            is missing, and what should I fix first?
          </p>
        </div>

        <div className="mt-12 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          {features.map((feature) => {
            const Icon = feature.icon;

            return (
              <Card key={feature.title} className="min-h-[210px]">
                <div className="inline-flex rounded-2xl border border-[var(--border-soft)] bg-[var(--surface-2)] p-3">
                  <Icon className="size-6 text-[var(--color-brand-300)]" />
                </div>
                <h3 className="mt-5 text-xl font-semibold text-[var(--foreground)]">{feature.title}</h3>
                <p className="mt-3 text-sm leading-7 text-[var(--muted-foreground)]">{feature.description}</p>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}
