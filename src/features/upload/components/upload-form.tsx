"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { FileText, LoaderCircle, UploadCloud } from "lucide-react";
import type { Route } from "next";
import { startTransition, useRef, useState } from "react";
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
  "Optional job description support",
  "Server-side metadata persistence"
];

export function UploadForm() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

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
            Resume intake
          </p>
          <h1 className="mt-4 font-heading text-4xl text-white sm:text-5xl">
            Upload a resume and create the first analysis session.
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-8 text-[var(--muted-foreground)]">
            This step captures the resume file, validates the format, stores file metadata, and creates the analysis
            record. The parser now runs immediately so the next screen can show extracted text and section detection.
          </p>

          <div className="mt-8 grid gap-3">
            {checklist.map((item) => (
              <div key={item} className="rounded-2xl border border-white/8 bg-white/4 px-4 py-3">
                <p className="text-sm leading-7 text-[var(--muted-foreground)]">{item}</p>
              </div>
            ))}
          </div>

          <div className="mt-8 rounded-[24px] border border-white/8 bg-white/4 p-5">
            <p className="text-xs uppercase tracking-[0.18em] text-[var(--muted-foreground)]">Upload rules</p>
            <p className="mt-3 text-sm leading-7 text-white/84">
              Accepted formats: PDF and DOCX. Max file size: {formatBytes(MAX_RESUME_FILE_SIZE)}. Files are stored
              locally so the product can remain fully open-source and API-free.
            </p>
          </div>
        </Card>

        <Card>
          <form className="space-y-6" onSubmit={onSubmit}>
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[var(--color-brand-300)]">
                Upload form
              </p>
              <h2 className="mt-4 font-heading text-3xl text-white">Create analysis</h2>
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
                    : "border-white/14 bg-white/4 hover:bg-white/6"
                }`}
                onClick={() => fileInputRef.current?.click()}
                onDragEnter={(event) => {
                  event.preventDefault();
                  setIsDragging(true);
                }}
                onDragOver={(event) => {
                  event.preventDefault();
                  setIsDragging(true);
                }}
                onDragLeave={(event) => {
                  event.preventDefault();
                  setIsDragging(false);
                }}
                onDrop={(event) => {
                  event.preventDefault();
                  setIsDragging(false);

                  const file = event.dataTransfer.files?.[0] ?? null;
                  handleFileSelection(file);
                }}
              >
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                  <div className="flex size-14 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,var(--color-brand-500),var(--color-accent-500))] text-white shadow-[0_14px_35px_rgba(245,106,72,0.22)]">
                    <UploadCloud className="size-6" />
                  </div>

                  <div className="flex-1">
                    <p className="text-lg font-semibold text-white">Drag and drop your resume here</p>
                    <p className="mt-2 text-sm leading-7 text-[var(--muted-foreground)]">
                      or click to choose a local PDF or DOCX file
                    </p>
                  </div>
                </div>

                {selectedFile ? (
                  <div className="mt-5 rounded-2xl border border-white/8 bg-white/5 p-4">
                    <div className="flex items-center gap-3">
                      <FileText className="size-5 text-[var(--color-brand-300)]" />
                      <div>
                        <p className="text-sm font-medium text-white">{selectedFile.name}</p>
                        <p className="text-xs text-[var(--muted-foreground)]">{formatBytes(selectedFile.size)}</p>
                      </div>
                    </div>
                    {!isAcceptedResumeFile(selectedFile) ? (
                      <p className="mt-3 text-sm text-amber-300">
                        This file may not pass validation. Double-check the format and size before submitting.
                      </p>
                    ) : null}
                  </div>
                ) : null}
              </button>

              {errors.resume ? (
                <p className="mt-3 text-sm text-rose-300">{errors.resume.message}</p>
              ) : (
                <p className="mt-3 text-sm text-[var(--muted-foreground)]">
                  Your upload creates an analysis session, stores file metadata, and immediately starts PDF or DOCX text extraction.
                </p>
              )}
            </div>

            <div>
              <label className="mb-3 block text-sm font-medium text-white" htmlFor="jobDescription">
                Job description
              </label>
              <Textarea
                id="jobDescription"
                placeholder="Paste a target role description to prepare for keyword extraction in the next phase."
                {...register("jobDescription")}
              />
              {errors.jobDescription ? (
                <p className="mt-3 text-sm text-rose-300">{errors.jobDescription.message}</p>
              ) : (
                <p className="mt-3 text-sm text-[var(--muted-foreground)]">
                  Optional for now, but storing it now sets us up for the next keyword-extraction and scoring phases.
                </p>
              )}
            </div>

            {submitError ? (
              <div className="rounded-2xl border border-rose-400/20 bg-rose-400/10 px-4 py-3 text-sm text-rose-100">
                {submitError}
              </div>
            ) : null}

            <div className="flex flex-col gap-3 sm:flex-row">
              <Button type="submit" size="lg" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <LoaderCircle className="size-4 animate-spin" />
                    Creating analysis
                  </>
                ) : (
                  "Create analysis session"
                )}
              </Button>
              <Button
                type="button"
                variant="secondary"
                size="lg"
                onClick={() => fileInputRef.current?.click()}
              >
                Choose file
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </section>
  );
}
