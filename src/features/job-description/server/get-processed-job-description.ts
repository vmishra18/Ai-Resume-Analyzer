import { createHash } from "node:crypto";

import type { Prisma } from "@prisma/client";

import type { ProcessedJobDescription } from "@/features/job-description/lib/types";
import { processJobDescription } from "@/features/job-description/server/process-job-description";
import { db } from "@/lib/db";

function getJobDescriptionHash(value: string) {
  return createHash("sha256").update(value.trim().toLowerCase()).digest("hex");
}

function toCachePayload(value: ProcessedJobDescription) {
  return {
    rawText: value.rawText,
    normalizedText: value.normalizedText,
    title: value.title,
    company: value.company,
    seniority: value.seniority,
    requiredYearsExperience: value.requiredYearsExperience,
    extractedKeywords: value.extractedKeywords as unknown as Prisma.InputJsonValue,
    mustHaveKeywords: value.mustHaveKeywords as unknown as Prisma.InputJsonValue,
    niceToHaveKeywords: value.niceToHaveKeywords as unknown as Prisma.InputJsonValue,
    filteredOutPhrases: value.filteredOutPhrases as unknown as Prisma.InputJsonValue
  };
}

function fromCachePayload(value: {
  rawText: string;
  normalizedText: string;
  title: string | null;
  company: string | null;
  seniority: string | null;
  requiredYearsExperience: number | null;
  extractedKeywords: unknown;
  mustHaveKeywords: unknown;
  niceToHaveKeywords: unknown;
  filteredOutPhrases: unknown;
}): ProcessedJobDescription {
  return {
    rawText: value.rawText,
    normalizedText: value.normalizedText,
    title: value.title,
    company: value.company,
    seniority: value.seniority,
    requiredYearsExperience: value.requiredYearsExperience,
    extractedKeywords: Array.isArray(value.extractedKeywords) ? value.extractedKeywords as ProcessedJobDescription["extractedKeywords"] : [],
    mustHaveKeywords: Array.isArray(value.mustHaveKeywords) ? value.mustHaveKeywords as ProcessedJobDescription["mustHaveKeywords"] : [],
    niceToHaveKeywords: Array.isArray(value.niceToHaveKeywords) ? value.niceToHaveKeywords as ProcessedJobDescription["niceToHaveKeywords"] : [],
    filteredOutPhrases: Array.isArray(value.filteredOutPhrases) ? value.filteredOutPhrases as string[] : []
  };
}

export async function getProcessedJobDescription(rawText: string) {
  const hash = getJobDescriptionHash(rawText);
  const cached = await db.jobDescriptionCache.findUnique({
    where: { hash }
  });

  if (cached) {
    return fromCachePayload(cached);
  }

  const processed = processJobDescription(rawText);

  await db.jobDescriptionCache.create({
    data: {
      hash,
      ...toCachePayload(processed)
    }
  });

  return processed;
}
