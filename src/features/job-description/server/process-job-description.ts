import nlp from "compromise";

import type { KeywordCategory } from "@/features/analysis/lib/types";
import { keywordCatalog, roleTitlePatterns, seniorityPatterns } from "@/features/job-description/lib/catalog";
import type { JobDescriptionKeyword, ProcessedJobDescription } from "@/features/job-description/lib/types";
import {
  normalizeAnalysisText,
  normalizeKeyword,
  removeStopWords,
  splitIntoLines,
  splitIntoSentences,
  tokenizeForAnalysis
} from "@/features/nlp/server/text-normalization";

const mustHaveHints = [
  "must",
  "required",
  "requirements",
  "you have",
  "you will have",
  "need",
  "strong",
  "expertise in",
  "experience with",
  "proficient in"
] as const;

const niceToHaveHints = ["nice to have", "preferred", "bonus", "plus", "ideally"] as const;

const categoryKeywords: Record<KeywordCategory, string[]> = {
  technical_skill: ["framework", "language", "api", "database", "architecture", "testing"],
  soft_skill: ["communication", "collaboration", "leadership", "mentoring", "stakeholder", "ownership"],
  tool: ["cloud", "docker", "figma", "jira", "github", "platform", "tool"],
  qualification: ["degree", "certification", "experience", "qualification"],
  domain: ["saas", "fintech", "healthcare", "product", "domain", "industry", "analytics"]
};

function uniqueKeywords(keywords: JobDescriptionKeyword[]) {
  const seen = new Set<string>();

  return keywords.filter((keyword) => {
    const key = `${keyword.category}:${keyword.normalizedKeyword}`;

    if (seen.has(key)) {
      return false;
    }

    seen.add(key);
    return true;
  });
}

function detectRoleTitle(lines: string[]) {
  const firstLine = lines[0]?.toLowerCase() ?? "";

  const directMatch = roleTitlePatterns.find((title) => firstLine.includes(title));

  if (directMatch) {
    return directMatch.replace(/\b\w/g, (value) => value.toUpperCase());
  }

  const matchingLine = lines.find((line) =>
    roleTitlePatterns.some((title) => line.toLowerCase().includes(title))
  );

  if (!matchingLine) {
    return null;
  }

  return matchingLine.length <= 80 ? matchingLine : null;
}

function detectCompany(lines: string[]) {
  const byAtPattern = /\bat\s+([A-Z][A-Za-z0-9& .-]{1,40})/;

  for (const line of lines) {
    const match = line.match(byAtPattern);

    if (match) {
      return match[1].trim();
    }
  }

  return null;
}

function detectSeniority(normalizedText: string) {
  const match = seniorityPatterns.find((value) => normalizedText.includes(value));

  return match ? match.replace(/\b\w/g, (letter) => letter.toUpperCase()) : null;
}

function inferCategory(phrase: string): KeywordCategory | null {
  const normalizedPhrase = normalizeKeyword(phrase);

  if (!normalizedPhrase || normalizedPhrase.length < 3) {
    return null;
  }

  for (const [category, hints] of Object.entries(categoryKeywords) as [KeywordCategory, string[]][]) {
    if (hints.some((hint) => normalizedPhrase.includes(hint))) {
      return category;
    }
  }

  if (/\b(degree|certification|experience)\b/.test(normalizedPhrase)) {
    return "qualification";
  }

  if (/\b(react|node|typescript|javascript|python|sql|api|database)\b/.test(normalizedPhrase)) {
    return "technical_skill";
  }

  return null;
}

function extractCatalogKeywords(normalizedText: string) {
  return keywordCatalog.flatMap((entry) => {
    const terms = [entry.phrase, ...(entry.aliases ?? [])];
    const matchedTerm = terms.find((term) => normalizedText.includes(normalizeKeyword(term)));

    return matchedTerm
      ? [
          {
            keyword: entry.phrase,
            normalizedKeyword: normalizeKeyword(entry.phrase),
            category: entry.category,
            source: "catalog" as const
          }
        ]
      : [];
  });
}

function extractPhraseKeywords(rawText: string) {
  const doc = nlp(rawText);
  const phraseMatches = doc.match("(#Adjective|#Noun)+").out("array");
  const lineFragments = splitIntoLines(rawText).flatMap((line) =>
    line.split(/[:;,/]| - /).map((fragment) => fragment.trim())
  );
  const tokenPhrases = removeStopWords(tokenizeForAnalysis(rawText))
    .filter((token) => token.length > 2)
    .slice(0, 40);

  const combinedPhrases = [...phraseMatches, ...lineFragments, ...tokenPhrases];

  return combinedPhrases.flatMap((phrase) => {
    const normalizedPhrase = normalizeKeyword(phrase);

    if (!normalizedPhrase || normalizedPhrase.length < 3 || normalizedPhrase.split(" ").length > 4) {
      return [];
    }

    if (mustHaveHints.includes(normalizedPhrase as (typeof mustHaveHints)[number])) {
      return [];
    }

    const category = inferCategory(normalizedPhrase);

    if (!category) {
      return [];
    }

    return [
      {
        keyword: phrase.replace(/[.,]+$/g, ""),
        normalizedKeyword: normalizedPhrase,
        category,
        source: "phrase" as const
      }
    ];
  });
}

function classifyKeywordPriority(
  keyword: JobDescriptionKeyword,
  normalizedSentences: string[]
) {
  const matchingSentence = normalizedSentences.find((sentence) =>
    sentence.includes(keyword.normalizedKeyword)
  );

  if (!matchingSentence) {
    return "nice";
  }

  if (niceToHaveHints.some((hint) => matchingSentence.includes(hint))) {
    return "nice";
  }

  if (mustHaveHints.some((hint) => matchingSentence.includes(hint))) {
    return "must";
  }

  if (/\b\d+\+?\s+years?\b/.test(matchingSentence)) {
    return "must";
  }

  return keyword.category === "soft_skill" ? "nice" : "must";
}

export function processJobDescription(rawText: string): ProcessedJobDescription {
  const normalizedText = normalizeAnalysisText(rawText);
  const lines = splitIntoLines(rawText);
  const normalizedSentences = splitIntoSentences(normalizedText);
  const extractedKeywords = uniqueKeywords([
    ...extractCatalogKeywords(normalizedText),
    ...extractPhraseKeywords(rawText)
  ]).sort((left, right) => left.keyword.localeCompare(right.keyword));

  const mustHaveKeywords = extractedKeywords.filter(
    (keyword) => classifyKeywordPriority(keyword, normalizedSentences) === "must"
  );
  const niceToHaveKeywords = extractedKeywords.filter(
    (keyword) => !mustHaveKeywords.some((mustHave) => mustHave.normalizedKeyword === keyword.normalizedKeyword)
  );

  return {
    rawText,
    normalizedText,
    title: detectRoleTitle(lines),
    company: detectCompany(lines),
    seniority: detectSeniority(normalizedText),
    extractedKeywords,
    mustHaveKeywords,
    niceToHaveKeywords
  };
}
