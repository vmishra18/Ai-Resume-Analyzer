import Link from "next/link";
import { ArrowRight, CheckCircle2, CopyCheck, Files, ShieldCheck, Sparkles } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

const proofPoints = [
  "Upload PDF or DOCX resumes",
  "Score against real job descriptions",
  "Compare multiple versions side by side",
  "Keep every analysis in a private workspace"
];

const quickStats = [
  { label: "Role families", value: "8+", detail: "Frontend, backend, data, design, QA, product, DevOps, support" },
  { label: "Reusable signals", value: "Cached", detail: "Repeat job descriptions load faster" },
  { label: "Feedback style", value: "Clear", detail: "Readable gaps, suggestions, and score drivers" }
];

export function Hero() {
  return (
    <section className="relative overflow-hidden px-6 pb-20 pt-12 lg:px-8 lg:pb-28 lg:pt-20">
      <div className="absolute inset-x-0 top-0 -z-10 mx-auto h-[34rem] max-w-6xl rounded-full bg-[radial-gradient(circle,rgba(255,141,105,0.22),transparent_56%)] blur-3xl" />

      <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[1.02fr_0.98fr] lg:items-center">
        <div className="max-w-3xl">
          <Badge className="mb-6">Built for real job applications, not generic resume advice</Badge>
          <h1 className="max-w-3xl font-heading text-5xl leading-[0.92] text-[var(--foreground)] sm:text-6xl lg:text-7xl">
            Make every resume version feel tailored before you hit apply.
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-[var(--muted-foreground)] sm:text-xl">
            Resume Signal compares your resume against the role, highlights what already aligns, catches missing skills,
            and gives you a cleaner improvement plan in minutes.
          </p>

          <div className="mt-8 flex flex-col gap-4 sm:flex-row">
            <Button asChild size="lg">
              <Link href="/auth">
                Create private workspace
                <ArrowRight className="size-4" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="secondary">
              <Link href="#scenarios">See real scenarios</Link>
            </Button>
          </div>

          <div className="mt-10 grid gap-3 sm:grid-cols-2">
            {proofPoints.map((item) => (
              <div key={item} className="flex items-center gap-3 text-sm text-[var(--muted-foreground)]">
                <CheckCircle2 className="size-4 text-[var(--color-brand-400)]" />
                <span>{item}</span>
              </div>
            ))}
          </div>
        </div>

        <Card className="relative overflow-hidden p-0">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(52,211,153,0.16),transparent_34%),radial-gradient(circle_at_bottom_left,rgba(245,106,72,0.16),transparent_30%)]" />
          <div className="relative space-y-5 p-6 sm:p-8">
            <div className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
              <div className="rounded-[26px] border border-[var(--border-soft)] bg-[rgba(5,7,12,0.35)] p-5">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-sm text-[var(--muted-foreground)]">Live match preview</p>
                    <h2 className="mt-1 font-heading text-2xl text-[var(--foreground)]">Senior Frontend Engineer</h2>
                  </div>
                  <div className="rounded-full bg-emerald-500/16 px-4 py-2 text-sm font-semibold text-emerald-300">
                    Score 81
                  </div>
                </div>

                <div className="mt-5 grid gap-3 sm:grid-cols-3">
                  {[
                    { label: "Matched stack", value: "React, TypeScript, Node.js", icon: CopyCheck, tone: "text-[var(--color-brand-300)]" },
                    { label: "Needs attention", value: "CI, Docker, AWS", icon: Sparkles, tone: "text-amber-300" },
                    { label: "Readability", value: "Strong bullets, concise summary", icon: ShieldCheck, tone: "text-emerald-300" }
                  ].map((item) => {
                    const Icon = item.icon;

                    return (
                      <div key={item.label} className="rounded-2xl border border-[var(--border-soft)] bg-[var(--surface-2)] p-4">
                        <Icon className={`size-5 ${item.tone}`} />
                        <p className="mt-3 text-sm text-[var(--muted-foreground)]">{item.label}</p>
                        <p className="mt-2 text-base font-semibold text-[var(--foreground)]">{item.value}</p>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="space-y-4">
                <div className="rounded-[24px] border border-[var(--border-soft)] bg-[var(--surface-2)] p-4">
                  <p className="text-xs uppercase tracking-[0.18em] text-[var(--muted-foreground)]">Why teams use it</p>
                  <p className="mt-3 text-sm leading-7 text-[var(--foreground)]">
                    Keep one place for versioned resume checks instead of juggling documents, notes, and screenshots.
                  </p>
                </div>
                <div className="rounded-[24px] border border-[var(--border-soft)] bg-[var(--surface-2)] p-4">
                  <p className="text-xs uppercase tracking-[0.18em] text-[var(--muted-foreground)]">Comparison ready</p>
                  <p className="mt-3 text-sm leading-7 text-[var(--foreground)]">
                    Open two analyses side by side to see which resume is stronger for the same role.
                  </p>
                </div>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              {quickStats.map((card) => (
                <div key={card.label} className="rounded-2xl border border-[var(--border-soft)] bg-[var(--surface-2)] p-4">
                  <p className="text-sm text-[var(--muted-foreground)]">{card.label}</p>
                  <p className="mt-2 font-heading text-3xl text-[var(--foreground)]">{card.value}</p>
                  <p className="mt-1 text-sm leading-6 text-[var(--muted-foreground)]">{card.detail}</p>
                </div>
              ))}
            </div>

            <div className="rounded-[24px] border border-[var(--border-soft)] bg-[var(--surface-2)] p-5">
              <div className="flex items-start gap-3">
                <Files className="mt-0.5 size-5 text-[var(--color-brand-300)]" />
                <div>
                  <p className="text-sm font-semibold text-[var(--foreground)]">From upload to revision plan</p>
                  <p className="mt-2 text-sm leading-7 text-[var(--muted-foreground)]">
                    Add the role, upload the resume, review your score, then tighten missing skills, bullet quality, and
                    readability before applying.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </section>
  );
}
