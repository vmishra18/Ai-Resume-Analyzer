/* eslint-env node */

const assert = require("node:assert/strict");
const { test } = require("node:test");

const { processJobDescription } = require("../src/features/job-description/server/process-job-description.ts");
const {
  buildKeywordReviewText,
  buildReviewedJobDescription
} = require("../src/features/job-description/server/keyword-review.ts");

test("builds editable keyword review text from a processed job description", () => {
  const processed = processJobDescription(`
    Senior Frontend Engineer

    We need React, TypeScript, accessibility, CI, and design systems experience.
    Nice to have: GraphQL and AWS.
  `);
  const reviewText = buildKeywordReviewText(processed);

  assert.match(reviewText.mustHaveKeywordsText, /React/i);
  assert.match(reviewText.supportingKeywordsText, /GraphQL/i);
});

test("rebuilds reviewed job keywords while preserving catalog matches and removing duplicates", () => {
  const processed = processJobDescription(`
    Senior Frontend Engineer

    Requirements:
    - React
    - TypeScript
    - Accessibility
    - CI

    Nice to have:
    - GraphQL
    - AWS
  `);

  const reviewed = buildReviewedJobDescription(processed, {
    mustHaveKeywordsText: "React\nTypeScript\nAWS\nReact",
    supportingKeywordsText: "GraphQL\nDesign systems\nAWS"
  });

  const extractedKeywords = reviewed.extractedKeywords.map((keyword) => keyword.normalizedKeyword);
  const mustHaveKeywords = reviewed.mustHaveKeywords.map((keyword) => keyword.normalizedKeyword);
  const supportingKeywords = reviewed.niceToHaveKeywords.map((keyword) => keyword.normalizedKeyword);

  assert.deepEqual(mustHaveKeywords, ["react", "typescript", "aws"]);
  assert.deepEqual(supportingKeywords, ["graphql", "design systems"]);
  assert.equal(extractedKeywords.includes("aws"), true);
  assert.equal(extractedKeywords.filter((keyword) => keyword === "react").length, 1);
  assert.equal(reviewed.mustHaveKeywords.find((keyword) => keyword.normalizedKeyword === "aws")?.category, "tool");
});
