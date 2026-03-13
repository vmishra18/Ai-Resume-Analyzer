import type { KeywordCategory } from "@/features/analysis/lib/types";
import { keywordCatalog, roleTitlePatterns, seniorityPatterns } from "@/features/job-description/lib/catalog";
import type { JobDescriptionKeyword, ProcessedJobDescription } from "@/features/job-description/lib/types";
import {
  hasWholeTerm,
  normalizeAnalysisText,
  normalizeKeyword,
  splitIntoLines,
  splitIntoSentences
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

const niceToHaveHints = ["nice to have", "preferred", "bonus", "plus", "ideally", "exposure to"] as const;

const requirementLineHints = [
  "technology you will be using",
  "desired skills",
  "skills and knowledge",
  "about you",
  "experience with",
  "proficient in",
  "familiar with",
  "exposure to",
  "background in",
  "solid understanding of",
  "including tools like",
  "key responsibilities",
  "responsibilities",
  "requirements",
  "what you'll need",
  "what you will need"
] as const;

const lowSignalHeadingHints = [
  "about the company",
  "about us",
  "what we offer",
  "benefits",
  "perks",
  "why join",
  "our values",
  "meet the hiring team",
  "people you can reach out to"
] as const;

const lowSignalStandaloneLines = [
  "apply",
  "save",
  "show more options",
  "show all",
  "message",
  "job poster",
  "beta",
  "tailor my resume",
  "create cover letter",
  "help me stand out",
  "show match details"
] as const;

const displayLabelMap: Record<string, string> = {
  react: "React",
  "next.js": "Next.js",
  vue: "Vue",
  angular: "Angular",
  "redux toolkit": "Redux Toolkit",
  "node.js": "Node.js",
  typescript: "TypeScript",
  javascript: "JavaScript",
  html5: "HTML5",
  css: "CSS",
  canvas: "Canvas",
  aws: "AWS",
  ci: "CI",
  npm: "NPM",
  eslint: "ESLint",
  oop: "OOP",
  graphql: "GraphQL",
  macos: "macOS",
  sql: "SQL",
  qa: "QA",
  "a/b testing": "A/B Testing"
};

interface CatalogMatch {
  keyword: JobDescriptionKeyword;
  matchedTerms: string[];
}

function toTitleCase(value: string) {
  return value
    .split(" ")
    .filter(Boolean)
    .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
    .join(" ");
}

function formatKeywordLabel(value: string) {
  const normalized = normalizeKeyword(value);

  return displayLabelMap[normalized] ?? toTitleCase(value);
}

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

function buildKeyword(
  phrase: string,
  category: KeywordCategory,
  aliases: string[] | undefined,
  source: JobDescriptionKeyword["source"]
): JobDescriptionKeyword {
  const normalizedKeyword = normalizeKeyword(phrase);
  const matchTerms = Array.from(
    new Set([phrase, ...(aliases ?? [])].map((term) => normalizeKeyword(term)).filter(Boolean))
  );

  return {
    keyword: formatKeywordLabel(phrase),
    normalizedKeyword,
    category,
    matchTerms,
    source
  };
}

function findCatalogMatches(value: string, source: JobDescriptionKeyword["source"]) {
  return keywordCatalog.flatMap<CatalogMatch>((entry) => {
    const keyword = buildKeyword(entry.phrase, entry.category, entry.aliases, source);
    const matchedTerms = keyword.matchTerms.filter((term) => hasWholeTerm(value, term));

    return matchedTerms.length > 0 ? [{ keyword, matchedTerms }] : [];
  });
}

function detectRoleTitle(lines: string[]) {
  const normalizedLines = lines.map((line) => normalizeKeyword(line));
  const firstLine = normalizedLines[0] ?? "";
  const directMatch = roleTitlePatterns.find((title) => hasWholeTerm(firstLine, title));

  if (directMatch) {
    return toTitleCase(directMatch);
  }

  const matchingLine = normalizedLines.find((line) =>
    roleTitlePatterns.some((title) => hasWholeTerm(line, title))
  );

  if (!matchingLine) {
    return null;
  }

  const matchedTitle = roleTitlePatterns.find((title) => hasWholeTerm(matchingLine, title));

  return matchedTitle ? toTitleCase(matchedTitle) : null;
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

function detectSeniority(lines: string[]) {
  const candidateLines = lines
    .slice(0, 5)
    .map((line) => normalizeKeyword(line))
    .filter(Boolean);
  const roleLines = candidateLines.filter((line) =>
    roleTitlePatterns.some((title) => hasWholeTerm(line, title))
  );
  const seniorityContext = roleLines.length > 0 ? roleLines : candidateLines;
  const match = seniorityPatterns.find((value) =>
    seniorityContext.some((line) => hasWholeTerm(line, value))
  );

  return match ? match.replace(/\b\w/g, (letter) => letter.toUpperCase()) : null;
}

function stripLeadInPhrases(line: string) {
  return line
    .replace(/^[•*-]\s*/, "")
    .replace(
      /^(the technology you will be using includes|desired skills and knowledge|desired skills|about you|key responsibilities|responsibilities|requirements)\s*:?\s*/i,
      ""
    )
    .replace(
      /^(experience with|proficient in|familiar with|exposure to|background in|solid understanding of|including tools like)\s+/i,
      ""
    );
}

function looksLikeRequirementLine(line: string) {
  const normalizedLine = normalizeKeyword(line);

  return (
    requirementLineHints.some((hint) => normalizedLine.includes(hint)) ||
    /^[•*-]/.test(line.trim()) ||
    normalizedLine.includes(",") ||
    normalizedLine.includes(" and ")
  );
}

function isNoiseFragment(value: string) {
  const normalized = normalizeKeyword(value);

  return (
    normalized.length < 3 ||
    mustHaveHints.some((hint) => normalized === hint) ||
    niceToHaveHints.some((hint) => normalized === hint) ||
    /\b(years?|experience|applications|understanding|knowledge|ability|tools|including|desired|knowledge of|background in)\b/.test(normalized)
  );
}

function filterLowSignalLines(lines: string[]) {
  const filtered: string[] = [];
  let skipUntilNextHeading = false;

  for (const line of lines) {
    const trimmedLine = line.trim();
    const normalizedLine = normalizeKeyword(trimmedLine);

    if (!trimmedLine) {
      continue;
    }

    const isHeading = /^about\b|^[a-z][a-z '&/()-]{1,40}:?$/i.test(trimmedLine) || trimmedLine === trimmedLine.toUpperCase();
    const isLowSignalHeading = lowSignalHeadingHints.some((hint) => normalizedLine.includes(hint));

    if (isLowSignalHeading) {
      skipUntilNextHeading = true;
      continue;
    }

    if (skipUntilNextHeading) {
      if (isHeading && !isLowSignalHeading) {
        skipUntilNextHeading = false;
      } else {
        continue;
      }
    }

    if (lowSignalStandaloneLines.some((hint) => normalizedLine === hint)) {
      continue;
    }

    filtered.push(trimmedLine);
  }

  return filtered;
}

function extractRequirementKeywords(lines: string[]) {
  const extractedKeywords: JobDescriptionKeyword[] = [];
  const filteredOutPhrases = new Set<string>();

  for (const line of lines) {
    if (!looksLikeRequirementLine(line)) {
      continue;
    }

    const matches = findCatalogMatches(line, "requirement");
    extractedKeywords.push(...matches.map((match) => match.keyword));

    const matchedTerms = new Set(matches.flatMap((match) => match.matchedTerms));
    const fragments = stripLeadInPhrases(line)
      .split(/,|;|\/|\band\b/i)
      .map((fragment) => fragment.trim())
      .filter(Boolean);

    for (const fragment of fragments) {
      const normalizedFragment = normalizeKeyword(fragment);

      if (
        !normalizedFragment ||
        matchedTerms.has(normalizedFragment) ||
        matches.some((match) => hasWholeTerm(fragment, match.keyword.normalizedKeyword)) ||
        isNoiseFragment(fragment)
      ) {
        continue;
      }

      filteredOutPhrases.add(fragment);
    }
  }

  return {
    extractedKeywords,
    filteredOutPhrases: Array.from(filteredOutPhrases).sort((left, right) => left.localeCompare(right))
  };
}

function classifyKeywordPriority(keyword: JobDescriptionKeyword, normalizedSentences: string[]) {
  const matchingSentence = normalizedSentences.find((sentence) =>
    keyword.matchTerms.some((term) => hasWholeTerm(sentence, term))
  );

  if (!matchingSentence) {
    return keyword.category === "technical_skill" || keyword.category === "tool" || keyword.category === "qualification"
      ? "must"
      : "nice";
  }

  if (niceToHaveHints.some((hint) => matchingSentence.includes(hint))) {
    return "nice";
  }

  if (
    mustHaveHints.some((hint) => matchingSentence.includes(hint)) ||
    /\b\d+\+?\s+years?\b/.test(matchingSentence)
  ) {
    return "must";
  }

  return keyword.category === "technical_skill" || keyword.category === "tool" || keyword.category === "qualification"
    ? "must"
    : "nice";
}

function detectRequiredYearsExperience(lines: string[]) {
  const matches = lines.flatMap((line) => {
    const normalizedLine = normalizeKeyword(line);

    if (lowSignalHeadingHints.some((hint) => normalizedLine.includes(hint))) {
      return [];
    }

    return Array.from(normalizedLine.matchAll(/\b(\d+)\+?\s+years?\b/g)).map((match) => Number(match[1]));
  });

  if (matches.length === 0) {
    return null;
  }

  return Math.max(...matches);
}

export function processJobDescription(rawText: string): ProcessedJobDescription {
  const lines = filterLowSignalLines(splitIntoLines(rawText));
  const filteredRawText = lines.join("\n");
  const normalizedText = normalizeAnalysisText(filteredRawText);
  const normalizedSentences = splitIntoSentences(normalizedText);
  const catalogKeywords = findCatalogMatches(normalizedText, "catalog").map((match) => match.keyword);
  const requirementExtraction = extractRequirementKeywords(lines);
  const extractedKeywords = uniqueKeywords([...catalogKeywords, ...requirementExtraction.extractedKeywords]).sort(
    (left, right) => left.keyword.localeCompare(right.keyword)
  );
  const mustHaveKeywords = extractedKeywords.filter(
    (keyword) => classifyKeywordPriority(keyword, normalizedSentences) === "must"
  );
  const niceToHaveKeywords = extractedKeywords.filter(
    (keyword) => !mustHaveKeywords.some((mustHave) => mustHave.normalizedKeyword === keyword.normalizedKeyword)
  );

  return {
    rawText: filteredRawText,
    normalizedText,
    title: detectRoleTitle(lines),
    company: detectCompany(lines),
    seniority: detectSeniority(lines),
    requiredYearsExperience: detectRequiredYearsExperience(lines),
    extractedKeywords,
    mustHaveKeywords,
    niceToHaveKeywords,
    filteredOutPhrases: requirementExtraction.filteredOutPhrases
  };
}
