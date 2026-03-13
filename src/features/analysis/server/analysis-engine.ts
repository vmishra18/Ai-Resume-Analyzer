import { maxBonusScore, scoringWeights } from "@/features/analysis/lib/scoring-design";
import type {
  AnalysisSuggestion,
  AnalysisSummary,
  KeywordArtifact,
  ScoreBreakdown,
  ScoreExplanation
} from "@/features/analysis/lib/types";
import type { ProcessedJobDescription } from "@/features/job-description/lib/types";
import type { ParsedResumeResult } from "@/features/resume-parser/lib/types";

function percentage(part: number, total: number) {
  if (total === 0) {
    return 0;
  }

  return Math.round((part / total) * 100);
}

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function countOccurrences(value: string, phrase: string) {
  if (!phrase) {
    return 0;
  }

  const regex = new RegExp(`(^|\\b)${escapeRegExp(phrase)}(\\b|$)`, "g");
  const matches = value.match(regex);

  return matches?.length ?? 0;
}

function buildKeywordArtifacts(
  resume: ParsedResumeResult,
  jobDescription: ProcessedJobDescription
) {
  const resumeTokenSet = new Set(
    resume.normalizedText
      .split(/[^a-z0-9+#./-]+/)
      .map((token) => token.trim())
      .filter(Boolean)
  );
  const mustHaveSet = new Set(
    jobDescription.mustHaveKeywords.map((keyword) => keyword.normalizedKeyword)
  );

  return jobDescription.extractedKeywords.map<KeywordArtifact>((keyword) => {
    const exactMatches = countOccurrences(resume.normalizedText, keyword.normalizedKeyword);
    const parts = keyword.normalizedKeyword.split(/\s+/).filter(Boolean);
    const matchedParts = parts.filter((part) => resumeTokenSet.has(part)).length;
    const partialThreshold = parts.length > 1 ? Math.ceil(parts.length / 2) : 1;
    const isPartial = exactMatches === 0 && matchedParts >= partialThreshold && parts.length > 1;
    const matchType = exactMatches > 0 ? "matched" : isPartial ? "partial" : "missing";

    return {
      keyword: keyword.keyword,
      normalizedKeyword: keyword.normalizedKeyword,
      category: keyword.category,
      matched: matchType === "matched",
      matchType,
      occurrences: exactMatches > 0 ? exactMatches : matchedParts,
      isMustHave: mustHaveSet.has(keyword.normalizedKeyword),
      source: keyword.source
    };
  });
}

function calculateRoleRelevance(
  resume: ParsedResumeResult,
  jobDescription: ProcessedJobDescription,
  keywordArtifacts: KeywordArtifact[]
) {
  const signals: number[] = [];

  if (jobDescription.title) {
    const normalizedTitle = jobDescription.title.toLowerCase();
    const titleTokens = normalizedTitle.split(/\s+/).filter(Boolean);
    const titleTokenMatches = titleTokens.filter((token) =>
      resume.normalizedText.includes(token)
    ).length;

    signals.push(
      resume.normalizedText.includes(normalizedTitle)
        ? 100
        : percentage(titleTokenMatches, titleTokens.length)
    );
  }

  if (jobDescription.seniority) {
    signals.push(resume.normalizedText.includes(jobDescription.seniority.toLowerCase()) ? 100 : 25);
  }

  const domainKeywords = keywordArtifacts.filter((keyword) => keyword.category === "domain");

  if (domainKeywords.length > 0) {
    const weightedMatches = domainKeywords.reduce((total, keyword) => {
      if (keyword.matchType === "matched") {
        return total + 1;
      }

      if (keyword.matchType === "partial") {
        return total + 0.5;
      }

      return total;
    }, 0);

    signals.push(Math.round((weightedMatches / domainKeywords.length) * 100));
  }

  return signals.length > 0
    ? Math.round(signals.reduce((total, value) => total + value, 0) / signals.length)
    : 0;
}

function calculateAlignmentScore(
  resume: ParsedResumeResult,
  jobDescription: ProcessedJobDescription,
  keywordArtifacts: KeywordArtifact[],
  mustHaveCoverage: number
) {
  const relevantKeywords = keywordArtifacts.filter((keyword) =>
    keyword.category === "technical_skill" ||
    keyword.category === "tool" ||
    keyword.category === "domain"
  );

  const relevantCoverage =
    relevantKeywords.length > 0
      ? Math.round(
          (relevantKeywords.reduce((total, keyword) => {
            if (keyword.matchType === "matched") {
              return total + 1;
            }

            if (keyword.matchType === "partial") {
              return total + 0.5;
            }

            return total;
          }, 0) /
            relevantKeywords.length) *
            100
        )
      : 0;

  const summaryText = `${resume.summary ?? ""} ${resume.normalizedText.slice(0, 350)}`.toLowerCase();
  const summaryKeywordHits = jobDescription.extractedKeywords.filter((keyword) =>
    summaryText.includes(keyword.normalizedKeyword)
  ).length;
  const summaryAlignment = jobDescription.title && summaryText.includes(jobDescription.title.toLowerCase())
    ? 100
    : summaryKeywordHits >= 3
      ? 90
      : summaryKeywordHits === 2
        ? 70
        : summaryKeywordHits === 1
          ? 45
          : 0;

  return Math.min(
    100,
    Math.round(relevantCoverage * 0.5 + mustHaveCoverage * 0.35 + summaryAlignment * 0.15)
  );
}

function calculateBonusScore(resume: ParsedResumeResult) {
  let score = 0;
  const bonusSignals: string[] = [];

  if (resume.sections.projects) {
    score += 2;
    bonusSignals.push("Projects section detected");
  }

  if (/\b(\d+%|\d+x|\d+\+|\$\d+)\b/.test(resume.normalizedText)) {
    score += 2;
    bonusSignals.push("Quantified impact detected");
  }

  if (/\b(built|launched|shipped|scaled|optimized|improved|designed|implemented)\b/.test(resume.normalizedText)) {
    score += 1;
    bonusSignals.push("Strong action-oriented project language detected");
  }

  return {
    score: Math.min(score, maxBonusScore),
    bonusSignals
  };
}

function generateSuggestions(
  resume: ParsedResumeResult,
  keywordArtifacts: KeywordArtifact[],
  score: ScoreBreakdown
): AnalysisSuggestion[] {
  const suggestions: AnalysisSuggestion[] = [];
  const missingMustHaves = keywordArtifacts.filter(
    (keyword) => keyword.isMustHave && keyword.matchType === "missing"
  );
  const missingSections = [
    !resume.sections.summary ? "summary" : null,
    !resume.sections.skills ? "skills" : null,
    !resume.sections.projects ? "projects" : null
  ].filter((value): value is string => Boolean(value));

  if (missingMustHaves.length > 0) {
    suggestions.push({
      title: "Add missing must-have skills",
      description: `Prioritize keywords such as ${missingMustHaves
        .slice(0, 4)
        .map((keyword) => keyword.keyword)
        .join(", ")} in your experience or skills sections.`,
      priority: "high",
      suggestionType: "keyword"
    });
  }

  if (missingSections.length > 0) {
    suggestions.push({
      title: "Strengthen section completeness",
      description: `The resume is missing important sections: ${missingSections.join(", ")}.`,
      priority: "high",
      suggestionType: "section"
    });
  }

  if (score.structureQuality <= 6) {
    suggestions.push({
      title: "Improve resume structure",
      description:
        "Use clearer headings, keep bullet points consistent, and highlight measurable outcomes to improve scanability.",
      priority: "medium",
      suggestionType: "structure"
    });
  }

  if (score.alignment <= 6) {
    suggestions.push({
      title: "Align experience to the job description",
      description:
        "Mirror the job description more closely by adding role-relevant tools, responsibilities, and language to your experience bullets.",
      priority: "medium",
      suggestionType: "content"
    });
  }

  const missingSoftSkills = keywordArtifacts.filter(
    (keyword) => keyword.category === "soft_skill" && keyword.matchType === "missing"
  );

  if (missingSoftSkills.length > 0) {
    suggestions.push({
      title: "Add collaboration and communication signals",
      description: `Consider reflecting soft-skill signals like ${missingSoftSkills
        .slice(0, 2)
        .map((keyword) => keyword.keyword)
        .join(" and ")} through concrete examples.`,
      priority: "low",
      suggestionType: "content"
    });
  }

  return suggestions.slice(0, 5);
}

export function analyzeResumeAgainstJob(
  resume: ParsedResumeResult,
  jobDescription: ProcessedJobDescription
): AnalysisSummary {
  const keywordArtifacts = buildKeywordArtifacts(resume, jobDescription);
  const matchedKeywords = keywordArtifacts.filter((keyword) => keyword.matchType === "matched");
  const partialKeywords = keywordArtifacts.filter((keyword) => keyword.matchType === "partial");
  const missingKeywords = keywordArtifacts.filter((keyword) => keyword.matchType === "missing");
  const mustHaveKeywords = keywordArtifacts.filter((keyword) => keyword.isMustHave);

  const weightedMatchedKeywords = matchedKeywords.length + partialKeywords.length * 0.5;
  const weightedMatchedMustHaves =
    mustHaveKeywords.filter((keyword) => keyword.matchType === "matched").length +
    mustHaveKeywords.filter((keyword) => keyword.matchType === "partial").length * 0.5;
  const keywordCoverage = Math.round((weightedMatchedKeywords / Math.max(keywordArtifacts.length, 1)) * 100);
  const mustHaveCoverage = Math.round(
    (weightedMatchedMustHaves / Math.max(mustHaveKeywords.length, 1)) * 100
  );

  const sectionCompleteness = {
    summary: resume.sections.summary,
    skills: resume.sections.skills,
    experience: resume.sections.experience,
    education: resume.sections.education,
    projects: resume.sections.projects
  };
  const sectionHits = Object.values(sectionCompleteness).filter(Boolean).length;
  const sectionCoverage = percentage(sectionHits, 5);
  const roleRelevanceRaw = calculateRoleRelevance(resume, jobDescription, keywordArtifacts);
  const alignmentRaw = calculateAlignmentScore(
    resume,
    jobDescription,
    keywordArtifacts,
    mustHaveCoverage
  );
  const structureQualityRaw = resume.structureScore;
  const bonus = calculateBonusScore(resume);

  const score: ScoreBreakdown = {
    keywordMatch: Math.round((keywordCoverage * scoringWeights[0].weight) / 100),
    mustHaveSkills: Math.round((mustHaveCoverage * scoringWeights[1].weight) / 100),
    sectionCompleteness: Math.round((sectionCoverage * scoringWeights[2].weight) / 100),
    roleRelevance: Math.round((roleRelevanceRaw * scoringWeights[3].weight) / 100),
    structureQuality: Math.round((structureQualityRaw * scoringWeights[4].weight) / 100),
    alignment: Math.round((alignmentRaw * scoringWeights[5].weight) / 100),
    bonus: bonus.score,
    total: 0
  };

  score.total = Math.min(
    100,
    score.keywordMatch +
      score.mustHaveSkills +
      score.sectionCompleteness +
      score.roleRelevance +
      score.structureQuality +
      score.alignment +
      score.bonus
  );

  const explanation: ScoreExplanation = {
    keywordCoverage,
    matchedKeywordCount: matchedKeywords.length,
    partialKeywordCount: partialKeywords.length,
    totalKeywordCount: keywordArtifacts.length,
    mustHaveCoverage,
    matchedMustHaveCount: mustHaveKeywords.filter((keyword) => keyword.matchType === "matched").length,
    partialMustHaveCount: mustHaveKeywords.filter((keyword) => keyword.matchType === "partial").length,
    totalMustHaveCount: mustHaveKeywords.length,
    sectionCoverage,
    roleRelevanceRaw,
    structureQualityRaw,
    alignmentRaw,
    bonusSignals: bonus.bonusSignals
  };

  return {
    score,
    explanation,
    matchedKeywords,
    partialKeywords,
    missingKeywords,
    sectionCompleteness,
    suggestions: generateSuggestions(resume, keywordArtifacts, score)
  };
}
