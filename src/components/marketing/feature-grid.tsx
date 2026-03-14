import { LayoutDashboard, ScanSearch, Sparkles, Target } from "lucide-react";

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
      <div className="mx-auto max-w-7xl border-t border-[var(--border-soft)] pt-8">
        <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr]">
          <div className="max-w-md">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[var(--color-brand-300)]">Features</p>
            <h2 className="mt-4 font-heading text-4xl font-semibold text-[var(--foreground)] sm:text-5xl">
              A clearer reading of each resume draft.
            </h2>
          </div>
          <p className="max-w-2xl text-lg leading-8 text-[var(--muted-foreground)]">
            The workflow stays grounded in practical questions: does this fit the role, which signals are missing, and
            what should be rewritten before the application goes out.
          </p>
        </div>

        <div className="mt-12 grid gap-x-10 gap-y-8 md:grid-cols-2">
          {features.map((feature, index) => {
            const Icon = feature.icon;

            return (
              <div key={feature.title} className="border-t border-[var(--border-soft)] pt-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="inline-flex items-center gap-3">
                    <Icon className="size-5 text-[var(--color-brand-300)]" />
                    <span className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--muted-foreground)]">
                      0{index + 1}
                    </span>
                  </div>
                </div>
                <h3 className="mt-5 font-heading text-3xl font-semibold leading-tight text-[var(--foreground)]">
                  {feature.title}
                </h3>
                <p className="mt-3 max-w-md text-sm leading-7 text-[var(--muted-foreground)]">{feature.description}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
