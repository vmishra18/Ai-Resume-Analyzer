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

export async function getAnalysisSessionOrNull(id: string) {
  return db.analysisSession.findUnique({
    where: { id },
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
    sessionTitle: session.title,
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
    scoreSummary: scoreExplanation
      ? {
          keywordCoverage: scoreExplanation.keywordCoverage,
          mustHaveCoverage: scoreExplanation.mustHaveCoverage,
          matchedKeywords: scoreExplanation.matchedKeywordCount,
          partialKeywords: scoreExplanation.partialKeywordCount,
          totalKeywords: scoreExplanation.totalKeywordCount,
          bonusSignals: scoreExplanation.bonusSignals
        }
      : null,
    roleMeta: session.jobDescription
      ? {
          title: session.jobDescription.title,
          seniority: session.jobDescription.seniority,
          extractedKeywordCount: extractedJobKeywords.length
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
