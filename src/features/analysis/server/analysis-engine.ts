import { maxBonusScore, scoringWeights } from "@/features/analysis/lib/scoring-design";
import type {
  AnalysisSuggestion,
  AnalysisSummary,
  KeywordArtifact,
  ScoreBreakdown,
  ScoreExplanation
} from "@/features/analysis/lib/types";
import type { ProcessedJobDescription } from "@/features/job-description/lib/types";
import { countWholeTermMatches, hasWholeTerm } from "@/features/nlp/server/text-normalization";
import type { ParsedResumeResult } from "@/features/resume-parser/lib/types";
import { countWords } from "@/features/resume-parser/server/normalization";

const actionVerbs = [
  "built",
  "launched",
  "shipped",
  "scaled",
  "optimized",
  "improved",
  "designed",
  "implemented",
  "created",
  "developed",
  "owned",
  "led",
  "reduced",
  "increased",
  "delivered",
  "automated"
] as const;

function percentage(part: number, total: number) {
  if (total === 0) {
    return 0;
  }

  return Math.round((part / total) * 100);
}

function uniqueLabels(keywords: KeywordArtifact[]) {
  return Array.from(new Set(keywords.map((keyword) => keyword.keyword))).sort((left, right) =>
    left.localeCompare(right)
  );
}

function getWeightedCoverage(keywords: KeywordArtifact[]) {
  if (keywords.length === 0) {
    return 0;
  }

  return Math.round(
    (keywords.reduce((total, keyword) => {
      if (keyword.matchType === "matched") {
        return total + 1;
      }

      if (keyword.matchType === "partial") {
        return total + 0.5;
      }

      return total;
    }, 0) /
      keywords.length) *
      100
  );
}

function buildKeywordArtifacts(resume: ParsedResumeResult, jobDescription: ProcessedJobDescription) {
  const resumeTokenSet = new Set(
    resume.normalizedText
      .split(/[^a-z0-9+#./-]+/)
      .map((token) => token.trim())
      .filter(Boolean)
  );
  const mustHaveSet = new Set(jobDescription.mustHaveKeywords.map((keyword) => keyword.normalizedKeyword));

  return jobDescription.extractedKeywords.map<KeywordArtifact>((keyword) => {
    const exactMatches = keyword.matchTerms.reduce(
      (highestCount, term) => Math.max(highestCount, countWholeTermMatches(resume.normalizedText, term)),
      0
    );
    const partialCandidates = keyword.matchTerms
      .map((term) => term.split(/\s+/).filter(Boolean))
      .filter((parts) => parts.length > 1);
    const matchedParts = partialCandidates.reduce((highestMatch, parts) => {
      const partMatches = parts.filter((part) => resumeTokenSet.has(part)).length;

      return Math.max(highestMatch, partMatches);
    }, 0);
    const bestPartialLength = partialCandidates.reduce(
      (highestLength, parts) => Math.max(highestLength, parts.length),
      0
    );
    const partialThreshold = bestPartialLength > 1 ? Math.ceil(bestPartialLength / 2) : 0;
    const isPartial =
      exactMatches === 0 &&
      bestPartialLength > 1 &&
      matchedParts >= partialThreshold &&
      (keyword.category === "technical_skill" || keyword.category === "tool" || keyword.category === "domain");
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

function estimateYearsExperience(resume: ParsedResumeResult) {
  const explicitYears = Array.from(resume.normalizedText.matchAll(/\b(\d+)\+?\s+years?\b/g)).map((match) =>
    Number(match[1])
  );
  const yearMatches = Array.from(
    resume.rawText.matchAll(
      /\b(?:jan|feb|mar|apr|may|jun|jul|aug|sep|sept|oct|nov|dec)?\.?\s*(20\d{2}|19\d{2})\s*[-–]\s*(?:present|current|now|(?:jan|feb|mar|apr|may|jun|jul|aug|sep|sept|oct|nov|dec)?\.?\s*(20\d{2}|19\d{2}))\b/gi
    )
  );

  const dateSpans = yearMatches.map((match) => {
    const startYear = Number(match[1]);
    const endYear = match[2] ? Number(match[2]) : new Date().getFullYear();

    return Math.max(0, endYear - startYear);
  });

  const strongestSignal = Math.max(...explicitYears, ...dateSpans, 0);

  return strongestSignal > 0 ? strongestSignal : null;
}

function calculateYearsExperienceScore(
  estimatedYearsExperience: number | null,
  requiredYearsExperience: number | null
) {
  if (!requiredYearsExperience) {
    return null;
  }

  if (!estimatedYearsExperience) {
    return 30;
  }

  if (estimatedYearsExperience >= requiredYearsExperience + 2) {
    return 100;
  }

  if (estimatedYearsExperience >= requiredYearsExperience) {
    return 90;
  }

  if (estimatedYearsExperience >= requiredYearsExperience - 1) {
    return 60;
  }

  return 45;
}

function calculateReadabilityScore(resume: ParsedResumeResult) {
  const words = countWords(resume.normalizedText);
  const sentenceParts = resume.rawText
    .split(/[.!?]+/)
    .map((sentence) => sentence.trim())
    .filter(Boolean);
  const averageSentenceLength =
    sentenceParts.length > 0
      ? sentenceParts.reduce((total, sentence) => total + countWords(sentence), 0) / sentenceParts.length
      : 0;
  const lineCount = resume.rawText
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean).length;
  const averageLineDensity = lineCount > 0 ? words / lineCount : 0;

  let score = 0;

  score += words >= 350 && words <= 950 ? 40 : words >= 250 && words <= 1100 ? 30 : 18;
  score += averageSentenceLength >= 10 && averageSentenceLength <= 24 ? 35 : averageSentenceLength <= 30 ? 24 : 12;
  score += averageLineDensity <= 18 ? 25 : averageLineDensity <= 24 ? 16 : 8;

  return Math.min(score, 100);
}

function calculateBulletQualityScore(resume: ParsedResumeResult) {
  const bulletLines = resume.rawText
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => /^[-*•]/.test(line));

  if (bulletLines.length === 0) {
    return 20;
  }

  const actionLedBullets = bulletLines.filter((line) =>
    actionVerbs.some((verb) => new RegExp(`\\b${verb}\\b`, "i").test(line))
  ).length;
  const quantifiedBullets = bulletLines.filter((line) => /\b(\d+%|\d+x|\d+\+|\$\d+|\d+\s+(users|customers|teams|projects))\b/i.test(line)).length;

  let score = 0;

  score += bulletLines.length >= 6 ? 35 : bulletLines.length >= 3 ? 24 : 12;
  score += percentage(actionLedBullets, bulletLines.length) >= 60 ? 35 : percentage(actionLedBullets, bulletLines.length) >= 35 ? 24 : 12;
  score += quantifiedBullets >= 3 ? 30 : quantifiedBullets >= 1 ? 20 : 10;

  return Math.min(score, 100);
}

function calculateRoleRelevance(
  resume: ParsedResumeResult,
  jobDescription: ProcessedJobDescription,
  keywordArtifacts: KeywordArtifact[],
  yearsExperienceScore: number | null
) {
  const signals: number[] = [];

  if (jobDescription.title) {
    const normalizedTitle = jobDescription.title.toLowerCase();
    const titleTokens = normalizedTitle.split(/\s+/).filter(Boolean);
    const titleTokenMatches = titleTokens.filter((token) => hasWholeTerm(resume.normalizedText, token)).length;

    signals.push(
      hasWholeTerm(resume.normalizedText, normalizedTitle)
        ? 100
        : percentage(titleTokenMatches, titleTokens.length)
    );
  }

  if (jobDescription.seniority) {
    signals.push(hasWholeTerm(resume.normalizedText, jobDescription.seniority.toLowerCase()) ? 100 : 30);
  }

  const domainKeywords = keywordArtifacts.filter((keyword) => keyword.category === "domain");

  if (domainKeywords.length > 0) {
    signals.push(getWeightedCoverage(domainKeywords));
  }

  if (yearsExperienceScore !== null) {
    signals.push(yearsExperienceScore);
  }

  return signals.length > 0
    ? Math.round(signals.reduce((total, value) => total + value, 0) / signals.length)
    : 0;
}

function calculateAlignmentScore(
  resume: ParsedResumeResult,
  jobDescription: ProcessedJobDescription,
  keywordArtifacts: KeywordArtifact[],
  mustHaveCoverage: number,
  yearsExperienceScore: number | null
) {
  const relevantKeywords = keywordArtifacts.filter(
    (keyword) => keyword.category === "technical_skill" || keyword.category === "tool" || keyword.category === "domain"
  );
  const relevantCoverage = getWeightedCoverage(relevantKeywords);
  const summaryText = `${resume.summary ?? ""} ${resume.normalizedText.slice(0, 420)}`.toLowerCase();
  const summaryKeywordHits = jobDescription.extractedKeywords.filter((keyword) =>
    keyword.matchTerms.some((term) => hasWholeTerm(summaryText, term))
  ).length;
  const summaryAlignment = jobDescription.title && hasWholeTerm(summaryText, jobDescription.title.toLowerCase())
    ? 100
    : summaryKeywordHits >= 4
      ? 90
      : summaryKeywordHits >= 2
        ? 70
        : summaryKeywordHits === 1
          ? 45
          : 20;
  const yearsSignal = yearsExperienceScore ?? 70;

  return Math.min(
    100,
    Math.round(relevantCoverage * 0.45 + mustHaveCoverage * 0.35 + summaryAlignment * 0.1 + yearsSignal * 0.1)
  );
}

function calculateBonusScore(resume: ParsedResumeResult) {
  let score = 0;
  const bonusSignals: string[] = [];

  if (resume.sections.projects) {
    score += 1;
    bonusSignals.push("Projects section detected");
  }

  if (/\b(\d+%|\d+x|\d+\+|\$\d+)\b/.test(resume.normalizedText)) {
    score += 2;
    bonusSignals.push("Quantified impact detected");
  }

  if (new RegExp(`\\b(${actionVerbs.join("|")})\\b`).test(resume.normalizedText)) {
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
  score: ScoreBreakdown,
  readabilityScore: number,
  bulletQualityScore: number,
  yearsExperienceScore: number | null
): AnalysisSuggestion[] {
  const suggestions: AnalysisSuggestion[] = [];
  const missingMustHaves = keywordArtifacts.filter((keyword) => keyword.isMustHave && keyword.matchType === "missing");
  const missingSections = [
    !resume.sections.summary ? "summary" : null,
    !resume.sections.skills ? "skills" : null,
    !resume.sections.projects ? "projects" : null
  ].filter((value): value is string => Boolean(value));

  if (missingMustHaves.length > 0) {
    suggestions.push({
      title: "Close the highest-priority skill gaps",
      description: `Add or strengthen evidence for ${missingMustHaves
        .slice(0, 4)
        .map((keyword) => keyword.keyword)
        .join(", ")} in your skills or experience sections.`,
      priority: "high",
      suggestionType: "keyword"
    });
  }

  if (missingSections.length > 0) {
    suggestions.push({
      title: "Fill in missing resume sections",
      description: `This resume would be easier to scan with ${missingSections.join(", ")} clearly labelled.`,
      priority: "high",
      suggestionType: "section"
    });
  }

  if (bulletQualityScore <= 60) {
    suggestions.push({
      title: "Upgrade bullet quality",
      description:
        "Lead bullets with action verbs, make outcomes more specific, and add measurable impact where you can.",
      priority: "medium",
      suggestionType: "readability"
    });
  }

  if (readabilityScore <= 62) {
    suggestions.push({
      title: "Tighten readability",
      description:
        "Shorter sentences, cleaner spacing, and a more concise summary will make the resume easier to scan quickly.",
      priority: "medium",
      suggestionType: "readability"
    });
  }

  if (yearsExperienceScore !== null && yearsExperienceScore < 70) {
    suggestions.push({
      title: "Make experience depth easier to spot",
      description:
        "Call out timeline length, ownership, and sustained work on relevant technologies so experience signals are easier to detect.",
      priority: "medium",
      suggestionType: "content"
    });
  }

  if (score.alignment <= 6) {
    suggestions.push({
      title: "Mirror the role language more directly",
      description:
        "Reflect the job description more closely by adding role-relevant tools, responsibilities, and outcomes to recent experience bullets.",
      priority: "medium",
      suggestionType: "content"
    });
  }

  const missingSoftSkills = keywordArtifacts.filter(
    (keyword) => keyword.category === "soft_skill" && keyword.matchType === "missing"
  );

  if (missingSoftSkills.length > 0) {
    suggestions.push({
      title: "Add collaboration and stakeholder signals",
      description: `Consider reflecting examples of ${missingSoftSkills
        .slice(0, 2)
        .map((keyword) => keyword.keyword)
        .join(" and ")} through concrete project examples.`,
      priority: "low",
      suggestionType: "content"
    });
  }

  return suggestions.slice(0, 6);
}

export function analyzeResumeAgainstJob(resume: ParsedResumeResult, jobDescription: ProcessedJobDescription): AnalysisSummary {
  const keywordArtifacts = buildKeywordArtifacts(resume, jobDescription);
  const matchedKeywords = keywordArtifacts.filter((keyword) => keyword.matchType === "matched");
  const partialKeywords = keywordArtifacts.filter((keyword) => keyword.matchType === "partial");
  const missingKeywords = keywordArtifacts.filter((keyword) => keyword.matchType === "missing");
  const mustHaveKeywords = keywordArtifacts.filter((keyword) => keyword.isMustHave);
  const keywordCoverage = getWeightedCoverage(keywordArtifacts);
  const mustHaveCoverage = getWeightedCoverage(mustHaveKeywords);
  const sectionCompleteness = {
    summary: resume.sections.summary,
    skills: resume.sections.skills,
    experience: resume.sections.experience,
    education: resume.sections.education,
    projects: resume.sections.projects
  };
  const sectionCoverage = percentage(Object.values(sectionCompleteness).filter(Boolean).length, 5);
  const sectionCoverageAdjusted = Math.round(sectionCoverage * 0.75);
  const estimatedYearsExperience = estimateYearsExperience(resume);
  const yearsExperienceScore = calculateYearsExperienceScore(
    estimatedYearsExperience,
    jobDescription.requiredYearsExperience
  );
  const roleRelevanceRaw = calculateRoleRelevance(resume, jobDescription, keywordArtifacts, yearsExperienceScore);
  const alignmentRaw = calculateAlignmentScore(
    resume,
    jobDescription,
    keywordArtifacts,
    mustHaveCoverage,
    yearsExperienceScore
  );
  const readabilityScore = calculateReadabilityScore(resume);
  const bulletQualityScore = calculateBulletQualityScore(resume);
  const structureQualityRaw = Math.round(resume.structureScore * 0.45 + readabilityScore * 0.2 + bulletQualityScore * 0.35);
  const bonus = calculateBonusScore(resume);

  const score: ScoreBreakdown = {
    keywordMatch: Math.round((keywordCoverage * scoringWeights[0].weight) / 100),
    mustHaveSkills: Math.round((mustHaveCoverage * scoringWeights[1].weight) / 100),
    sectionCompleteness: Math.round((sectionCoverageAdjusted * scoringWeights[2].weight) / 100),
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
    readabilityScore,
    bulletQualityScore,
    estimatedYearsExperience,
    requiredYearsExperience: jobDescription.requiredYearsExperience,
    yearsExperienceScore,
    bonusSignals: bonus.bonusSignals,
    canonicalMatchedKeywords: uniqueLabels(matchedKeywords),
    canonicalPartialKeywords: uniqueLabels(partialKeywords),
    canonicalMissingKeywords: uniqueLabels(missingKeywords),
    filteredOutPhrases: jobDescription.filteredOutPhrases
  };

  return {
    score,
    explanation,
    matchedKeywords,
    partialKeywords,
    missingKeywords,
    sectionCompleteness,
    suggestions: generateSuggestions(
      resume,
      keywordArtifacts,
      score,
      readabilityScore,
      bulletQualityScore,
      yearsExperienceScore
    )
  };
}
