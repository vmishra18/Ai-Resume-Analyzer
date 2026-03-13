/* eslint-env node */

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const { test } = require("node:test");

const { analyzeResumeAgainstJob } = require("../src/features/analysis/server/analysis-engine.ts");
const { processJobDescription } = require("../src/features/job-description/server/process-job-description.ts");
const { normalizeResumeText } = require("../src/features/resume-parser/server/normalization.ts");
const {
  calculateStructureScore,
  detectResumeSections,
  extractResumeSummary
} = require("../src/features/resume-parser/server/section-detector.ts");

const jobDescriptionFixture = fs.readFileSync(
  path.join(__dirname, "fixtures", "wren-job-description.txt"),
  "utf8"
);
const resumeFixture = fs.readFileSync(path.join(__dirname, "fixtures", "wren-resume.txt"), "utf8");

function buildParsedResume(rawText) {
  const normalizedText = normalizeResumeText(rawText);
  const sections = detectResumeSections(normalizedText);

  return {
    rawText,
    normalizedText,
    summary: extractResumeSummary(normalizedText),
    structureScore: calculateStructureScore(normalizedText, sections),
    sections
  };
}

test("matches canonical skill variants across resume and job description", () => {
  const analysis = analyzeResumeAgainstJob(
    buildParsedResume(resumeFixture),
    processJobDescription(jobDescriptionFixture)
  );

  const matchedKeywords = new Set(analysis.matchedKeywords.map((keyword) => keyword.normalizedKeyword));

  assert(matchedKeywords.has("react"));
  assert(matchedKeywords.has("node.js"));
  assert(matchedKeywords.has("canvas"));
  assert(matchedKeywords.has("ci"));
  assert(matchedKeywords.has("less"));
  assert(matchedKeywords.has("webpack"));
  assert(matchedKeywords.has("npm"));
  assert(matchedKeywords.has("eslint"));
  assert(matchedKeywords.has("docker"));
  assert(matchedKeywords.has("git"));
  assert(matchedKeywords.has("agile"));
});

test("produces a recruiter-realistic score band for the Wren-style fixture", () => {
  const analysis = analyzeResumeAgainstJob(
    buildParsedResume(resumeFixture),
    processJobDescription(jobDescriptionFixture)
  );

  assert.equal(analysis.explanation.canonicalMissingKeywords.includes("React"), false);
  assert.equal(analysis.explanation.canonicalMissingKeywords.includes("Node.js"), false);
  assert.equal(analysis.explanation.canonicalMissingKeywords.includes("HTML5"), false);
  assert.equal(analysis.explanation.canonicalMissingKeywords.includes("Canvas"), false);

  assert(analysis.score.total >= 65, `expected score >= 65, received ${analysis.score.total}`);
  assert(analysis.score.total <= 80, `expected score <= 80, received ${analysis.score.total}`);
});
