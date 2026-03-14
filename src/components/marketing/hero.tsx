import Link from "next/link";
import { ArrowRight, CheckCircle2, CopyCheck, Files, Sparkles } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

const proofPoints = [
  "Upload PDF or DOCX resumes",
  "Check fit against real job descriptions",
  "See missing skills before you apply",
  "Keep each saved version in one place"
];

const previewRows = [
  {
    label: "Strong match",
    value: "React, TypeScript, Node.js",
    icon: CopyCheck
  },
  {
    label: "Still missing",
    value: "CI, Docker, AWS",
    icon: Sparkles
  },
  {
    label: "Next step",
    value: "Tighten skills and top experience bullets",
    icon: Files
  }
];

const previewStats = [
  { label: "ATS score", value: "81" },
  { label: "Coverage", value: "72%" },
  { label: "Missing", value: "3" }
];

export function Hero() {
  return (
    <section className="relative overflow-hidden px-6 pb-20 pt-14 lg:px-8 lg:pb-24 lg:pt-16">
      <div className="mx-auto max-w-7xl">
        <div className="grid gap-10 xl:grid-cols-[0.92fr_1.08fr]">
          <div className="max-w-3xl">
            <Badge className="mb-6">AI research notebook</Badge>
            <h1 className="max-w-3xl font-heading text-5xl font-semibold leading-[0.92] text-[var(--foreground)] sm:text-6xl lg:text-[5.2rem]">
              A workspace for reading resumes like research artifacts.
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-[var(--muted-foreground)] sm:text-xl">
              Instead of another ATS dashboard, Resume Signal turns each upload into a notebook of observations,
              missing signals, and practical revisions you can act on.
            </p>

            <div className="mt-8 flex flex-col gap-4 sm:flex-row">
              <Button asChild size="lg">
                <Link href="/upload">
                  Open a notebook
                  <ArrowRight className="size-4" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="secondary">
                <Link href="#scenarios">See workflows</Link>
              </Button>
            </div>

            <div className="mt-12 grid gap-4 sm:grid-cols-2">
              {proofPoints.map((item) => (
                <div key={item} className="flex items-start gap-3 rounded-[14px] border border-[var(--border-soft)] bg-[var(--surface-1)] px-4 py-4 text-sm leading-7 text-[var(--muted-foreground)]">
                  <CheckCircle2 className="mt-1 size-4 shrink-0 text-[var(--color-brand-400)]" />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>

          <Card className="p-0">
            <div className="grid gap-0 lg:grid-cols-[260px_minmax(0,1fr)]">
              <div className="border-b border-[var(--border-soft)] bg-[var(--panel-strong)] p-6 lg:border-b-0 lg:border-r">
                <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-[var(--muted-foreground)]">
                  session_014
                </p>
                <h2 className="mt-4 font-heading text-3xl font-semibold text-[var(--foreground)]">Frontend Engineer</h2>
                <p className="mt-3 text-sm leading-7 text-[var(--muted-foreground)]">
                  Role-aligned notebook with scoring trace, fit summary, and revision cues.
                </p>

                <div className="mt-8 space-y-4">
                  {previewStats.map((item) => (
                    <div key={item.label} className="rounded-[12px] border border-[var(--border-soft)] bg-[var(--surface-2)] px-4 py-4">
                      <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-[var(--muted-foreground)]">
                        {item.label}
                      </p>
                      <p className="mt-2 font-heading text-4xl font-semibold text-[var(--foreground)]">{item.value}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-6 lg:p-8">
                <div className="flex items-center justify-between gap-4 border-b border-[var(--border-soft)] pb-4">
                  <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-[var(--muted-foreground)]">
                    Observations
                  </p>
                  <div className="rounded-full border border-[var(--tone-success-border)] bg-[var(--tone-success-bg)] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--tone-success-foreground)]">
                    strong fit
                  </div>
                </div>

                <div className="mt-5 space-y-5">
                  {previewRows.map((item, index) => {
                    const Icon = item.icon;

                    return (
                      <div key={item.label} className="grid gap-3 border-b border-[var(--border-soft)] pb-5 last:border-b-0 last:pb-0 sm:grid-cols-[auto_1fr]">
                        <div className="flex items-center gap-3">
                          <div className="flex size-10 items-center justify-center rounded-[12px] bg-[var(--surface-3)]">
                            <Icon className="size-5 text-[var(--color-brand-300)]" />
                          </div>
                          <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-[var(--muted-foreground)]">
                            0{index + 1}
                          </span>
                        </div>
                        <div>
                          <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-[var(--muted-foreground)]">
                            {item.label}
                          </p>
                          <p className="mt-2 text-base font-semibold leading-7 text-[var(--foreground)]">{item.value}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </section>
  );
}
