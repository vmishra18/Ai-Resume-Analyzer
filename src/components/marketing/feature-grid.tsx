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
    title: "Resume parsing pipeline",
    description: "Accept PDF and DOCX uploads, extract raw text, normalize content, and preserve file metadata."
  },
  {
    icon: ScanSearch,
    title: "Deterministic NLP layer",
    description: "Tokenize text, compare skill phrases, categorize keywords, and avoid black-box scoring."
  },
  {
    icon: LayoutDashboard,
    title: "Premium analysis dashboard",
    description: "Present score breakdowns, keyword gaps, section completeness, and action-oriented suggestions."
  },
  {
    icon: DatabaseZap,
    title: "Persistence and history",
    description: "Store analysis sessions, scoring summaries, and suggestions for trend comparisons over time."
  },
  {
    icon: Blocks,
    title: "Interview-grade architecture",
    description: "Separate parsing, scoring, and suggestion generation so the codebase feels realistic and maintainable."
  },
  {
    icon: Sparkles,
    title: "Startup-style UX polish",
    description: "Use strong typography, layered surfaces, gradients, and meaningful data visuals instead of toy UI patterns."
  }
];

export function FeatureGrid() {
  return (
    <section id="features" className="px-6 py-20 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="max-w-3xl">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[var(--color-brand-300)]">
            Core capabilities
          </p>
          <h2 className="mt-4 font-heading text-4xl text-white sm:text-5xl">
            Everything a serious resume analysis SaaS needs from day one.
          </h2>
          <p className="mt-5 max-w-2xl text-lg leading-8 text-[var(--muted-foreground)]">
            The project is designed to demonstrate real product thinking, not just one clever algorithm.
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
