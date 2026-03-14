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

export function Hero() {
  return (
    <section className="relative overflow-hidden px-6 pb-20 pt-12 lg:px-8 lg:pb-24 lg:pt-16">
      <div className="absolute inset-x-0 top-0 -z-10 mx-auto h-[32rem] max-w-6xl rounded-full bg-[radial-gradient(circle,rgba(255,141,105,0.2),transparent_56%)] blur-3xl" />

      <div className="mx-auto grid max-w-7xl gap-10 xl:grid-cols-[1.08fr_0.92fr] xl:items-center">
        <div className="max-w-3xl">
          <Badge className="mb-6">Clear resume feedback for each application</Badge>
          <h1 className="max-w-3xl font-heading text-5xl leading-[0.95] text-[var(--foreground)] sm:text-6xl lg:text-[5.15rem] xl:text-7xl">
            Make each resume feel ready before you hit apply.
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-[var(--muted-foreground)] sm:text-xl">
            Resume Signal helps you check fit, spot missing skills, and decide what to rewrite next without turning the
            process into guesswork.
          </p>

          <div className="mt-8 flex flex-col gap-4 sm:flex-row">
            <Button asChild size="lg">
              <Link href="/upload">
                Analyze a resume
                <ArrowRight className="size-4" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="secondary">
              <Link href="#scenarios">See how it helps</Link>
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
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(52,211,153,0.14),transparent_34%),radial-gradient(circle_at_bottom_left,rgba(245,106,72,0.14),transparent_30%)]" />
          <div className="relative space-y-5 p-6 sm:p-8">
            <div className="rounded-[26px] border border-[var(--border-soft)] bg-[rgba(5,7,12,0.34)] p-5">
              <div className="flex items-center justify-between gap-4">
                <div className="min-w-0">
                  <p className="text-sm text-[var(--muted-foreground)]">Resume check preview</p>
                  <h2 className="mt-1 font-heading text-2xl leading-tight text-[var(--foreground)]">Frontend Engineer</h2>
                </div>
                <div className="shrink-0 rounded-full bg-emerald-500/16 px-4 py-2 text-sm font-semibold text-emerald-300">
                  Match 81
                </div>
              </div>

              <div className="mt-5 space-y-3">
                {previewRows.map((item) => {
                  const Icon = item.icon;

                  return (
                    <div
                      key={item.label}
                      className="flex items-start gap-4 rounded-2xl border border-[var(--border-soft)] bg-[var(--surface-2)] p-4"
                    >
                      <div className="rounded-2xl border border-[var(--border-soft)] bg-[var(--surface-3)] p-2">
                        <Icon className="size-5 text-[var(--color-brand-300)]" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm text-[var(--muted-foreground)]">{item.label}</p>
                        <p className="mt-1 text-base font-semibold leading-7 text-[var(--foreground)]">{item.value}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="rounded-[24px] border border-[var(--border-soft)] bg-[var(--surface-2)] p-5">
              <p className="text-sm font-semibold text-[var(--foreground)]">Keep each check easy to revisit</p>
              <p className="mt-2 text-sm leading-7 text-[var(--muted-foreground)]">
                Save past results and come back later without digging through renamed files, copied notes, or old job
                tabs.
              </p>
            </div>
          </div>
        </Card>
      </div>
    </section>
  );
}
