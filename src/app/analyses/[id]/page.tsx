import { notFound } from "next/navigation";

import { Card } from "@/components/ui/card";
import type { JobDescriptionKeyword } from "@/features/job-description/lib/types";
import { formatBytes } from "@/features/upload/lib/helpers";
import { clipText, countWords } from "@/features/resume-parser/server/normalization";
import { db } from "@/lib/db";

interface AnalysisDetailPageProps {
  params: Promise<{
    id: string;
  }>;
}

function getJobDescriptionKeywords(value: unknown) {
  return Array.isArray(value) ? (value as JobDescriptionKeyword[]) : [];
}

export default async function AnalysisDetailPage({ params }: AnalysisDetailPageProps) {
  const { id } = await params;

  const session = await db.analysisSession.findUnique({
    where: { id },
    include: {
      parsedResume: true,
      uploadedFile: true,
      jobDescription: true
    }
  });

  if (!session) {
    notFound();
  }

  const createdAt = new Intl.DateTimeFormat("en-GB", {
    dateStyle: "medium",
    timeStyle: "short"
  }).format(session.createdAt);
  const parsedWordCount = session.parsedResume ? countWords(session.parsedResume.normalizedText) : 0;
  const extractedJobKeywords = getJobDescriptionKeywords(session.jobDescription?.extractedKeywords);
  const mustHaveKeywords = getJobDescriptionKeywords(session.jobDescription?.mustHaveKeywords);
  const niceToHaveKeywords = getJobDescriptionKeywords(session.jobDescription?.niceToHaveKeywords);
  const sectionCards = session.parsedResume
    ? [
        { label: "Summary", value: session.parsedResume.hasSummary },
        { label: "Skills", value: session.parsedResume.hasSkills },
        { label: "Experience", value: session.parsedResume.hasExperience },
        { label: "Education", value: session.parsedResume.hasEducation },
        { label: "Projects", value: session.parsedResume.hasProjects }
      ]
    : [];

  return (
    <section className="px-6 py-20 lg:px-8">
      <div className="mx-auto grid max-w-6xl gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <Card>
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[var(--color-brand-300)]">
            Analysis session
          </p>
          <h1 className="mt-4 font-heading text-4xl text-white">{session.title}</h1>
          <p className="mt-4 max-w-3xl text-base leading-8 text-[var(--muted-foreground)]">
            The upload is now stored and the resume parsing pipeline has already run. This page shows the extracted text,
            section heuristics, and structural signals that the later ATS scoring engine will build on.
          </p>

          <div className="mt-8 grid gap-4 md:grid-cols-2">
            <div className="rounded-2xl border border-white/8 bg-white/4 p-5">
              <p className="text-xs uppercase tracking-[0.18em] text-[var(--muted-foreground)]">Status</p>
              <p className="mt-2 text-2xl font-semibold text-white">{session.status}</p>
            </div>
            <div className="rounded-2xl border border-white/8 bg-white/4 p-5">
              <p className="text-xs uppercase tracking-[0.18em] text-[var(--muted-foreground)]">Created</p>
              <p className="mt-2 text-2xl font-semibold text-white">{createdAt}</p>
            </div>
          </div>

          {session.status === "FAILED" ? (
            <div className="mt-6 rounded-[24px] border border-amber-400/20 bg-amber-400/10 p-5">
              <p className="text-sm font-semibold text-amber-200">Resume parsing did not complete successfully.</p>
              <p className="mt-2 text-sm leading-7 text-amber-50/80">
                This usually means the file had little or no extractable text, which can happen with scanned PDFs or
                heavily formatted exports. The upload metadata was still saved so the session can be retried later.
              </p>
            </div>
          ) : null}

          <div className="mt-6 rounded-[24px] border border-white/8 bg-white/4 p-5">
            <p className="text-xs uppercase tracking-[0.18em] text-[var(--muted-foreground)]">Job description input</p>
            <p className="mt-3 whitespace-pre-wrap text-sm leading-7 text-white/82">
              {session.jobDescription?.rawText?.trim()
                ? session.jobDescription.rawText
                : "No job description was provided for this analysis session."}
            </p>
          </div>

          {session.jobDescription ? (
            <div className="mt-6 grid gap-4 md:grid-cols-3">
              <div className="rounded-2xl border border-white/8 bg-white/4 p-5">
                <p className="text-xs uppercase tracking-[0.18em] text-[var(--muted-foreground)]">Role title</p>
                <p className="mt-2 text-lg font-semibold text-white">
                  {session.jobDescription.title ?? "Not detected"}
                </p>
              </div>
              <div className="rounded-2xl border border-white/8 bg-white/4 p-5">
                <p className="text-xs uppercase tracking-[0.18em] text-[var(--muted-foreground)]">Seniority</p>
                <p className="mt-2 text-lg font-semibold text-white">
                  {session.jobDescription.seniority ?? "Not detected"}
                </p>
              </div>
              <div className="rounded-2xl border border-white/8 bg-white/4 p-5">
                <p className="text-xs uppercase tracking-[0.18em] text-[var(--muted-foreground)]">Extracted keywords</p>
                <p className="mt-2 text-lg font-semibold text-white">{extractedJobKeywords.length}</p>
              </div>
            </div>
          ) : null}
        </Card>

        <div className="space-y-6">
          <Card>
            <h2 className="text-2xl font-semibold text-white">Uploaded resume</h2>
            {session.uploadedFile ? (
              <div className="mt-5 space-y-4">
                <div className="rounded-2xl border border-white/8 bg-white/4 p-4">
                  <p className="text-xs uppercase tracking-[0.18em] text-[var(--muted-foreground)]">Filename</p>
                  <p className="mt-2 text-sm text-white">{session.uploadedFile.originalName}</p>
                </div>
                <div className="rounded-2xl border border-white/8 bg-white/4 p-4">
                  <p className="text-xs uppercase tracking-[0.18em] text-[var(--muted-foreground)]">Type</p>
                  <p className="mt-2 text-sm text-white">{session.uploadedFile.mimeType}</p>
                </div>
                <div className="rounded-2xl border border-white/8 bg-white/4 p-4">
                  <p className="text-xs uppercase tracking-[0.18em] text-[var(--muted-foreground)]">Size</p>
                  <p className="mt-2 text-sm text-white">{formatBytes(session.uploadedFile.sizeBytes)}</p>
                </div>
              </div>
            ) : (
              <p className="mt-4 text-sm text-[var(--muted-foreground)]">No uploaded file metadata found.</p>
            )}
          </Card>

          <Card>
            <h2 className="text-2xl font-semibold text-white">Parsed resume output</h2>
            {session.parsedResume ? (
              <div className="mt-5 space-y-5">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="rounded-2xl border border-white/8 bg-white/4 p-4">
                    <p className="text-xs uppercase tracking-[0.18em] text-[var(--muted-foreground)]">Word count</p>
                    <p className="mt-2 text-2xl font-semibold text-white">{parsedWordCount}</p>
                  </div>
                  <div className="rounded-2xl border border-white/8 bg-white/4 p-4">
                    <p className="text-xs uppercase tracking-[0.18em] text-[var(--muted-foreground)]">Structure score</p>
                    <p className="mt-2 text-2xl font-semibold text-white">{session.parsedResume.structureScore}/100</p>
                  </div>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  {sectionCards.map((item) => (
                    <div key={item.label} className="rounded-2xl border border-white/8 bg-white/4 px-4 py-3">
                      <p className="text-xs uppercase tracking-[0.18em] text-[var(--muted-foreground)]">{item.label}</p>
                      <p className="mt-2 text-sm font-medium text-white">{item.value ? "Detected" : "Missing"}</p>
                    </div>
                  ))}
                </div>

                <div className="rounded-[24px] border border-white/8 bg-white/4 p-5">
                  <p className="text-xs uppercase tracking-[0.18em] text-[var(--muted-foreground)]">Extracted summary</p>
                  <p className="mt-3 text-sm leading-7 text-white/82">
                    {session.parsedResume.summary ?? "No summary section was detected, so the parser could not extract one."}
                  </p>
                </div>

                <div className="rounded-[24px] border border-white/8 bg-white/4 p-5">
                  <p className="text-xs uppercase tracking-[0.18em] text-[var(--muted-foreground)]">Normalized text preview</p>
                  <p className="mt-3 whitespace-pre-wrap text-sm leading-7 text-white/82">
                    {clipText(session.parsedResume.normalizedText, 1600)}
                  </p>
                </div>
              </div>
            ) : (
              <p className="mt-4 text-sm leading-7 text-[var(--muted-foreground)]">
                Parsed resume text is not available yet. If the session status is `FAILED`, the file likely had no
                extractable text. Otherwise, this session is waiting for the parser to run.
              </p>
            )}
          </Card>

          <Card>
            <h2 className="text-2xl font-semibold text-white">Job description insights</h2>
            {session.jobDescription ? (
              <div className="mt-5 space-y-5">
                <div>
                  <p className="text-xs uppercase tracking-[0.18em] text-[var(--muted-foreground)]">Must-have keywords</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {mustHaveKeywords.length > 0 ? (
                      mustHaveKeywords.map((keyword) => (
                        <span
                          key={`${keyword.category}-${keyword.normalizedKeyword}`}
                          className="rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1 text-sm text-emerald-100"
                        >
                          {keyword.keyword}
                        </span>
                      ))
                    ) : (
                      <p className="text-sm text-[var(--muted-foreground)]">No must-have keywords detected yet.</p>
                    )}
                  </div>
                </div>

                <div>
                  <p className="text-xs uppercase tracking-[0.18em] text-[var(--muted-foreground)]">Nice-to-have keywords</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {niceToHaveKeywords.length > 0 ? (
                      niceToHaveKeywords.slice(0, 14).map((keyword) => (
                        <span
                          key={`${keyword.category}-${keyword.normalizedKeyword}`}
                          className="rounded-full border border-white/10 bg-white/6 px-3 py-1 text-sm text-white/84"
                        >
                          {keyword.keyword}
                        </span>
                      ))
                    ) : (
                      <p className="text-sm text-[var(--muted-foreground)]">No nice-to-have keywords detected yet.</p>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <p className="mt-4 text-sm leading-7 text-[var(--muted-foreground)]">
                Add a job description during upload to generate keyword extraction, must-have detection, and role hints.
              </p>
            )}
          </Card>

          <Card>
            <h2 className="text-2xl font-semibold text-white">What comes next</h2>
            <div className="mt-5 space-y-3">
              {[
                "Calculate ATS score breakdown and render the dashboard."
              ].map((item) => (
                <div key={item} className="rounded-2xl border border-white/8 bg-white/4 px-4 py-3">
                  <p className="text-sm leading-7 text-[var(--muted-foreground)]">{item}</p>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </section>
  );
}
