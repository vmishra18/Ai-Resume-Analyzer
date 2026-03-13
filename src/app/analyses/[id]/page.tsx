import { notFound } from "next/navigation";

import type { ScoreExplanation } from "@/features/analysis/lib/types";
import { AnalysisDashboard } from "@/features/analysis/components/analysis-dashboard";
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

function getScoreExplanation(value: unknown) {
  return (value ?? null) as ScoreExplanation | null;
}

export default async function AnalysisDetailPage({ params }: AnalysisDetailPageProps) {
  const { id } = await params;

  const session = await db.analysisSession.findUnique({
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

  if (!session) {
    notFound();
  }

  const createdAt = new Intl.DateTimeFormat("en-GB", {
    dateStyle: "medium",
    timeStyle: "short"
  }).format(session.createdAt);

  const scoreExplanation = getScoreExplanation(session.scoringSummary?.explanation);
  const extractedJobKeywords = getJobDescriptionKeywords(session.jobDescription?.extractedKeywords);
  const mustHaveKeywords = getJobDescriptionKeywords(session.jobDescription?.mustHaveKeywords);
  const niceToHaveKeywords = getJobDescriptionKeywords(session.jobDescription?.niceToHaveKeywords);

  return (
    <AnalysisDashboard
      sessionTitle={session.title}
      status={session.status}
      createdAt={createdAt}
      overallScore={session.overallScore}
      scoreBreakdown={
        session.scoringSummary
          ? [
              { label: "Keywords", value: session.scoringSummary.keywordMatchScore },
              { label: "Must-haves", value: session.scoringSummary.mustHaveSkillScore },
              { label: "Sections", value: session.scoringSummary.sectionCompletenessScore },
              { label: "Relevance", value: session.scoringSummary.roleRelevanceScore },
              { label: "Structure", value: session.scoringSummary.structureQualityScore },
              { label: "Alignment", value: session.scoringSummary.alignmentScore }
            ]
          : []
      }
      scoreSummary={
        scoreExplanation
          ? {
              keywordCoverage: scoreExplanation.keywordCoverage,
              mustHaveCoverage: scoreExplanation.mustHaveCoverage,
              matchedKeywords: scoreExplanation.matchedKeywordCount,
              partialKeywords: scoreExplanation.partialKeywordCount,
              totalKeywords: scoreExplanation.totalKeywordCount,
              bonusSignals: scoreExplanation.bonusSignals
            }
          : null
      }
      roleMeta={
        session.jobDescription
          ? {
              title: session.jobDescription.title,
              seniority: session.jobDescription.seniority,
              extractedKeywordCount: extractedJobKeywords.length
            }
          : null
      }
      fileMeta={
        session.uploadedFile
          ? {
              originalName: session.uploadedFile.originalName,
              mimeType: session.uploadedFile.mimeType,
              sizeLabel: formatBytes(session.uploadedFile.sizeBytes)
            }
          : null
      }
      parsedResume={
        session.parsedResume
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
          : null
      }
      jobDescriptionRawText={session.jobDescription?.rawText ?? null}
      mustHaveKeywords={mustHaveKeywords.map((keyword) => ({
        id: `${keyword.category}-${keyword.normalizedKeyword}`,
        label: keyword.keyword
      }))}
      niceToHaveKeywords={niceToHaveKeywords.map((keyword) => ({
        id: `${keyword.category}-${keyword.normalizedKeyword}`,
        label: keyword.keyword
      }))}
      matchedKeywords={session.keywordResults
        .filter((keyword) => keyword.matchType === "MATCHED")
        .map((keyword) => ({
          id: keyword.id,
          label: keyword.keyword
        }))}
      partialKeywords={session.keywordResults
        .filter((keyword) => keyword.matchType === "PARTIAL")
        .map((keyword) => ({
          id: keyword.id,
          label: keyword.keyword
        }))}
      missingKeywords={session.keywordResults
        .filter((keyword) => keyword.matchType === "MISSING")
        .map((keyword) => ({
          id: keyword.id,
          label: keyword.keyword
        }))}
      suggestions={session.suggestions.map((suggestion) => ({
        id: suggestion.id,
        title: suggestion.title,
        description: suggestion.description,
        priority: suggestion.priority.toLowerCase()
      }))}
    />
  );
}
