/* eslint-env node */

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const { test } = require("node:test");

const { processJobDescription } = require("../src/features/job-description/server/process-job-description.ts");

const jobDescriptionFixture = fs.readFileSync(
  path.join(__dirname, "fixtures", "wren-job-description.txt"),
  "utf8"
);

test("detects the software developer title and avoids false intern seniority", () => {
  const processed = processJobDescription(jobDescriptionFixture);

  assert.equal(processed.title, "Software Developer");
  assert.equal(processed.seniority, null);
});

test("extracts canonical requirement keywords and excludes noisy fragments", () => {
  const processed = processJobDescription(jobDescriptionFixture);
  const normalizedKeywords = new Set(processed.extractedKeywords.map((keyword) => keyword.normalizedKeyword));

  assert(normalizedKeywords.has("typescript"));
  assert(normalizedKeywords.has("react"));
  assert(normalizedKeywords.has("node.js"));
  assert(normalizedKeywords.has("html5"));
  assert(normalizedKeywords.has("canvas"));
  assert(normalizedKeywords.has("less"));
  assert(normalizedKeywords.has("webpack"));
  assert(normalizedKeywords.has("npm"));
  assert(normalizedKeywords.has("eslint"));
  assert(normalizedKeywords.has("karma"));
  assert(normalizedKeywords.has("git"));
  assert(normalizedKeywords.has("ci"));

  assert(!normalizedKeywords.has("including tools like docker"));
  assert(!normalizedKeywords.has("years experience developing"));
  assert(!normalizedKeywords.has("proficient in typescript"));
});
