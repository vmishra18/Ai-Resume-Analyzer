export type KeywordCategory =
  | "technical_skill"
  | "soft_skill"
  | "tool"
  | "qualification"
  | "domain";

export type KeywordMatchType = "matched" | "missing" | "partial";
export type SuggestionPriority = "low" | "medium" | "high";
export type SuggestionType = "keyword" | "section" | "structure" | "content" | "readability";

export interface KeywordArtifact {
  keyword: string;
  normalizedKeyword: string;
  category: KeywordCategory;
  matched: boolean;
  matchType: KeywordMatchType;
  occurrences: number;
  isMustHave?: boolean;
  source?: "catalog" | "requirement";
}

export interface SectionCompleteness {
  summary: boolean;
  skills: boolean;
  experience: boolean;
  education: boolean;
  projects: boolean;
}

export interface ScoreBreakdown {
  keywordMatch: number;
  mustHaveSkills: number;
  sectionCompleteness: number;
  roleRelevance: number;
  structureQuality: number;
  alignment: number;
  bonus: number;
  total: number;
}

export interface AnalysisSummary {
  score: ScoreBreakdown;
  explanation: ScoreExplanation;
  matchedKeywords: KeywordArtifact[];
  partialKeywords: KeywordArtifact[];
  missingKeywords: KeywordArtifact[];
  sectionCompleteness: SectionCompleteness;
  suggestions: AnalysisSuggestion[];
}

export interface ScoreExplanation {
  keywordCoverage: number;
  matchedKeywordCount: number;
  partialKeywordCount: number;
  totalKeywordCount: number;
  mustHaveCoverage: number;
  matchedMustHaveCount: number;
  partialMustHaveCount: number;
  totalMustHaveCount: number;
  sectionCoverage: number;
  roleRelevanceRaw: number;
  structureQualityRaw: number;
  alignmentRaw: number;
  readabilityScore: number;
  bulletQualityScore: number;
  estimatedYearsExperience: number | null;
  requiredYearsExperience: number | null;
  yearsExperienceScore: number | null;
  bonusSignals: string[];
  canonicalMatchedKeywords: string[];
  canonicalPartialKeywords: string[];
  canonicalMissingKeywords: string[];
  filteredOutPhrases: string[];
}

export interface AnalysisSuggestion {
  title: string;
  description: string;
  priority: SuggestionPriority;
  suggestionType: SuggestionType;
}
