import {
  Blocks,
  DatabaseZap,
  FileCode2,
  LayoutDashboard,
  ScanSearch,
  Sparkles
} from "lucide-react";

import { Card } from "@/components/ui/card";

const features = [
  {
    icon: FileCode2,
    title: "Quick resume upload",
    description: "Upload a PDF or DOCX resume and start a new analysis in a few clicks."
  },
  {
    icon: ScanSearch,
    title: "Job description matching",
    description: "Compare your resume against the role to see which skills, tools, and phrases already align."
  },
  {
    icon: LayoutDashboard,
    title: "Clear results dashboard",
    description: "Review your score, matched keywords, missing skills, section checks, and next-step suggestions."
  },
  {
    icon: DatabaseZap,
    title: "Saved history",
    description: "Keep past analyses so you can revisit results and compare updated resume versions over time."
  },
  {
    icon: Blocks,
    title: "Section checks",
    description: "See whether your resume includes the sections hiring teams usually expect, such as summary, skills, and experience."
  },
  {
    icon: Sparkles,
    title: "Actionable suggestions",
    description: "Turn the score into concrete improvements you can make before sending your application."
  }
];

export function FeatureGrid() {
  return (
    <section id="features" className="px-6 py-20 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="max-w-3xl">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[var(--color-brand-300)]">
            Features
          </p>
          <h2 className="mt-4 font-heading text-4xl text-white sm:text-5xl">
            Everything you need to tailor a stronger resume.
          </h2>
          <p className="mt-5 max-w-2xl text-lg leading-8 text-[var(--muted-foreground)]">
            From the first upload to the final score, every screen is designed to help you understand what is working
            and what needs attention.
          </p>
        </div>

        <div className="mt-12 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {features.map((feature) => {
            const Icon = feature.icon;

            return (
              <Card key={feature.title} className="min-h-[220px]">
                <div className="inline-flex rounded-2xl border border-white/10 bg-white/6 p-3">
                  <Icon className="size-6 text-[var(--color-brand-300)]" />
                </div>
                <h3 className="mt-5 text-xl font-semibold text-white">{feature.title}</h3>
                <p className="mt-3 text-sm leading-7 text-[var(--muted-foreground)]">
                  {feature.description}
                </p>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}
