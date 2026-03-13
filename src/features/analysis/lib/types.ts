export type KeywordCategory =
  | "technical_skill"
  | "soft_skill"
  | "tool"
  | "qualification"
  | "domain";

export interface KeywordArtifact {
  keyword: string;
  normalizedKeyword: string;
  category: KeywordCategory;
  matched: boolean;
  occurrences: number;
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
  matchedKeywords: KeywordArtifact[];
  missingKeywords: KeywordArtifact[];
  sectionCompleteness: SectionCompleteness;
  suggestions: string[];
}
