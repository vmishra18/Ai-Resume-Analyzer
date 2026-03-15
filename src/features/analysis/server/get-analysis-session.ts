import type {
  AnalysisSession,
  JobDescription,
  KeywordResult,
  ParsedResume,
  ScoringSummary,
  Suggestion,
  UploadedFile
} from "@prisma/client";

import type { ScoreExplanation } from "@/features/analysis/lib/types";
import type { JobDescriptionKeyword, ProcessedJobDescription } from "@/features/job-description/lib/types";
import { buildKeywordReviewText } from "@/features/job-description/server/keyword-review";
import { formatBytes } from "@/features/upload/lib/helpers";
import { clipText, countWords } from "@/features/resume-parser/server/normalization";
import { db } from "@/lib/db";

type AnalysisSessionRecord = AnalysisSession & {
  uploadedFile: UploadedFile | null;
  parsedResume: ParsedResume | null;
  jobDescription: JobDescription | null;
  scoringSummary: ScoringSummary | null;
  keywordResults: KeywordResult[];
  suggestions: Suggestion[];
};

type ConfidenceLevel = "high" | "medium" | "low";

function getJobDescriptionKeywords(value: unknown) {
  return Array.isArray(value) ? (value as JobDescriptionKeyword[]) : [];
}

function getScoreExplanation(value: unknown) {
  return (value ?? null) as ScoreExplanation | null;
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

function toProcessedJobDescription(jobDescription: JobDescription): ProcessedJobDescription {
  return {
    rawText: jobDescription.rawText,
    normalizedText: jobDescription.normalizedText,
    title: jobDescription.title,
    company: jobDescription.company,
    seniority: jobDescription.seniority,
    requiredYearsExperience: jobDescription.requiredYearsExperience,
    extractedKeywords: getJobDescriptionKeywords(jobDescription.extractedKeywords),
    mustHaveKeywords: getJobDescriptionKeywords(jobDescription.mustHaveKeywords),
    niceToHaveKeywords: getJobDescriptionKeywords(jobDescription.niceToHaveKeywords),
    filteredOutPhrases: []
  };
}

function getSafeScoreSummary(scoreExplanation: ScoreExplanation | null) {
  if (!scoreExplanation) {
    return null;
  }

  return {
    keywordCoverage: scoreExplanation.keywordCoverage,
    matchedKeywords: scoreExplanation.matchedKeywordCount,
    partialKeywords: scoreExplanation.partialKeywordCount,
    totalKeywords: scoreExplanation.totalKeywordCount,
    mustHaveCoverage: scoreExplanation.mustHaveCoverage,
    matchedMustHaveCount: scoreExplanation.matchedMustHaveCount,
    partialMustHaveCount: scoreExplanation.partialMustHaveCount,
    totalMustHaveCount: scoreExplanation.totalMustHaveCount,
    readabilityScore: scoreExplanation.readabilityScore,
    bulletQualityScore: scoreExplanation.bulletQualityScore,
    estimatedYearsExperience: scoreExplanation.estimatedYearsExperience,
    requiredYearsExperience: scoreExplanation.requiredYearsExperience,
    bonusSignals: scoreExplanation.bonusSignals ?? [],
    canonicalMatchedKeywords: scoreExplanation.canonicalMatchedKeywords ?? [],
    canonicalPartialKeywords: scoreExplanation.canonicalPartialKeywords ?? [],
    canonicalMissingKeywords: scoreExplanation.canonicalMissingKeywords ?? [],
    filteredOutPhrases: scoreExplanation.filteredOutPhrases ?? [],
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

function getConfidenceTone(level: ConfidenceLevel) {
  switch (level) {
    case "high":
      return "high";
    case "medium":
      return "medium";
    default:
      return "low";
  }
}

function buildParserConfidence(session: AnalysisSessionRecord) {
  if (!session.parsedResume) {
    return {
      level: "low" as ConfidenceLevel,
      tone: getConfidenceTone("low"),
      label: "Parser confidence",
      summary: session.status === "FAILED" ? "We could not extract reliable text from this file." : "Parsed resume text is not available yet.",
      notes: [
        session.status === "FAILED"
          ? "Try a text-based PDF or DOCX export instead of a scanned or image-only file."
          : "Wait for the analysis to finish or rerun the upload if this state persists."
      ]
    };
  }

  const notes: string[] = [];
  const wordCount = countWords(session.parsedResume.normalizedText);
  const sectionCount = [
    session.parsedResume.hasSummary,
    session.parsedResume.hasSkills,
    session.parsedResume.hasExperience,
    session.parsedResume.hasEducation,
    session.parsedResume.hasProjects
  ].filter(Boolean).length;
  let level: ConfidenceLevel = "high";

  if (wordCount < 220 || session.parsedResume.structureScore < 45 || sectionCount <= 2) {
    level = "low";
  } else if (wordCount < 320 || session.parsedResume.structureScore < 65 || sectionCount <= 3) {
    level = "medium";
  }

  if (wordCount < 220) {
    notes.push("The parsed text is unusually short, which often means content was missed during extraction.");
  }

  if (sectionCount <= 3) {
    notes.push("Several standard resume sections were not detected automatically.");
  }

  if (!session.parsedResume.summary) {
    notes.push("No summary section was extracted, so top-of-resume context may be underrepresented.");
  }

  if (notes.length === 0) {
    notes.push("The parser found enough text and structure to make the section and readability checks credible.");
  }

  return {
    level,
    tone: getConfidenceTone(level),
    label: "Parser confidence",
    summary:
      level === "high"
        ? "The resume parse looks stable enough to trust the section and readability signals."
        : level === "medium"
          ? "The parse is usable, but a few structure cues suggest you should sanity-check the evidence."
          : "The parse looks fragile, so review the raw evidence before trusting the score too strongly.",
    notes
  };
}

function buildScoringConfidence(
  roleKeywords: JobDescriptionKeyword[],
  scoreSummary: ReturnType<typeof getSafeScoreSummary>
) {
  if (!scoreSummary || roleKeywords.length === 0) {
    return {
      level: "low" as ConfidenceLevel,
      tone: getConfidenceTone("low"),
      label: "Scoring confidence",
      summary: "There is not enough role-specific input yet for a trustworthy job match score.",
      notes: ["Add or review job-description keywords to make the comparison more representative."]
    };
  }

  const notes: string[] = [];
  let level: ConfidenceLevel = "high";
  const directCoverage = scoreSummary.totalKeywords > 0 ? scoreSummary.matchedKeywords / scoreSummary.totalKeywords : 0;
  const semanticShare =
    scoreSummary.totalKeywords > 0 ? scoreSummary.semanticMatches.length / scoreSummary.totalKeywords : 0;

  if (roleKeywords.length < 8 || semanticShare > 0.25 || scoreSummary.totalMustHaveCount === 0) {
    level = "medium";
  }

  if (roleKeywords.length < 5 || semanticShare > 0.4) {
    level = "low";
  }

  if (roleKeywords.length < 8) {
    notes.push("The role keyword set is small, so the score may be missing some important requirements.");
  }

  if (scoreSummary.totalMustHaveCount === 0) {
    notes.push("No must-have list was detected, so all keywords are being treated more evenly than usual.");
  }

  if (semanticShare > 0.25) {
    notes.push("A large share of the overlap is inferred indirectly rather than named explicitly.");
  }

  if (directCoverage >= 0.55) {
    notes.push("A healthy portion of the score is supported by direct keyword evidence from the resume.");
  }

  if (notes.length === 0) {
    notes.push("The extracted role keywords and must-have signals are strong enough to make the score reasonably stable.");
  }

  return {
    level,
    tone: getConfidenceTone(level),
    label: "Scoring confidence",
    summary:
      level === "high"
        ? "The role input is strong enough that the score should track real resume changes fairly well."
        : level === "medium"
          ? "The score is useful, but you should review the extracted keywords before over-trusting small differences."
          : "The score needs keyword review before it should guide a major decision.",
    notes
  };
}

function buildScoreDrivers(scoreSummary: ReturnType<typeof getSafeScoreSummary>, scoringSummary: ScoringSummary | null) {
  if (!scoreSummary || !scoringSummary) {
    return [];
  }

  return [
    {
      label: "Keyword match",
      value: `${scoreSummary.keywordCoverage}%`,
      score: scoringSummary.keywordMatchScore,
      summary: "Measures how many extracted role terms show up directly or partially in the resume."
    },
    {
      label: "Must-have coverage",
      value:
        scoreSummary.totalMustHaveCount > 0
          ? `${scoreSummary.matchedMustHaveCount + scoreSummary.partialMustHaveCount}/${scoreSummary.totalMustHaveCount}`
          : "None detected",
      score: scoringSummary.mustHaveSkillScore,
      summary: "Focuses on the skills that appear most critical in the job description."
    },
    {
      label: "Readability and structure",
      value: `${scoreSummary.readabilityScore}/100`,
      score: scoringSummary.structureQualityScore,
      summary: "Reflects scanability, section coverage, and the quality of bullet writing."
    },
    {
      label: "Role alignment",
      value: scoreSummary.roleFamilyAlignment,
      score: scoringSummary.alignmentScore,
      summary: "Checks whether the resume reads like the same kind of role the job description is targeting."
    }
  ];
}

function buildStrengthAndGapSummaries(
  session: AnalysisSessionRecord,
  mustHaveKeywords: JobDescriptionKeyword[],
  scoreSummary: ReturnType<typeof getSafeScoreSummary>
) {
  const mustHaveSet = new Set(mustHaveKeywords.map((keyword) => keyword.normalizedKeyword));
  const matchedKeywords = session.keywordResults
    .filter((keyword) => keyword.matchType === "MATCHED")
    .sort((left, right) => {
      const mustHaveDelta = Number(mustHaveSet.has(right.normalizedKeyword)) - Number(mustHaveSet.has(left.normalizedKeyword));

      return mustHaveDelta !== 0 ? mustHaveDelta : right.occurrences - left.occurrences;
    })
    .slice(0, 3)
    .map((keyword) => ({
      label: keyword.keyword,
      reason: mustHaveSet.has(keyword.normalizedKeyword)
        ? "Directly matched from the must-have set."
        : keyword.occurrences > 1
          ? `Found ${keyword.occurrences} times in the resume.`
          : "Directly matched in the resume."
    }));

  const missingKeywords = session.keywordResults
    .filter((keyword) => keyword.matchType === "MISSING")
    .sort((left, right) => {
      const mustHaveDelta = Number(mustHaveSet.has(right.normalizedKeyword)) - Number(mustHaveSet.has(left.normalizedKeyword));

      return mustHaveDelta !== 0 ? mustHaveDelta : left.keyword.localeCompare(right.keyword);
    })
    .slice(0, 3)
    .map((keyword) => ({
      label: keyword.keyword,
      reason: mustHaveSet.has(keyword.normalizedKeyword)
        ? "Marked as a must-have but not found directly in the resume."
        : "Detected in the role keyword set but not matched strongly yet."
    }));

  const partialGaps = session.keywordResults
    .filter((keyword) => keyword.matchType === "PARTIAL")
    .slice(0, 2)
    .map((keyword) => ({
      label: keyword.keyword,
      reason: "Only partially matched, so naming it more directly could lift the score."
    }));

  return {
    strengths: matchedKeywords,
    gaps: [...missingKeywords, ...partialGaps].slice(0, 3),
    nextMove:
      missingKeywords.length > 0
        ? `Start by tightening evidence for ${missingKeywords
            .slice(0, 2)
            .map((keyword) => keyword.label)
            .join(" and ")} before adjusting lower-priority wording.`
        : scoreSummary?.weakBullets.length
          ? "The biggest gain now is rewriting weak bullets so the strongest work reads more clearly."
          : "The score is already well-supported. Focus on polishing clarity rather than adding more keywords."
  };
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
  const scoreSummary = getSafeScoreSummary(scoreExplanation);
  const processedJobDescription = session.jobDescription ? toProcessedJobDescription(session.jobDescription) : null;
  const extractedJobKeywords = processedJobDescription?.extractedKeywords ?? [];
  const mustHaveKeywords = processedJobDescription?.mustHaveKeywords ?? [];
  const niceToHaveKeywords = processedJobDescription?.niceToHaveKeywords ?? [];
  const strengthAndGapSummary = buildStrengthAndGapSummaries(session, mustHaveKeywords, scoreSummary);
  const keywordReviewText = processedJobDescription ? buildKeywordReviewText(processedJobDescription) : null;

  return {
    sessionId: session.id,
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
    scoreDrivers: buildScoreDrivers(scoreSummary, session.scoringSummary),
    confidence: {
      parser: buildParserConfidence(session),
      scoring: buildScoringConfidence(extractedJobKeywords, scoreSummary)
    },
    summaryCards: strengthAndGapSummary,
    scoreSummary,
    roleMeta: session.jobDescription
      ? {
          title: session.jobDescription.title,
          seniority: session.jobDescription.seniority,
          extractedKeywordCount: extractedJobKeywords.length,
          requiredYearsExperience: session.jobDescription.requiredYearsExperience
        }
      : null,
    keywordReview: processedJobDescription && keywordReviewText
      ? {
          ...keywordReviewText,
          extractedKeywordCount: extractedJobKeywords.length,
          filteredOutPhrases: scoreSummary?.filteredOutPhrases ?? []
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
