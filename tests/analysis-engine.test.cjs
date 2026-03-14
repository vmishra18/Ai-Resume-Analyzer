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
  assert(analysis.score.total <= 85, `expected score <= 85, received ${analysis.score.total}`);
});

test("captures semantic skill matches when adjacent tooling is present", () => {
  const jobDescription = processJobDescription(`
    Senior Frontend Engineer

    We need React, accessibility, TypeScript, CI, and design systems experience.
  `);
  const resume = buildParsedResume(`
    SUMMARY
    Frontend engineer building production applications with Next.js and TypeScript.

    EXPERIENCE
    - Built customer-facing interfaces in Next.js and TypeScript for a design system migration.
    - Improved release reliability with GitHub Actions and automated checks.

    SKILLS
    Next.js, TypeScript, GitHub Actions, Accessibility
  `);

  const analysis = analyzeResumeAgainstJob(resume, jobDescription);

  assert(analysis.explanation.semanticMatches.some((match) => match.keyword === "React" && match.evidence === "next.js"));
  assert(analysis.partialKeywords.some((keyword) => keyword.keyword === "React"));
});

test("detects seniority and role-family mismatches", () => {
  const jobDescription = processJobDescription(`
    Senior Backend Engineer

    Looking for Node.js, microservices, system design, AWS, and API architecture.
  `);
  const resume = buildParsedResume(`
    SUMMARY
    Junior QA engineer focused on manual testing and Cypress coverage.

    EXPERIENCE
    - Worked on regression testing for web applications.
    - Assisted with QA coverage for release cycles.

    SKILLS
    Cypress, Manual Testing, QA, Regression Testing
  `);

  const analysis = analyzeResumeAgainstJob(resume, jobDescription);

  assert.equal(analysis.explanation.seniorityMismatch.hasMismatch, true);
  assert.equal(analysis.explanation.roleFamilyAlignment, "adjacent");
  assert.equal(analysis.explanation.resumeRoleFamily, "qa");
});

test("finds achievement signals, weak bullets, and rewrite assists", () => {
  const jobDescription = processJobDescription(`
    Backend Engineer

    Need Node.js, AWS, system design, Docker, and CI experience.
  `);
  const resume = buildParsedResume(`
    SUMMARY
    Backend engineer building internal tooling and platform workflows.

    EXPERIENCE
    - Responsible for backend tasks.
    - Worked on APIs.
    - Led migration of 12 services to a new deployment workflow, reducing release time by 35%.

    SKILLS
    Node.js, Docker, APIs
  `);

  const analysis = analyzeResumeAgainstJob(resume, jobDescription);

  assert(analysis.explanation.achievementSignals.length >= 1);
  assert(analysis.explanation.weakBullets.length >= 1);
  assert(analysis.explanation.rewriteAssist.length >= 1);
});
