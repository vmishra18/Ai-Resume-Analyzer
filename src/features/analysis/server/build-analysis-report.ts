import { normalizeKeyword } from "@/features/nlp/server/text-normalization";

interface AnalysisReportData {
  sessionTitle: string;
  createdAt: string;
  roleTitle: string;
  seniority: string;
  overallScore: number | null;
  fileName: string;
  status: string;
  matchedKeywords: string[];
  partialKeywords: string[];
  missingKeywords: string[];
  suggestions: Array<{
    title: string;
    description: string;
    priority: string;
  }>;
  scoreBreakdown: Array<[string, number]>;
}

function renderKeywordList(title: string, items: string[]) {
  if (items.length === 0) {
    return `## ${title}\n\n- None\n`;
  }

  return `## ${title}\n\n${items.map((item) => `- ${item}`).join("\n")}\n`;
}

export function buildAnalysisReportMarkdown(data: AnalysisReportData) {
  const safeTitle = normalizeKeyword(data.sessionTitle).replace(/ /g, "-") || "analysis-report";

  const markdown = `# ATS Resume Analyzer Report

## Session overview

- Title: ${data.sessionTitle}
- Created: ${data.createdAt}
- Resume file: ${data.fileName}
- Status: ${data.status}
- Target role: ${data.roleTitle}
- Seniority: ${data.seniority}
- ATS score: ${data.overallScore ?? "Pending"}

## Score breakdown

${data.scoreBreakdown.length > 0 ? data.scoreBreakdown.map(([label, value]) => `- ${label}: ${value}`).join("\n") : "- No score breakdown available"}

${renderKeywordList("Matched keywords", data.matchedKeywords)}
${renderKeywordList("Partial keywords", data.partialKeywords)}
${renderKeywordList("Missing keywords", data.missingKeywords)}

## Suggestions

${data.suggestions.length > 0 ? data.suggestions.map((suggestion) => `- [${suggestion.priority}] ${suggestion.title}: ${suggestion.description}`).join("\n") : "- No suggestions available"}
`;

  return {
    fileName: `${safeTitle}.md`,
    content: markdown
  };
}
