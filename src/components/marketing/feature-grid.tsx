import { LayoutDashboard, ScanSearch, Shield, Sparkles, Target, Wand2 } from "lucide-react";

import { Card } from "@/components/ui/card";

const features = [
  {
    icon: ScanSearch,
    title: "Role-aware analysis",
    description: "Match a resume against frontend, backend, product, data, design, QA, DevOps, and support-style job descriptions."
  },
  {
    icon: Target,
    title: "Transparent ATS score",
    description: "See exactly how the score is built from stack overlap, must-have skills, section quality, alignment, and evidence strength."
  },
  {
    icon: Wand2,
    title: "Smarter keyword aliasing",
    description: "Recognise variants like JS and JavaScript, RTK and Redux Toolkit, NodeJS and Node.js, or AWS Lambda and AWS."
  },
  {
    icon: Sparkles,
    title: "Readability and bullet checks",
    description: "Review whether your summary is concise, bullets are action-led, and experience sections are easy to scan."
  },
  {
    icon: LayoutDashboard,
    title: "Saved private history",
    description: "Keep each run in a private workspace so you can revisit strong versions and compare what changed."
  },
  {
    icon: Shield,
    title: "Cleaner job description parsing",
    description: "Filter company fluff, benefits copy, and noisy phrases so the analysis focuses on actual role requirements."
  }
];

export function FeatureGrid() {
  return (
    <section id="features" className="px-6 py-20 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="max-w-3xl">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[var(--color-brand-300)]">Features</p>
          <h2 className="mt-4 font-heading text-4xl text-[var(--foreground)] sm:text-5xl">
            A resume tool that stays useful after the first score.
          </h2>
          <p className="mt-5 max-w-2xl text-lg leading-8 text-[var(--muted-foreground)]">
            The workflow is built around an actual application habit: upload, compare, revise, save, and come back with
            a better version.
          </p>
        </div>

        <div className="mt-12 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {features.map((feature) => {
            const Icon = feature.icon;

            return (
              <Card key={feature.title} className="min-h-[220px]">
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
