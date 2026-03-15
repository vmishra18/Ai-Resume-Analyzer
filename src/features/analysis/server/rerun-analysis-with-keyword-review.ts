import type {
  KeywordCategory as PrismaKeywordCategory,
  KeywordMatchType as PrismaKeywordMatchType,
  Prisma,
  SuggestionPriority as PrismaSuggestionPriority,
  SuggestionType as PrismaSuggestionType
} from "@prisma/client";

import { analyzeResumeAgainstJob } from "@/features/analysis/server/analysis-engine";
import type { ScoreExplanation } from "@/features/analysis/lib/types";
import { buildReviewedJobDescription } from "@/features/job-description/server/keyword-review";
import type { ProcessedJobDescription } from "@/features/job-description/lib/types";
import type { ParsedResumeResult } from "@/features/resume-parser/lib/types";
import { db } from "@/lib/db";

interface KeywordReviewInput {
  mustHaveKeywordsText: string;
  supportingKeywordsText: string;
}

function toPrismaKeywordCategory(category: string) {
  return category.toUpperCase() as PrismaKeywordCategory;
}

function toPrismaKeywordMatchType(matchType: string) {
  return matchType.toUpperCase() as PrismaKeywordMatchType;
}

function toPrismaSuggestionPriority(priority: string) {
  return priority.toUpperCase() as PrismaSuggestionPriority;
}

function toPrismaSuggestionType(suggestionType: string) {
  return suggestionType.toUpperCase() as PrismaSuggestionType;
}

function toParsedResumeResult(value: {
  rawText: string;
  normalizedText: string;
  summary: string | null;
  structureScore: number;
  hasSummary: boolean;
  hasSkills: boolean;
  hasExperience: boolean;
  hasEducation: boolean;
  hasProjects: boolean;
}): ParsedResumeResult {
  return {
    rawText: value.rawText,
    normalizedText: value.normalizedText,
    summary: value.summary,
    structureScore: value.structureScore,
    sections: {
      summary: value.hasSummary,
      skills: value.hasSkills,
      experience: value.hasExperience,
      education: value.hasEducation,
      projects: value.hasProjects
    }
  };
}

function toProcessedJobDescription(value: {
  rawText: string;
  normalizedText: string;
  title: string | null;
  company: string | null;
  seniority: string | null;
  requiredYearsExperience: number | null;
  extractedKeywords: unknown;
  mustHaveKeywords: unknown;
  niceToHaveKeywords: unknown;
}, filteredOutPhrases: string[]): ProcessedJobDescription {
  return {
    rawText: value.rawText,
    normalizedText: value.normalizedText,
    title: value.title,
    company: value.company,
    seniority: value.seniority,
    requiredYearsExperience: value.requiredYearsExperience,
    extractedKeywords: Array.isArray(value.extractedKeywords) ? (value.extractedKeywords as ProcessedJobDescription["extractedKeywords"]) : [],
    mustHaveKeywords: Array.isArray(value.mustHaveKeywords) ? (value.mustHaveKeywords as ProcessedJobDescription["mustHaveKeywords"]) : [],
    niceToHaveKeywords: Array.isArray(value.niceToHaveKeywords) ? (value.niceToHaveKeywords as ProcessedJobDescription["niceToHaveKeywords"]) : [],
    filteredOutPhrases
  };
}

export async function rerunAnalysisWithKeywordReview(
  sessionId: string,
  userId: string,
  input: KeywordReviewInput
) {
  const session = await db.analysisSession.findFirst({
    where: {
      id: sessionId,
      userId
    },
    include: {
      parsedResume: true,
      jobDescription: true,
      scoringSummary: true
    }
  });

  if (!session) {
    throw new Error("Analysis session not found.");
  }

  if (!session.parsedResume || !session.jobDescription) {
    throw new Error("This analysis cannot be rescored without parsed resume text and a saved job description.");
  }

  const beforeScore = session.overallScore;
  const beforeBreakdown = session.scoringSummary
    ? [
        { label: "Keywords", value: session.scoringSummary.keywordMatchScore },
        { label: "Must-haves", value: session.scoringSummary.mustHaveSkillScore },
        { label: "Sections", value: session.scoringSummary.sectionCompletenessScore },
        { label: "Relevance", value: session.scoringSummary.roleRelevanceScore },
        { label: "Structure", value: session.scoringSummary.structureQualityScore },
        { label: "Alignment", value: session.scoringSummary.alignmentScore }
      ]
    : [];
  const scoreExplanation = (session.scoringSummary?.explanation ?? null) as ScoreExplanation | null;
  const reviewedJobDescription = buildReviewedJobDescription(
    toProcessedJobDescription(session.jobDescription, scoreExplanation?.filteredOutPhrases ?? []),
    input
  );
  const analysisSummary = analyzeResumeAgainstJob(toParsedResumeResult(session.parsedResume), reviewedJobDescription);

  await db.$transaction(async (transaction) => {
    await transaction.analysisSession.update({
      where: { id: session.id },
      data: {
        status: "COMPLETED",
        overallScore: analysisSummary.score.total
      }
    });

    await transaction.jobDescription.update({
      where: { sessionId: session.id },
      data: {
        extractedKeywords: reviewedJobDescription.extractedKeywords as unknown as Prisma.InputJsonValue,
        mustHaveKeywords: reviewedJobDescription.mustHaveKeywords as unknown as Prisma.InputJsonValue,
        niceToHaveKeywords: reviewedJobDescription.niceToHaveKeywords as unknown as Prisma.InputJsonValue
      }
    });

    await transaction.scoringSummary.upsert({
      where: { sessionId: session.id },
      create: {
        sessionId: session.id,
        keywordMatchScore: analysisSummary.score.keywordMatch,
        mustHaveSkillScore: analysisSummary.score.mustHaveSkills,
        sectionCompletenessScore: analysisSummary.score.sectionCompleteness,
        roleRelevanceScore: analysisSummary.score.roleRelevance,
        structureQualityScore: analysisSummary.score.structureQuality,
        alignmentScore: analysisSummary.score.alignment,
        bonusScore: analysisSummary.score.bonus,
        explanation: analysisSummary.explanation as unknown as Prisma.InputJsonValue
      },
      update: {
        keywordMatchScore: analysisSummary.score.keywordMatch,
        mustHaveSkillScore: analysisSummary.score.mustHaveSkills,
        sectionCompletenessScore: analysisSummary.score.sectionCompleteness,
        roleRelevanceScore: analysisSummary.score.roleRelevance,
        structureQualityScore: analysisSummary.score.structureQuality,
        alignmentScore: analysisSummary.score.alignment,
        bonusScore: analysisSummary.score.bonus,
        explanation: analysisSummary.explanation as unknown as Prisma.InputJsonValue
      }
    });

    await transaction.keywordResult.deleteMany({
      where: { sessionId: session.id }
    });

    const allKeywordResults = [
      ...analysisSummary.matchedKeywords,
      ...analysisSummary.partialKeywords,
      ...analysisSummary.missingKeywords
    ];

    if (allKeywordResults.length > 0) {
      await transaction.keywordResult.createMany({
        data: allKeywordResults.map((keyword) => ({
          sessionId: session.id,
          keyword: keyword.keyword,
          normalizedKeyword: keyword.normalizedKeyword,
          category: toPrismaKeywordCategory(keyword.category),
          matchType: toPrismaKeywordMatchType(keyword.matchType),
          occurrences: keyword.occurrences
        }))
      });
    }

    await transaction.suggestion.deleteMany({
      where: { sessionId: session.id }
    });

    if (analysisSummary.suggestions.length > 0) {
      await transaction.suggestion.createMany({
        data: analysisSummary.suggestions.map((suggestion) => ({
          sessionId: session.id,
          title: suggestion.title,
          description: suggestion.description,
          priority: toPrismaSuggestionPriority(suggestion.priority),
          suggestionType: toPrismaSuggestionType(suggestion.suggestionType)
        }))
      });
    }
  });

  return {
    sessionId: session.id,
    overallScore: analysisSummary.score.total,
    before: {
      overallScore: beforeScore,
      scoreBreakdown: beforeBreakdown
    },
    after: {
      overallScore: analysisSummary.score.total,
      scoreBreakdown: [
        { label: "Keywords", value: analysisSummary.score.keywordMatch },
        { label: "Must-haves", value: analysisSummary.score.mustHaveSkills },
        { label: "Sections", value: analysisSummary.score.sectionCompleteness },
        { label: "Relevance", value: analysisSummary.score.roleRelevance },
        { label: "Structure", value: analysisSummary.score.structureQuality },
        { label: "Alignment", value: analysisSummary.score.alignment }
      ]
    }
  };
}
