export interface ResumeSectionCompleteness {
  summary: boolean;
  skills: boolean;
  experience: boolean;
  education: boolean;
  projects: boolean;
}

export interface ParsedResumeResult {
  rawText: string;
  normalizedText: string;
  summary: string | null;
  structureScore: number;
  sections: ResumeSectionCompleteness;
}
