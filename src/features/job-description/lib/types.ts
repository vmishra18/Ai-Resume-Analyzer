import type { KeywordCategory } from "@/features/analysis/lib/types";

export interface JobDescriptionKeyword {
  keyword: string;
  normalizedKeyword: string;
  category: KeywordCategory;
  matchTerms: string[];
  source: "catalog" | "requirement";
}

export interface ProcessedJobDescription {
  rawText: string;
  normalizedText: string;
  title: string | null;
  company: string | null;
  seniority: string | null;
  requiredYearsExperience: number | null;
  extractedKeywords: JobDescriptionKeyword[];
  mustHaveKeywords: JobDescriptionKeyword[];
  niceToHaveKeywords: JobDescriptionKeyword[];
  filteredOutPhrases: string[];
}
