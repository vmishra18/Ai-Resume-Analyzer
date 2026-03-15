import type { KeywordCategory } from "@/features/analysis/lib/types";
import { keywordCatalog } from "@/features/job-description/lib/catalog";
import type { JobDescriptionKeyword, ProcessedJobDescription } from "@/features/job-description/lib/types";
import { normalizeKeyword } from "@/features/nlp/server/text-normalization";

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
  aws: "AWS",
  ci: "CI",
  qa: "QA",
  sql: "SQL",
  "a/b testing": "A/B Testing",
  "power bi": "Power BI",
  macos: "macOS",
  eslint: "ESLint",
  npm: "NPM",
  graphql: "GraphQL",
  docker: "Docker",
  prisma: "Prisma"
};

interface ReviewedKeywordInput {
  mustHaveKeywordsText: string;
  supportingKeywordsText: string;
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

function parseKeywordList(value: string) {
  return Array.from(
    new Set(
      value
        .split(/\r?\n|,|;/)
        .map((item) => item.trim().replace(/^[•*-]\s*/, ""))
        .map((item) => normalizeKeyword(item))
        .filter(Boolean)
    )
  );
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

function buildExistingKeywordMaps(base: ProcessedJobDescription) {
  const byNormalized = new Map<string, JobDescriptionKeyword>();
  const byMatchTerm = new Map<string, JobDescriptionKeyword>();

  for (const keyword of base.extractedKeywords) {
    byNormalized.set(keyword.normalizedKeyword, keyword);

    for (const term of keyword.matchTerms) {
      byMatchTerm.set(term, keyword);
    }
  }

  return {
    byNormalized,
    byMatchTerm
  };
}

function buildCatalogKeyword(phrase: string, category: KeywordCategory, aliases?: string[]) {
  const normalizedKeyword = normalizeKeyword(phrase);

  return {
    keyword: formatKeywordLabel(phrase),
    normalizedKeyword,
    category,
    matchTerms: Array.from(new Set([phrase, ...(aliases ?? [])].map((term) => normalizeKeyword(term)).filter(Boolean))),
    source: "requirement" as const
  };
}

function buildKeywordFromInput(
  value: string,
  baseMaps: ReturnType<typeof buildExistingKeywordMaps>,
  fallbackCategory: KeywordCategory
) {
  const normalizedValue = normalizeKeyword(value);
  const existingKeyword = baseMaps.byNormalized.get(normalizedValue) ?? baseMaps.byMatchTerm.get(normalizedValue);

  if (existingKeyword) {
    return {
      ...existingKeyword,
      source: "requirement" as const
    };
  }

  const catalogEntry = keywordCatalog.find((entry) => {
    if (normalizeKeyword(entry.phrase) === normalizedValue) {
      return true;
    }

    return (entry.aliases ?? []).some((alias) => normalizeKeyword(alias) === normalizedValue);
  });

  if (catalogEntry) {
    return buildCatalogKeyword(catalogEntry.phrase, catalogEntry.category, catalogEntry.aliases);
  }

  return {
    keyword: formatKeywordLabel(value),
    normalizedKeyword: normalizedValue,
    category: fallbackCategory,
    matchTerms: [normalizedValue],
    source: "requirement" as const
  };
}

function mapKeywords(
  values: string[],
  baseMaps: ReturnType<typeof buildExistingKeywordMaps>,
  fallbackCategory: KeywordCategory
) {
  return uniqueKeywords(values.map((value) => buildKeywordFromInput(value, baseMaps, fallbackCategory)));
}

export function buildReviewedJobDescription(
  base: ProcessedJobDescription,
  input: ReviewedKeywordInput
): ProcessedJobDescription {
  const mustHaveValues = parseKeywordList(input.mustHaveKeywordsText);
  const supportingValues = parseKeywordList(input.supportingKeywordsText);
  const baseMaps = buildExistingKeywordMaps(base);
  const mustHaveKeywords = mapKeywords(mustHaveValues, baseMaps, "technical_skill");
  const supportingKeywords = mapKeywords(supportingValues, baseMaps, "technical_skill").filter(
    (keyword) => !mustHaveKeywords.some((mustHave) => mustHave.normalizedKeyword === keyword.normalizedKeyword)
  );
  const extractedKeywords = uniqueKeywords([...mustHaveKeywords, ...supportingKeywords]);

  return {
    ...base,
    extractedKeywords,
    mustHaveKeywords,
    niceToHaveKeywords: supportingKeywords
  };
}

export function buildKeywordReviewText(base: ProcessedJobDescription) {
  return {
    mustHaveKeywordsText: base.mustHaveKeywords.map((keyword) => keyword.keyword).join("\n"),
    supportingKeywordsText: base.niceToHaveKeywords.map((keyword) => keyword.keyword).join("\n")
  };
}
