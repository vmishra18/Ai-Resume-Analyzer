"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { FileText, LoaderCircle, UploadCloud } from "lucide-react";
import type { Route } from "next";
import { startTransition, useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { ACCEPTED_RESUME_EXTENSIONS, ACCEPTED_RESUME_TYPES, MAX_RESUME_FILE_SIZE } from "@/features/upload/lib/constants";
import { formatBytes, isAcceptedResumeFile } from "@/features/upload/lib/helpers";
import { uploadRequestSchema, type UploadRequestInput } from "@/features/upload/lib/schemas";
import type { CreateAnalysisSessionResponse, UploadErrorResponse } from "@/features/upload/lib/types";

const acceptValue = [...ACCEPTED_RESUME_TYPES, ...ACCEPTED_RESUME_EXTENSIONS].join(",");

const checklist = [
  "PDF and DOCX only",
  "Maximum size 4 MB",
  "Paste a job description if you have one",
  "Review your results on the next screen"
];

const analysisProgressStages = [
  {
    label: "Uploading resume",
    detail: "Saving the file and validating the input."
  },
  {
    label: "Extracting resume text",
    detail: "Parsing sections, bullets, and timeline signals."
  },
  {
    label: "Matching role family and skills",
    detail: "Checking semantic skills, seniority, and missing signals."
  },
  {
    label: "Building rewrite assists",
    detail: "Preparing bullet rewrites and improvement suggestions."
  },
  {
    label: "Preparing report",
    detail: "Assembling the final analysis dashboard."
  }
] as const;

interface UploadFormProps {
  userName: string;
}

export function UploadForm({ userName }: UploadFormProps) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [activeStageIndex, setActiveStageIndex] = useState(0);
  const firstName = userName.trim().split(/\s+/)[0] || "there";

  const {
    register,
    handleSubmit,
    setError,
    setValue,
    watch,
    formState: { errors, isSubmitting }
  } = useForm<UploadRequestInput>({
    resolver: zodResolver(uploadRequestSchema),
    defaultValues: {
      jobDescription: ""
    }
  });

  const selectedFile = watch("resume");

  useEffect(() => {
    if (!isSubmitting) {
      setActiveStageIndex(0);
      return;
    }

    const interval = window.setInterval(() => {
      setActiveStageIndex((current) => (current + 1) % analysisProgressStages.length);
    }, 1400);

    return () => window.clearInterval(interval);
  }, [isSubmitting]);

  const handleFileSelection = (file: File | null) => {
    setSubmitError(null);

    if (!file) {
      return;
    }

    setValue("resume", file, {
      shouldValidate: true,
      shouldDirty: true,
      shouldTouch: true
    });
  };

  const handleDragState = (event: React.DragEvent<HTMLButtonElement>, dragging: boolean) => {
    event.preventDefault();
    setIsDragging(dragging);
  };

  const handleDrop = (event: React.DragEvent<HTMLButtonElement>) => {
    event.preventDefault();
    setIsDragging(false);

    const file = event.dataTransfer.files?.[0] ?? null;
    handleFileSelection(file);
  };

  const onSubmit = handleSubmit(async (values) => {
    setSubmitError(null);

    const formData = new FormData();
    formData.set("resume", values.resume);
    formData.set("jobDescription", values.jobDescription ?? "");

    const response = await fetch("/api/analyses", {
      method: "POST",
      body: formData
    });

    const payload = (await response.json()) as CreateAnalysisSessionResponse | UploadErrorResponse;

    if (!response.ok) {
      const errorPayload = payload as UploadErrorResponse;
      const resumeErrors = errorPayload.fieldErrors?.resume;
      const jobDescriptionErrors = errorPayload.fieldErrors?.jobDescription;

      if (resumeErrors?.[0]) {
        setError("resume", {
          type: "server",
          message: resumeErrors[0]
        });
      }

      if (jobDescriptionErrors?.[0]) {
        setError("jobDescription", {
          type: "server",
          message: jobDescriptionErrors[0]
        });
      }

      setSubmitError(errorPayload.message);
      return;
    }

    const successPayload = payload as CreateAnalysisSessionResponse;

    startTransition(() => {
      router.push(successPayload.redirectTo as Route);
    });
  });

  return (
    <section className="px-6 py-16 lg:px-8 lg:py-20">
      <div className="mx-auto grid max-w-7xl gap-6 lg:grid-cols-[0.9fr_1.1fr]">
        <Card>
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[var(--color-brand-300)]">
            Resume upload
          </p>
          <h1 className="mt-4 font-heading text-4xl text-[var(--foreground)] sm:text-5xl">
            Upload your resume and start a new analysis.
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-8 text-[var(--muted-foreground)]">
            {firstName}, add your resume, paste the job description if you want role-specific feedback, and we&apos;ll
            prepare your report right away.
          </p>

          <div className="mt-8 grid gap-3">
            {checklist.map((item) => (
              <div key={item} className="rounded-2xl border border-[var(--border-soft)] bg-[var(--surface-2)] px-4 py-3">
                <p className="text-sm leading-7 text-[var(--muted-foreground)]">{item}</p>
              </div>
            ))}
          </div>

          <div className="mt-8 rounded-[24px] border border-[var(--border-soft)] bg-[var(--surface-2)] p-5">
            <p className="text-xs uppercase tracking-[0.18em] text-[var(--muted-foreground)]">Before you upload</p>
            <p className="mt-3 text-sm leading-7 text-[var(--foreground)]">
              Accepted formats: PDF and DOCX. Max file size: {formatBytes(MAX_RESUME_FILE_SIZE)}. For the best results,
              use a text-based resume export rather than a scanned document.
            </p>
          </div>
        </Card>

        <Card>
          <form className="space-y-6" onSubmit={onSubmit}>
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[var(--color-brand-300)]">
                New analysis
              </p>
              <h2 className="mt-4 font-heading text-3xl text-[var(--foreground)]">Start analysis</h2>
            </div>

            <div>
              <input
                ref={fileInputRef}
                type="file"
                accept={acceptValue}
                className="hidden"
                onChange={(event) => handleFileSelection(event.target.files?.[0] ?? null)}
              />

              <button
                type="button"
                className={`w-full rounded-[28px] border border-dashed p-6 text-left transition ${
                  isDragging
                    ? "border-[var(--color-brand-500)] bg-[rgba(245,106,72,0.12)]"
                    : "border-[var(--border-soft)] bg-[var(--surface-1)] hover:bg-[var(--surface-2)]"
                }`}
                onClick={() => fileInputRef.current?.click()}
                onDragEnter={(event) => handleDragState(event, true)}
                onDragOver={(event) => handleDragState(event, true)}
                onDragLeave={(event) => handleDragState(event, false)}
                onDrop={handleDrop}
              >
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                  <div className="flex size-14 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,var(--color-brand-500),var(--color-accent-500))] text-white shadow-[0_14px_35px_rgba(245,106,72,0.22)]">
                    <UploadCloud className="size-6" />
                  </div>

                  <div className="flex-1">
                    <p className="text-lg font-semibold text-[var(--foreground)]">Drag and drop your resume here</p>
                    <p className="mt-2 text-sm leading-7 text-[var(--muted-foreground)]">
                      or click to choose a local PDF or DOCX file
                    </p>
                  </div>
                </div>

                {selectedFile ? (
                  <div className="mt-5 rounded-2xl border border-[var(--border-soft)] bg-[var(--surface-2)] p-4">
                    <div className="flex items-center gap-3">
                      <FileText className="size-5 text-[var(--color-brand-300)]" />
                      <div>
                        <p className="text-sm font-medium text-[var(--foreground)]">{selectedFile.name}</p>
                        <p className="text-xs text-[var(--muted-foreground)]">{formatBytes(selectedFile.size)}</p>
                      </div>
                    </div>
                    {!isAcceptedResumeFile(selectedFile) ? (
                      <p className="mt-3 text-sm text-[var(--tone-warning-foreground)]">
                        This file may not pass validation. Double-check the format and size before submitting.
                      </p>
                    ) : null}
                  </div>
                ) : null}
              </button>

              {errors.resume ? (
                <p className="mt-3 text-sm text-[var(--tone-danger-foreground)]">{errors.resume.message}</p>
              ) : (
                <p className="mt-3 text-sm text-[var(--muted-foreground)]">
                  We&apos;ll extract the text from your resume and prepare the report immediately.
                </p>
              )}
            </div>

            <div>
              <label className="mb-3 block text-sm font-medium text-[var(--foreground)]" htmlFor="jobDescription">
                Job description
              </label>
              <Textarea
                id="jobDescription"
                placeholder="Paste the job description here to compare your resume against the role."
                {...register("jobDescription")}
              />
              {errors.jobDescription ? (
                <p className="mt-3 text-sm text-[var(--tone-danger-foreground)]">{errors.jobDescription.message}</p>
              ) : (
                <p className="mt-3 text-sm text-[var(--muted-foreground)]">
                  Optional, but recommended if you want a role-specific score and keyword match.
                </p>
              )}
            </div>

            {submitError ? (
              <div className="rounded-2xl border border-[var(--tone-danger-border)] bg-[var(--tone-danger-bg)] px-4 py-3 text-sm text-[var(--tone-danger-foreground)]">
                {submitError}
              </div>
            ) : null}

            {isSubmitting ? (
              <div className="rounded-[22px] border border-[var(--border-soft)] bg-[var(--surface-1)] p-5">
                <div className="flex items-center gap-3">
                  <LoaderCircle className="size-5 animate-spin text-[var(--color-brand-300)]" />
                  <div>
                    <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--color-brand-300)]">
                      Analysis pipeline
                    </p>
                    <p className="mt-1 text-base font-semibold text-[var(--foreground)]">
                      {analysisProgressStages[activeStageIndex]?.label}
                    </p>
                  </div>
                </div>

                <p className="mt-4 text-sm leading-7 text-[var(--muted-foreground)]">
                  {analysisProgressStages[activeStageIndex]?.detail}
                </p>

                <div className="mt-5 space-y-3">
                  {analysisProgressStages.map((stage, index) => {
                    const isComplete = index < activeStageIndex;
                    const isActive = index === activeStageIndex;

                    return (
                      <div
                        key={stage.label}
                        className={`rounded-[16px] border px-4 py-3 transition ${
                          isActive
                            ? "border-[var(--tone-info-border)] bg-[var(--tone-info-bg)]"
                            : isComplete
                              ? "border-[var(--tone-success-border)] bg-[var(--tone-success-bg)]"
                              : "border-[var(--border-soft)] bg-[var(--surface-2)]"
                        }`}
                      >
                        <div className="flex items-center justify-between gap-3">
                          <p className="text-sm font-medium text-[var(--foreground)]">{stage.label}</p>
                          <span className="font-mono text-[11px] uppercase tracking-[0.14em] text-[var(--muted-foreground)]">
                            {isComplete ? "done" : isActive ? "running" : "queued"}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : null}

            <div className="flex flex-col gap-3 sm:flex-row">
              <Button type="submit" size="lg" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <LoaderCircle className="size-4 animate-spin" />
                    Preparing analysis
                  </>
                ) : (
                  "Analyze resume"
                )}
              </Button>
              <Button
                type="button"
                variant="secondary"
                size="lg"
                onClick={() => fileInputRef.current?.click()}
              >
                Choose resume
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </section>
  );
}
