import { WordTokenizer } from "natural/lib/natural/tokenizers";

const tokenizer = new WordTokenizer();

export const STOP_WORDS = new Set([
  "a",
  "an",
  "and",
  "are",
  "as",
  "at",
  "be",
  "by",
  "for",
  "from",
  "have",
  "in",
  "into",
  "is",
  "of",
  "on",
  "or",
  "our",
  "that",
  "the",
  "their",
  "they",
  "this",
  "to",
  "we",
  "with",
  "you",
  "your"
]);

export function normalizeAnalysisText(value: string) {
  return value
    .toLowerCase()
    .replace(/\r\n/g, "\n")
    .replace(/\u00a0/g, " ")
    .replace(/[•▪●◦]/g, "-")
    .replace(/[()]/g, " ")
    .replace(/[ ]{2,}/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

export function tokenizeForAnalysis(value: string) {
  return tokenizer
    .tokenize(normalizeAnalysisText(value))
    .map((token) => token.trim())
    .filter(Boolean);
}

export function removeStopWords(tokens: string[]) {
  return tokens.filter((token) => !STOP_WORDS.has(token));
}

export function splitIntoLines(value: string) {
  return value
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
}

export function splitIntoSentences(value: string) {
  return value
    .split(/(?<=[.!?])\s+|\n+/)
    .map((sentence) => sentence.trim())
    .filter(Boolean);
}

export function normalizeKeyword(value: string) {
  return value
    .toLowerCase()
    .replace(/[^\w+#./ -]/g, " ")
    .replace(/[ ]{2,}/g, " ")
    .trim();
}

export function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function buildTermPattern(term: string) {
  const normalizedTerm = normalizeKeyword(term);

  if (!normalizedTerm) {
    return null;
  }

  return new RegExp(`(^|[^a-z0-9+#./-])${escapeRegExp(normalizedTerm)}(?=$|[^a-z0-9+#./-])`, "g");
}

export function hasWholeTerm(value: string, term: string) {
  const pattern = buildTermPattern(term);

  if (!pattern) {
    return false;
  }

  return pattern.test(normalizeAnalysisText(value));
}

export function countWholeTermMatches(value: string, term: string) {
  const pattern = buildTermPattern(term);

  if (!pattern) {
    return 0;
  }

  const matches = normalizeAnalysisText(value).match(pattern);

  return matches?.length ?? 0;
}
