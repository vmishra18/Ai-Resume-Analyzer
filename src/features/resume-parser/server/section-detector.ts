import type { ResumeSectionCompleteness } from "@/features/resume-parser/lib/types";
import { clipText, countWords } from "@/features/resume-parser/server/normalization";

const sectionPatterns = {
  summary: [/^professional summary$/i, /^summary$/i, /^profile$/i, /^objective$/i, /^about$/i],
  skills: [/^skills$/i, /^technical skills$/i, /^core competencies$/i, /^technologies$/i],
  experience: [/^experience$/i, /^work experience$/i, /^professional experience$/i, /^employment history$/i],
  education: [/^education$/i, /^academic background$/i, /^qualifications$/i],
  projects: [/^projects$/i, /^personal projects$/i, /^selected projects$/i, /^project experience$/i]
} satisfies Record<keyof ResumeSectionCompleteness, RegExp[]>;

function getNonEmptyLines(value: string) {
  return value
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
}

export function detectResumeSections(normalizedText: string): ResumeSectionCompleteness {
  const lines = getNonEmptyLines(normalizedText);

  return {
    summary: lines.some((line) => sectionPatterns.summary.some((pattern) => pattern.test(line))),
    skills: lines.some((line) => sectionPatterns.skills.some((pattern) => pattern.test(line))),
    experience: lines.some((line) => sectionPatterns.experience.some((pattern) => pattern.test(line))),
    education: lines.some((line) => sectionPatterns.education.some((pattern) => pattern.test(line))),
    projects: lines.some((line) => sectionPatterns.projects.some((pattern) => pattern.test(line)))
  };
}

function findHeadingLineIndex(lines: string[], patterns: RegExp[]) {
  return lines.findIndex((line) => patterns.some((pattern) => pattern.test(line)));
}

function isLikelyHeading(line: string) {
  const normalizedLine = line.trim();

  return Object.values(sectionPatterns).some((patterns) => patterns.some((pattern) => pattern.test(normalizedLine)));
}

export function extractResumeSummary(normalizedText: string) {
  const lines = getNonEmptyLines(normalizedText);
  const summaryIndex = findHeadingLineIndex(lines, sectionPatterns.summary);

  if (summaryIndex >= 0) {
    const collected: string[] = [];

    for (let index = summaryIndex + 1; index < lines.length; index += 1) {
      const line = lines[index];

      if (isLikelyHeading(line)) {
        break;
      }

      collected.push(line);

      if (collected.join(" ").length >= 420) {
        break;
      }
    }

    return collected.length > 0 ? clipText(collected.join(" "), 420) : null;
  }

  const fallback = lines.filter((line) => !isLikelyHeading(line)).slice(0, 3).join(" ");

  return fallback ? clipText(fallback, 320) : null;
}

export function calculateStructureScore(
  normalizedText: string,
  sections: ResumeSectionCompleteness
) {
  const lines = getNonEmptyLines(normalizedText);
  const wordCount = countWords(normalizedText);
  const bulletCount = normalizedText.split("\n").filter((line) => /^\s*[-*]/.test(line)).length;
  const presentSections = Object.values(sections).filter(Boolean).length;

  let score = 0;

  score += presentSections * 12;
  score += wordCount >= 250 && wordCount <= 1200 ? 20 : wordCount >= 150 ? 10 : 0;
  score += bulletCount >= 6 ? 12 : bulletCount >= 3 ? 6 : 0;
  score += lines.length >= 12 && lines.length <= 140 ? 10 : lines.length >= 8 ? 5 : 0;

  return Math.min(score, 100);
}
