import type { KeywordCategory } from "@/features/analysis/lib/types";

export interface JobDescriptionKeyword {
  keyword: string;
  normalizedKeyword: string;
  category: KeywordCategory;
  source: "catalog" | "phrase";
}

export interface ProcessedJobDescription {
  rawText: string;
  normalizedText: string;
  title: string | null;
  company: string | null;
  seniority: string | null;
  extractedKeywords: JobDescriptionKeyword[];
  mustHaveKeywords: JobDescriptionKeyword[];
  niceToHaveKeywords: JobDescriptionKeyword[];
}
