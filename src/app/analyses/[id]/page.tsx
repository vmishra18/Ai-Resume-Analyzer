import { notFound } from "next/navigation";

import { Card } from "@/components/ui/card";
import { formatBytes } from "@/features/upload/lib/helpers";
import { db } from "@/lib/db";

interface AnalysisDetailPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function AnalysisDetailPage({ params }: AnalysisDetailPageProps) {
  const { id } = await params;

  const session = await db.analysisSession.findUnique({
    where: { id },
    include: {
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

  return (
    <section className="px-6 py-20 lg:px-8">
      <div className="mx-auto grid max-w-6xl gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <Card>
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[var(--color-brand-300)]">
            Analysis session
          </p>
          <h1 className="mt-4 font-heading text-4xl text-white">{session.title}</h1>
          <p className="mt-4 max-w-3xl text-base leading-8 text-[var(--muted-foreground)]">
            The upload was stored successfully and the analysis record is ready. Resume parsing and scoring are the next
            phases, so this page currently acts as a checkpoint showing the captured input and persisted metadata.
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

          <div className="mt-6 rounded-[24px] border border-white/8 bg-white/4 p-5">
            <p className="text-xs uppercase tracking-[0.18em] text-[var(--muted-foreground)]">Job description input</p>
            <p className="mt-3 whitespace-pre-wrap text-sm leading-7 text-white/82">
              {session.jobDescription?.rawText?.trim()
                ? session.jobDescription.rawText
                : "No job description was provided for this analysis session."}
            </p>
          </div>
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
            <h2 className="text-2xl font-semibold text-white">What comes next</h2>
            <div className="mt-5 space-y-3">
              {[
                "Parse PDF and DOCX files into normalized resume text.",
                "Extract job description keywords and must-have skills.",
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
