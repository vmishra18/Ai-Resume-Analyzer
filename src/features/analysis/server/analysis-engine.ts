import { maxBonusScore, scoringWeights } from "@/features/analysis/lib/scoring-design";
import type { AnalysisSummary, KeywordArtifact, ScoreBreakdown, SectionCompleteness } from "@/features/analysis/lib/types";

interface AnalysisEngineInput {
  matchedKeywords: KeywordArtifact[];
  missingKeywords: KeywordArtifact[];
  sectionCompleteness: SectionCompleteness;
  roleAlignmentScore: number;
  structureQualityScore: number;
  jobAlignmentScore: number;
  bonusSignals: number;
}

function percentage(part: number, total: number) {
  if (total === 0) {
    return 0;
  }

  return Math.round((part / total) * 100);
}

export function buildInitialAnalysisSummary(input: AnalysisEngineInput): AnalysisSummary {
  const keywordPool = [...input.matchedKeywords, ...input.missingKeywords];
  const matchedCount = input.matchedKeywords.length;
  const keywordMatchScore = Math.round(
    (percentage(matchedCount, keywordPool.length) * scoringWeights[0].weight) / 100
  );

  const mustHaveKeywords = keywordPool.filter(
    (item) => item.category === "technical_skill" || item.category === "tool" || item.category === "qualification"
  );
  const matchedMustHaves = input.matchedKeywords.filter(
    (item) => item.category === "technical_skill" || item.category === "tool" || item.category === "qualification"
  );
  const mustHaveSkillScore = Math.round(
    (percentage(matchedMustHaves.length, mustHaveKeywords.length) * scoringWeights[1].weight) / 100
  );

  const sectionHits = Object.values(input.sectionCompleteness).filter(Boolean).length;
  const sectionCompletenessScore = Math.round(
    (percentage(sectionHits, 5) * scoringWeights[2].weight) / 100
  );

  const roleRelevance = Math.round((input.roleAlignmentScore * scoringWeights[3].weight) / 100);
  const structureQuality = Math.round(
    (input.structureQualityScore * scoringWeights[4].weight) / 100
  );
  const alignment = Math.round((input.jobAlignmentScore * scoringWeights[5].weight) / 100);
  const bonus = Math.min(input.bonusSignals, maxBonusScore);
  const total = keywordMatchScore + mustHaveSkillScore + sectionCompletenessScore + roleRelevance + structureQuality + alignment + bonus;

  const score: ScoreBreakdown = {
    keywordMatch: keywordMatchScore,
    mustHaveSkills: mustHaveSkillScore,
    sectionCompleteness: sectionCompletenessScore,
    roleRelevance,
    structureQuality,
    alignment,
    bonus,
    total
  };

  const suggestions = [
    input.sectionCompleteness.summary ? null : "Add a concise summary tailored to the target role.",
    input.sectionCompleteness.skills ? null : "Include a dedicated skills section for recruiter and ATS scanning.",
    input.missingKeywords.length > 0
      ? `Address missing keywords such as ${input.missingKeywords.slice(0, 3).map((item) => item.keyword).join(", ")}.`
      : null,
    structureQuality < 7 ? "Improve structure with clearer headings and stronger bullet impact." : null
  ].filter((value): value is string => Boolean(value));

  return {
    score,
    matchedKeywords: input.matchedKeywords,
    missingKeywords: input.missingKeywords,
    sectionCompleteness: input.sectionCompleteness,
    suggestions
  };
}
