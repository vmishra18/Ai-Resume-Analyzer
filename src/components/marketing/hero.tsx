import Link from "next/link";
import { ArrowRight, CheckCircle2, FileSearch, LineChart, ShieldCheck } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

const proofPoints = [
  "Upload PDF or DOCX resumes",
  "Spot missing keywords and skills",
  "Get practical suggestions fast",
  "Save analyses and compare versions"
];

const statCards = [
  { label: "Resume formats", value: "2", detail: "PDF and DOCX support" },
  { label: "Score areas", value: "6", detail: "Match, skills, sections, and more" },
  { label: "Saved history", value: "Yes", detail: "Keep track of every version" }
];

export function Hero() {
  return (
    <section className="relative overflow-hidden px-6 pb-20 pt-12 lg:px-8 lg:pb-28 lg:pt-20">
      <div className="absolute inset-x-0 top-0 -z-10 mx-auto h-[32rem] max-w-6xl rounded-full bg-[radial-gradient(circle,rgba(255,141,105,0.22),transparent_58%)] blur-3xl" />

      <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
        <div className="max-w-3xl">
          <Badge className="mb-6">Resume matching made simpler</Badge>
          <h1 className="max-w-3xl font-heading text-5xl leading-[0.95] text-white sm:text-6xl lg:text-7xl">
            See how well your resume matches the job before you apply.
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-[var(--muted-foreground)] sm:text-xl">
            Upload your resume, paste a job description, and get a clear breakdown of matched skills,
            missing keywords, section quality, and practical improvements.
          </p>

          <div className="mt-8 flex flex-col gap-4 sm:flex-row">
            <Button asChild size="lg">
              <Link href="/upload">
                Analyze Resume
                <ArrowRight className="size-4" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="secondary">
              <Link href="#how-it-works">See How It Works</Link>
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
          <div className="relative p-6 sm:p-8">
            <div className="rounded-[24px] border border-white/10 bg-[rgba(5,7,12,0.52)] p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-[var(--muted-foreground)]">Analysis preview</p>
                  <h2 className="mt-1 font-heading text-2xl text-white">Product Engineer Resume</h2>
                </div>
                <div className="rounded-full bg-emerald-500/16 px-4 py-2 text-sm font-semibold text-emerald-300">
                  ATS Score 84
                </div>
              </div>

              <div className="mt-6 grid gap-4 sm:grid-cols-3">
                <div className="rounded-2xl border border-white/8 bg-white/4 p-4">
                  <FileSearch className="size-5 text-[var(--color-brand-400)]" />
                  <p className="mt-3 text-sm text-[var(--muted-foreground)]">Keyword Match</p>
                  <p className="mt-1 text-2xl font-semibold text-white">78%</p>
                </div>
                <div className="rounded-2xl border border-white/8 bg-white/4 p-4">
                  <ShieldCheck className="size-5 text-emerald-300" />
                  <p className="mt-3 text-sm text-[var(--muted-foreground)]">Must-Haves</p>
                  <p className="mt-1 text-2xl font-semibold text-white">6 / 8</p>
                </div>
                <div className="rounded-2xl border border-white/8 bg-white/4 p-4">
                  <LineChart className="size-5 text-sky-300" />
                  <p className="mt-3 text-sm text-[var(--muted-foreground)]">Structure</p>
                  <p className="mt-1 text-2xl font-semibold text-white">Strong</p>
                </div>
              </div>

              <div className="mt-5 grid gap-3">
                {[
                  { label: "Matched skills", value: "React, TypeScript, SQL, REST APIs, Tailwind" },
                  { label: "Missing keywords", value: "A/B testing, experimentation, mentoring" },
                  { label: "Suggestion", value: "Add a short summary and highlight measurable results in recent projects." }
                ].map((item) => (
                  <div key={item.label} className="rounded-2xl border border-white/8 bg-white/4 p-4">
                    <p className="text-xs uppercase tracking-[0.18em] text-[var(--muted-foreground)]">
                      {item.label}
                    </p>
                    <p className="mt-2 text-sm leading-6 text-white/88">{item.value}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-5 grid gap-4 sm:grid-cols-3">
              {statCards.map((card) => (
                <div key={card.label} className="rounded-2xl border border-white/8 bg-white/4 p-4">
                  <p className="text-sm text-[var(--muted-foreground)]">{card.label}</p>
                  <p className="mt-2 font-heading text-3xl text-white">{card.value}</p>
                  <p className="mt-1 text-sm text-[var(--muted-foreground)]">{card.detail}</p>
                </div>
              ))}
            </div>
          </div>
        </Card>
      </div>
    </section>
  );
}
