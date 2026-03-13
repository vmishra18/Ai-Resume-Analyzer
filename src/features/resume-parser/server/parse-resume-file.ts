import type { ParsedResumeResult } from "@/features/resume-parser/lib/types";
import { normalizeResumeText } from "@/features/resume-parser/server/normalization";
import {
  calculateStructureScore,
  detectResumeSections,
  extractResumeSummary
} from "@/features/resume-parser/server/section-detector";
import { extractResumeText } from "@/features/resume-parser/server/extract-resume-text";

interface ParseResumeFileInput {
  filePath: string;
  mimeType: string;
}

export async function parseResumeFile(input: ParseResumeFileInput): Promise<ParsedResumeResult> {
  const rawText = await extractResumeText(input);
  const normalizedText = normalizeResumeText(rawText);

  if (!normalizedText) {
    throw new Error("No extractable text was found in the uploaded resume.");
  }

  const sections = detectResumeSections(normalizedText);
  const summary = extractResumeSummary(normalizedText);
  const structureScore = calculateStructureScore(normalizedText, sections);

  return {
    rawText,
    normalizedText,
    summary,
    structureScore,
    sections
  };
}
