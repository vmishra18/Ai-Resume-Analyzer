import type {
  AnalysisSession,
  JobDescription,
  KeywordResult,
  ParsedResume,
  ScoringSummary,
  Suggestion,
  UploadedFile
} from "@prisma/client";
import { db } from "@/lib/db";
import { formatBytes } from "@/features/upload/lib/helpers";
import type { ScoreExplanation } from "@/features/analysis/lib/types";
import type { JobDescriptionKeyword } from "@/features/job-description/lib/types";
import { clipText, countWords } from "@/features/resume-parser/server/normalization";

type AnalysisSessionRecord = AnalysisSession & {
  uploadedFile: UploadedFile | null;
  parsedResume: ParsedResume | null;
  jobDescription: JobDescription | null;
  scoringSummary: ScoringSummary | null;
  keywordResults: KeywordResult[];
  suggestions: Suggestion[];
};

function getJobDescriptionKeywords(value: unknown) {
  return Array.isArray(value) ? (value as JobDescriptionKeyword[]) : [];
}

function getScoreExplanation(value: unknown) {
  return (value ?? null) as ScoreExplanation | null;
}

function getSafeScoreSummary(scoreExplanation: ScoreExplanation | null) {
  if (!scoreExplanation) {
    return null;
  }

  return {
    keywordCoverage: scoreExplanation.keywordCoverage,
    mustHaveCoverage: scoreExplanation.mustHaveCoverage,
    matchedKeywords: scoreExplanation.matchedKeywordCount,
    partialKeywords: scoreExplanation.partialKeywordCount,
    totalKeywords: scoreExplanation.totalKeywordCount,
    bonusSignals: scoreExplanation.bonusSignals ?? [],
    readabilityScore: scoreExplanation.readabilityScore,
    bulletQualityScore: scoreExplanation.bulletQualityScore,
    estimatedYearsExperience: scoreExplanation.estimatedYearsExperience,
    requiredYearsExperience: scoreExplanation.requiredYearsExperience,
    roleFamily: scoreExplanation.roleFamily ?? null,
    resumeRoleFamily: scoreExplanation.resumeRoleFamily ?? null,
    roleFamilyAlignment: scoreExplanation.roleFamilyAlignment ?? "unknown",
    detectedResumeSeniority: scoreExplanation.detectedResumeSeniority ?? null,
    seniorityMismatch: scoreExplanation.seniorityMismatch ?? {
      hasMismatch: false,
      jobSeniority: null,
      resumeSeniority: null,
      summary: null
    },
    semanticMatches: scoreExplanation.semanticMatches ?? [],
    achievementSignals: scoreExplanation.achievementSignals ?? [],
    weakBullets: scoreExplanation.weakBullets ?? [],
    rewriteAssist: scoreExplanation.rewriteAssist ?? []
  };
}

function toTitleCase(value: string) {
  return value
    .split(" ")
    .filter(Boolean)
    .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1).toLowerCase())
    .join(" ");
}

function normalizeSessionLabel(value: string) {
  return value
    .replace(/\.[^.]+$/g, "")
    .replace(/[-_]+/g, " ")
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .replace(/\s+/g, " ")
    .trim();
}

function buildDisplaySessionTitle(session: AnalysisSessionRecord) {
  const roleTitle = session.jobDescription?.title?.trim();

  if (roleTitle) {
    return `${roleTitle} Resume Match`;
  }

  const fileName = session.uploadedFile?.originalName?.trim();

  if (fileName) {
    const normalized = normalizeSessionLabel(fileName);
    const shortened = clipText(toTitleCase(normalized), 48);

    return shortened.length > 0 ? `${shortened} Match` : "Resume Match";
  }

  return "Resume Match";
}

export async function getAnalysisSessionOrNull(id: string, userId?: string) {
  return db.analysisSession.findFirst({
    where: userId
      ? {
          id,
          userId
        }
      : { id },
    include: {
      keywordResults: {
        orderBy: [{ matchType: "asc" }, { occurrences: "desc" }]
      },
      parsedResume: true,
      scoringSummary: true,
      suggestions: {
        orderBy: [{ priority: "asc" }, { createdAt: "asc" }]
      },
      uploadedFile: true,
      jobDescription: true
    }
  });
}

export function buildAnalysisDashboardData(session: AnalysisSessionRecord) {
  const createdAt = new Intl.DateTimeFormat("en-GB", {
    dateStyle: "medium",
    timeStyle: "short"
  }).format(session.createdAt);

  const scoreExplanation = getScoreExplanation(session.scoringSummary?.explanation);
  const extractedJobKeywords = getJobDescriptionKeywords(session.jobDescription?.extractedKeywords);
  const mustHaveKeywords = getJobDescriptionKeywords(session.jobDescription?.mustHaveKeywords);
  const niceToHaveKeywords = getJobDescriptionKeywords(session.jobDescription?.niceToHaveKeywords);

  return {
    sessionTitle: buildDisplaySessionTitle(session),
    status: session.status,
    createdAt,
    overallScore: session.overallScore,
    scoreBreakdown: session.scoringSummary
      ? [
          { label: "Keywords", value: session.scoringSummary.keywordMatchScore },
          { label: "Must-haves", value: session.scoringSummary.mustHaveSkillScore },
          { label: "Sections", value: session.scoringSummary.sectionCompletenessScore },
          { label: "Relevance", value: session.scoringSummary.roleRelevanceScore },
          { label: "Structure", value: session.scoringSummary.structureQualityScore },
          { label: "Alignment", value: session.scoringSummary.alignmentScore }
        ]
      : [],
    scoreSummary: getSafeScoreSummary(scoreExplanation),
    roleMeta: session.jobDescription
      ? {
          title: session.jobDescription.title,
          seniority: session.jobDescription.seniority,
          extractedKeywordCount: extractedJobKeywords.length,
          requiredYearsExperience: session.jobDescription.requiredYearsExperience
        }
      : null,
    fileMeta: session.uploadedFile
      ? {
          originalName: session.uploadedFile.originalName,
          mimeType: session.uploadedFile.mimeType,
          sizeLabel: formatBytes(session.uploadedFile.sizeBytes)
        }
      : null,
    parsedResume: session.parsedResume
      ? {
          wordCount: countWords(session.parsedResume.normalizedText),
          structureScore: session.parsedResume.structureScore,
          summary: session.parsedResume.summary,
          normalizedPreview: clipText(session.parsedResume.normalizedText, 1600),
          sections: [
            { label: "Summary", value: session.parsedResume.hasSummary },
            { label: "Skills", value: session.parsedResume.hasSkills },
            { label: "Experience", value: session.parsedResume.hasExperience },
            { label: "Education", value: session.parsedResume.hasEducation },
            { label: "Projects", value: session.parsedResume.hasProjects }
          ]
        }
      : null,
    jobDescriptionRawText: session.jobDescription?.rawText ?? null,
    mustHaveKeywords: mustHaveKeywords.map((keyword) => ({
      id: `${keyword.category}-${keyword.normalizedKeyword}`,
      label: keyword.keyword
    })),
    niceToHaveKeywords: niceToHaveKeywords.map((keyword) => ({
      id: `${keyword.category}-${keyword.normalizedKeyword}`,
      label: keyword.keyword
    })),
    matchedKeywords: session.keywordResults
      .filter((keyword) => keyword.matchType === "MATCHED")
      .map((keyword) => ({
        id: keyword.id,
        label: keyword.keyword
      })),
    partialKeywords: session.keywordResults
      .filter((keyword) => keyword.matchType === "PARTIAL")
      .map((keyword) => ({
        id: keyword.id,
        label: keyword.keyword
      })),
    missingKeywords: session.keywordResults
      .filter((keyword) => keyword.matchType === "MISSING")
      .map((keyword) => ({
        id: keyword.id,
        label: keyword.keyword
      })),
    suggestions: session.suggestions.map((suggestion) => ({
      id: suggestion.id,
      title: suggestion.title,
      description: suggestion.description,
      priority: suggestion.priority.toLowerCase()
    })),
    reportData: {
      createdAt,
      roleTitle: session.jobDescription?.title ?? "Not detected",
      seniority: session.jobDescription?.seniority ?? "Not detected",
      overallScore: session.overallScore,
      fileName: session.uploadedFile?.originalName ?? "Unknown file",
      status: session.status,
      matchedKeywords: session.keywordResults
        .filter((keyword) => keyword.matchType === "MATCHED")
        .map((keyword) => keyword.keyword),
      partialKeywords: session.keywordResults
        .filter((keyword) => keyword.matchType === "PARTIAL")
        .map((keyword) => keyword.keyword),
      missingKeywords: session.keywordResults
        .filter((keyword) => keyword.matchType === "MISSING")
        .map((keyword) => keyword.keyword),
      suggestions: session.suggestions.map((suggestion) => ({
        title: suggestion.title,
        description: suggestion.description,
        priority: suggestion.priority
      })),
      scoreBreakdown: session.scoringSummary
        ? ([
            ["Keyword match", session.scoringSummary.keywordMatchScore],
            ["Must-have skills", session.scoringSummary.mustHaveSkillScore],
            ["Section completeness", session.scoringSummary.sectionCompletenessScore],
            ["Role relevance", session.scoringSummary.roleRelevanceScore],
            ["Structure quality", session.scoringSummary.structureQualityScore],
            ["Job alignment", session.scoringSummary.alignmentScore],
            ["Bonus", session.scoringSummary.bonusScore]
          ] as Array<[string, number]>)
        : []
    }
  };
}
