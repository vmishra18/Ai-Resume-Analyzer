import { maxBonusScore, scoringWeights } from "@/features/analysis/lib/scoring-design";
import type {
  AnalysisSuggestion,
  AnalysisSummary,
  KeywordArtifact,
  RoleFamily,
  ScoreBreakdown,
  ScoreExplanation
} from "@/features/analysis/lib/types";
import type { ProcessedJobDescription } from "@/features/job-description/lib/types";
import { countWholeTermMatches, hasWholeTerm, normalizeKeyword, splitIntoLines } from "@/features/nlp/server/text-normalization";
import type { ParsedResumeResult } from "@/features/resume-parser/lib/types";
import { countWords } from "@/features/resume-parser/server/normalization";

const actionVerbs = [
  "built",
  "launched",
  "shipped",
  "scaled",
  "optimized",
  "improved",
  "designed",
  "implemented",
  "created",
  "developed",
  "owned",
  "led",
  "reduced",
  "increased",
  "delivered",
  "automated"
] as const;

const roleFamilyProfiles: Record<RoleFamily, { labels: string[]; keywords: string[] }> = {
  frontend: {
    labels: ["Frontend"],
    keywords: [
      "frontend engineer",
      "frontend developer",
      "react",
      "next.js",
      "javascript",
      "typescript",
      "html5",
      "css",
      "design systems",
      "accessibility"
    ]
  },
  backend: {
    labels: ["Backend"],
    keywords: [
      "backend engineer",
      "backend developer",
      "node.js",
      "java",
      "python",
      "go",
      "sql",
      "postgresql",
      "rest api",
      "microservices",
      "system design"
    ]
  },
  product: {
    labels: ["PM"],
    keywords: [
      "product manager",
      "user research",
      "a/b testing",
      "stakeholder management",
      "prioritisation",
      "customer empathy",
      "product engineering"
    ]
  },
  data: {
    labels: ["Data"],
    keywords: [
      "data engineer",
      "data analyst",
      "data analysis",
      "data visualisation",
      "sql",
      "tableau",
      "power bi",
      "machine learning",
      "python"
    ]
  },
  devops: {
    labels: ["DevOps"],
    keywords: [
      "devops engineer",
      "site reliability engineer",
      "aws",
      "azure",
      "gcp",
      "docker",
      "kubernetes",
      "ci",
      "linux",
      "incident management"
    ]
  },
  qa: {
    labels: ["QA"],
    keywords: [
      "qa engineer",
      "quality assurance engineer",
      "automation testing",
      "manual testing",
      "playwright",
      "cypress",
      "selenium",
      "jest"
    ]
  },
  general: {
    labels: ["Generalist"],
    keywords: ["software engineer", "software developer", "full stack engineer", "full stack developer"]
  }
};

const semanticKeywordProfiles: Record<string, string[]> = {
  react: ["next.js", "vue", "angular", "typescript", "javascript"],
  "next.js": ["react", "node.js", "typescript"],
  "node.js": ["rest api", "microservices", "javascript", "typescript"],
  typescript: ["javascript", "react", "next.js"],
  javascript: ["typescript", "react", "node.js"],
  aws: ["azure", "gcp", "docker", "kubernetes"],
  azure: ["aws", "gcp", "docker", "kubernetes"],
  gcp: ["aws", "azure", "docker", "kubernetes"],
  ci: ["github actions", "docker", "kubernetes", "git"],
  "automation testing": ["playwright", "cypress", "jest", "selenium", "manual testing"],
  "manual testing": ["automation testing", "qa"],
  "stakeholder management": ["stakeholders", "communication", "leadership"],
  "user research": ["a/b testing", "customer empathy", "stakeholders"],
  "system design": ["microservices", "rest api", "software design patterns"],
  docker: ["kubernetes", "aws", "azure", "gcp"],
  kubernetes: ["docker", "aws", "azure", "gcp"]
};

const genericBulletOpeners = [
  "responsible for",
  "was responsible for",
  "worked on",
  "helped with",
  "assisted with",
  "involved in",
  "participated in",
  "tasked with",
  "duties included"
] as const;

const ownershipVerbs = ["owned", "led", "drove", "spearheaded", "managed", "mentored"] as const;
const impactVerbs = ["improved", "increased", "reduced", "grew", "scaled", "saved", "accelerated", "optimized"] as const;
const metricPattern = /\b(\d+%|\d+x|\d+\+|\$\d[\d,]*|\d+\s+(users|customers|teams|projects|hours|days|weeks|months|pipelines|releases))\b/i;
const bulletPattern = /^[-*•]\s*/;

function percentage(part: number, total: number) {
  if (total === 0) {
    return 0;
  }

  return Math.round((part / total) * 100);
}

function uniqueLabels(keywords: KeywordArtifact[]) {
  return Array.from(new Set(keywords.map((keyword) => keyword.keyword))).sort((left, right) =>
    left.localeCompare(right)
  );
}

function normalizeSeniority(value: string | null) {
  if (!value) {
    return null;
  }

  const normalized = normalizeKeyword(value);

  if (normalized.includes("mid")) {
    return "mid-level";
  }

  if (normalized.includes("associate")) {
    return "associate";
  }

  if (normalized.includes("principal")) {
    return "principal";
  }

  if (normalized.includes("staff")) {
    return "staff";
  }

  if (normalized.includes("lead")) {
    return "lead";
  }

  if (normalized.includes("head")) {
    return "head";
  }

  if (normalized.includes("manager")) {
    return "manager";
  }

  if (normalized.includes("senior")) {
    return "senior";
  }

  if (normalized.includes("junior")) {
    return "junior";
  }

  if (normalized.includes("intern")) {
    return "intern";
  }

  return normalized || null;
}

function extractBulletLines(rawText: string) {
  return splitIntoLines(rawText)
    .filter((line) => bulletPattern.test(line))
    .map((line) => line.replace(bulletPattern, "").trim())
    .filter(Boolean);
}

function detectRoleFamily(text: string, keywordLabels: string[] = []): RoleFamily | null {
  const normalizedText = normalizeKeyword(text);
  let bestFamily: RoleFamily | null = null;
  let bestScore = 0;

  (Object.keys(roleFamilyProfiles) as RoleFamily[]).forEach((family) => {
    const profile = roleFamilyProfiles[family];
    const hits = profile.keywords.reduce((total, keyword) => {
      if (hasWholeTerm(normalizedText, keyword)) {
        return total + 2;
      }

      if (keywordLabels.some((label) => normalizeKeyword(label) === keyword)) {
        return total + 2;
      }

      return total;
    }, 0);

    if (hits > bestScore) {
      bestFamily = family;
      bestScore = hits;
    }
  });

  return bestScore > 0 ? bestFamily : null;
}

function classifyRoleFamilyAlignment(jobFamily: RoleFamily | null, resumeFamily: RoleFamily | null) {
  if (!jobFamily || !resumeFamily) {
    return "unknown" as const;
  }

  if (jobFamily === resumeFamily) {
    return "aligned" as const;
  }

  const adjacentPairs = new Set([
    "frontend:backend",
    "backend:frontend",
    "backend:devops",
    "devops:backend",
    "frontend:qa",
    "qa:frontend",
    "backend:qa",
    "qa:backend",
    "product:frontend",
    "frontend:product",
    "data:backend",
    "backend:data"
  ]);

  return adjacentPairs.has(`${jobFamily}:${resumeFamily}`) ? ("adjacent" as const) : ("mismatch" as const);
}

function inferResumeSeniority(resume: ParsedResumeResult, estimatedYearsExperience: number | null) {
  const normalizedText = resume.normalizedText;
  const explicitSignals = [
    "head",
    "principal",
    "staff",
    "lead",
    "manager",
    "senior",
    "mid-level",
    "associate",
    "junior",
    "intern"
  ];

  const directMatch = explicitSignals.find((value) => hasWholeTerm(normalizedText, value));

  if (directMatch) {
    return directMatch;
  }

  if (estimatedYearsExperience === null) {
    return null;
  }

  if (estimatedYearsExperience >= 10) {
    return "principal";
  }

  if (estimatedYearsExperience >= 8) {
    return "lead";
  }

  if (estimatedYearsExperience >= 5) {
    return "senior";
  }

  if (estimatedYearsExperience >= 3) {
    return "mid-level";
  }

  if (estimatedYearsExperience >= 1) {
    return "junior";
  }

  return "intern";
}

function assessSeniorityMismatch(jobSeniority: string | null, resumeSeniority: string | null) {
  const normalizedJob = normalizeSeniority(jobSeniority);
  const normalizedResume = normalizeSeniority(resumeSeniority);
  const seniorityOrder = ["intern", "junior", "associate", "mid-level", "senior", "staff", "lead", "principal", "manager", "head"];

  if (!normalizedJob || !normalizedResume) {
    return {
      hasMismatch: false,
      jobSeniority: normalizedJob,
      resumeSeniority: normalizedResume,
      summary: null
    };
  }

  const jobIndex = seniorityOrder.indexOf(normalizedJob);
  const resumeIndex = seniorityOrder.indexOf(normalizedResume);

  if (jobIndex < 0 || resumeIndex < 0 || Math.abs(jobIndex - resumeIndex) <= 1) {
    return {
      hasMismatch: false,
      jobSeniority: normalizedJob,
      resumeSeniority: normalizedResume,
      summary: null
    };
  }

  return {
    hasMismatch: true,
    jobSeniority: normalizedJob,
    resumeSeniority: normalizedResume,
    summary:
      resumeIndex < jobIndex
        ? `The resume reads closer to ${normalizedResume} level while the role targets ${normalizedJob} scope.`
        : `The resume reads more senior (${normalizedResume}) than the ${normalizedJob} role currently signals.`
  };
}

function detectAchievementSignals(resume: ParsedResumeResult) {
  return extractBulletLines(resume.rawText)
    .map((bullet) => {
      const normalizedBullet = normalizeKeyword(bullet);
      const evidence: string[] = [];

      if (metricPattern.test(bullet)) {
        evidence.push("metrics");
      }

      if (ownershipVerbs.some((verb) => hasWholeTerm(normalizedBullet, verb))) {
        evidence.push("ownership");
      }

      if (impactVerbs.some((verb) => hasWholeTerm(normalizedBullet, verb))) {
        evidence.push("impact");
      }

      return evidence.length > 0 ? { bullet, evidence } : null;
    })
    .filter((value): value is { bullet: string; evidence: string[] } => Boolean(value))
    .slice(0, 6);
}

function detectWeakBullets(resume: ParsedResumeResult, keywordArtifacts: KeywordArtifact[]) {
  const matchedTerms = new Set(
    keywordArtifacts
      .filter((keyword) => keyword.matchType !== "missing")
      .flatMap((keyword) => [keyword.normalizedKeyword, ...(keyword.semanticEvidence ? [normalizeKeyword(keyword.semanticEvidence)] : [])])
  );

  return extractBulletLines(resume.rawText)
    .map((bullet) => {
      const normalizedBullet = normalizeKeyword(bullet);
      const issues: string[] = [];
      const bulletWords = countWords(normalizedBullet);

      if (genericBulletOpeners.some((phrase) => normalizedBullet.startsWith(phrase))) {
        issues.push("generic opener");
      }

      if (!metricPattern.test(bullet)) {
        issues.push("no measurable outcome");
      }

      if (bulletWords < 8) {
        issues.push("low specificity");
      }

      if (!Array.from(matchedTerms).some((term) => hasWholeTerm(normalizedBullet, term))) {
        issues.push("missing role keywords");
      }

      return issues.length >= 2 ? { bullet, issues } : null;
    })
    .filter((value): value is { bullet: string; issues: string[] } => Boolean(value))
    .slice(0, 5);
}

function buildRewriteAssist(
  weakBullets: Array<{ bullet: string; issues: string[] }>,
  missingMustHaves: KeywordArtifact[],
  roleFamily: RoleFamily | null
) {
  const assists = weakBullets.slice(0, 3).map((item, index) => {
    const cleaned = item.bullet
      .replace(new RegExp(`^(${genericBulletOpeners.join("|")})\\s+`, "i"), "")
      .replace(/\.$/, "")
      .trim();
    const skillHint = missingMustHaves
      .slice(index * 2, index * 2 + 2)
      .map((keyword) => keyword.keyword)
      .join(" and ");
    const suggestion = `Built ${cleaned || "production work"}${skillHint ? ` using ${skillHint}` : ""}, improving [metric or outcome] and making ownership explicit.`;

    return {
      id: `weak-${index}`,
      kind: "weak_bullet" as const,
      original: item.bullet,
      suggestion,
      rationale: `Reframes the bullet to reduce ${item.issues.join(", ")}.`
    };
  });

  if (missingMustHaves.length > 0) {
    const skills = missingMustHaves.slice(0, 2).map((keyword) => keyword.keyword);
    const roleFamilyTemplates: Record<RoleFamily, string> = {
      frontend: `Implemented ${skills.join(" and ")} in production UI flows, improving [user, accessibility, or performance outcome].`,
      backend: `Built backend services using ${skills.join(" and ")}, reducing [latency, errors, or manual work].`,
      product: `Led product discovery and delivery work around ${skills.join(" and ")}, aligning stakeholders and improving [business metric].`,
      data: `Built data workflows with ${skills.join(" and ")}, improving [reporting, model, or business insight outcome].`,
      devops: `Automated release and reliability workflows with ${skills.join(" and ")}, reducing [downtime or deployment time].`,
      qa: `Designed quality coverage using ${skills.join(" and ")}, reducing escaped defects and improving release confidence.`,
      general: `Shipped work involving ${skills.join(" and ")}, improving [delivery, quality, or business outcome].`
    };

    assists.push({
      id: "missing-skill-template",
      kind: "missing_skill" as const,
      original: null,
      suggestion: roleFamilyTemplates[roleFamily ?? "general"],
      rationale: "Draft line to customize if you genuinely have experience with the missing skills."
    });
  }

  return assists.slice(0, 4);
}

function getWeightedCoverage(keywords: KeywordArtifact[]) {
  if (keywords.length === 0) {
    return 0;
  }

  return Math.round(
    (keywords.reduce((total, keyword) => {
      if (keyword.matchType === "matched") {
        return total + 1;
      }

      if (keyword.matchType === "partial") {
        return total + 0.5;
      }

      return total;
    }, 0) /
      keywords.length) *
      100
  );
}

function buildKeywordArtifacts(resume: ParsedResumeResult, jobDescription: ProcessedJobDescription) {
  const resumeTokenSet = new Set(
    resume.normalizedText
      .split(/[^a-z0-9+#./-]+/)
      .map((token) => token.trim())
      .filter(Boolean)
  );
  const mustHaveSet = new Set(jobDescription.mustHaveKeywords.map((keyword) => keyword.normalizedKeyword));

  return jobDescription.extractedKeywords.map<KeywordArtifact>((keyword) => {
    const exactMatches = keyword.matchTerms.reduce(
      (highestCount, term) => Math.max(highestCount, countWholeTermMatches(resume.normalizedText, term)),
      0
    );
    const partialCandidates = keyword.matchTerms
      .map((term) => term.split(/\s+/).filter(Boolean))
      .filter((parts) => parts.length > 1);
    const matchedParts = partialCandidates.reduce((highestMatch, parts) => {
      const partMatches = parts.filter((part) => resumeTokenSet.has(part)).length;

      return Math.max(highestMatch, partMatches);
    }, 0);
    const bestPartialLength = partialCandidates.reduce(
      (highestLength, parts) => Math.max(highestLength, parts.length),
      0
    );
    const partialThreshold = bestPartialLength > 1 ? Math.ceil(bestPartialLength / 2) : 0;
    const semanticEvidence = (semanticKeywordProfiles[keyword.normalizedKeyword] ?? []).find((candidate) =>
      hasWholeTerm(resume.normalizedText, candidate)
    );
    const isPartial =
      exactMatches === 0 &&
      bestPartialLength > 1 &&
      matchedParts >= partialThreshold &&
      (keyword.category === "technical_skill" || keyword.category === "tool" || keyword.category === "domain");
    const isSemantic =
      exactMatches === 0 &&
      !isPartial &&
      Boolean(semanticEvidence) &&
      (keyword.category === "technical_skill" || keyword.category === "tool" || keyword.category === "domain");
    const matchType = exactMatches > 0 ? "matched" : isPartial || isSemantic ? "partial" : "missing";

    return {
      keyword: keyword.keyword,
      normalizedKeyword: keyword.normalizedKeyword,
      category: keyword.category,
      matched: matchType === "matched",
      matchType,
      occurrences: exactMatches > 0 ? exactMatches : isSemantic ? 1 : matchedParts,
      isMustHave: mustHaveSet.has(keyword.normalizedKeyword),
      source: keyword.source,
      matchedVia: exactMatches > 0 ? "exact" : isSemantic ? "semantic" : matchType === "partial" ? "partial" : undefined,
      semanticEvidence: semanticEvidence ?? null
    };
  });
}

function estimateYearsExperience(resume: ParsedResumeResult) {
  const explicitYears = Array.from(resume.normalizedText.matchAll(/\b(\d+)\+?\s+years?\b/g)).map((match) =>
    Number(match[1])
  );
  const yearMatches = Array.from(
    resume.rawText.matchAll(
      /\b(?:jan|feb|mar|apr|may|jun|jul|aug|sep|sept|oct|nov|dec)?\.?\s*(20\d{2}|19\d{2})\s*[-–]\s*(?:present|current|now|(?:jan|feb|mar|apr|may|jun|jul|aug|sep|sept|oct|nov|dec)?\.?\s*(20\d{2}|19\d{2}))\b/gi
    )
  );

  const dateSpans = yearMatches.map((match) => {
    const startYear = Number(match[1]);
    const endYear = match[2] ? Number(match[2]) : new Date().getFullYear();

    return Math.max(0, endYear - startYear);
  });

  const strongestSignal = Math.max(...explicitYears, ...dateSpans, 0);

  return strongestSignal > 0 ? strongestSignal : null;
}

function calculateYearsExperienceScore(
  estimatedYearsExperience: number | null,
  requiredYearsExperience: number | null
) {
  if (!requiredYearsExperience) {
    return null;
  }

  if (!estimatedYearsExperience) {
    return 30;
  }

  if (estimatedYearsExperience >= requiredYearsExperience + 2) {
    return 100;
  }

  if (estimatedYearsExperience >= requiredYearsExperience) {
    return 90;
  }

  if (estimatedYearsExperience >= requiredYearsExperience - 1) {
    return 60;
  }

  return 45;
}

function calculateReadabilityScore(resume: ParsedResumeResult) {
  const words = countWords(resume.normalizedText);
  const sentenceParts = resume.rawText
    .split(/[.!?]+/)
    .map((sentence) => sentence.trim())
    .filter(Boolean);
  const averageSentenceLength =
    sentenceParts.length > 0
      ? sentenceParts.reduce((total, sentence) => total + countWords(sentence), 0) / sentenceParts.length
      : 0;
  const lineCount = resume.rawText
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean).length;
  const averageLineDensity = lineCount > 0 ? words / lineCount : 0;

  let score = 0;

  score += words >= 350 && words <= 950 ? 40 : words >= 250 && words <= 1100 ? 30 : 18;
  score += averageSentenceLength >= 10 && averageSentenceLength <= 24 ? 35 : averageSentenceLength <= 30 ? 24 : 12;
  score += averageLineDensity <= 18 ? 25 : averageLineDensity <= 24 ? 16 : 8;

  return Math.min(score, 100);
}

function calculateBulletQualityScore(resume: ParsedResumeResult) {
  const bulletLines = resume.rawText
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => /^[-*•]/.test(line));

  if (bulletLines.length === 0) {
    return 20;
  }

  const actionLedBullets = bulletLines.filter((line) =>
    actionVerbs.some((verb) => new RegExp(`\\b${verb}\\b`, "i").test(line))
  ).length;
  const quantifiedBullets = bulletLines.filter((line) => /\b(\d+%|\d+x|\d+\+|\$\d+|\d+\s+(users|customers|teams|projects))\b/i.test(line)).length;

  let score = 0;

  score += bulletLines.length >= 6 ? 35 : bulletLines.length >= 3 ? 24 : 12;
  score += percentage(actionLedBullets, bulletLines.length) >= 60 ? 35 : percentage(actionLedBullets, bulletLines.length) >= 35 ? 24 : 12;
  score += quantifiedBullets >= 3 ? 30 : quantifiedBullets >= 1 ? 20 : 10;

  return Math.min(score, 100);
}

function calculateRoleRelevance(
  resume: ParsedResumeResult,
  jobDescription: ProcessedJobDescription,
  keywordArtifacts: KeywordArtifact[],
  yearsExperienceScore: number | null,
  jobRoleFamily: RoleFamily | null,
  resumeRoleFamily: RoleFamily | null,
  seniorityMismatch: { hasMismatch: boolean }
) {
  const signals: number[] = [];

  if (jobDescription.title) {
    const normalizedTitle = jobDescription.title.toLowerCase();
    const titleTokens = normalizedTitle.split(/\s+/).filter(Boolean);
    const titleTokenMatches = titleTokens.filter((token) => hasWholeTerm(resume.normalizedText, token)).length;

    signals.push(
      hasWholeTerm(resume.normalizedText, normalizedTitle)
        ? 100
        : percentage(titleTokenMatches, titleTokens.length)
    );
  }

  if (jobDescription.seniority) {
    signals.push(hasWholeTerm(resume.normalizedText, jobDescription.seniority.toLowerCase()) ? 100 : 30);
  }

  const domainKeywords = keywordArtifacts.filter((keyword) => keyword.category === "domain");

  if (domainKeywords.length > 0) {
    signals.push(getWeightedCoverage(domainKeywords));
  }

  if (yearsExperienceScore !== null) {
    signals.push(yearsExperienceScore);
  }

  const familyAlignment = classifyRoleFamilyAlignment(jobRoleFamily, resumeRoleFamily);
  signals.push(
    familyAlignment === "aligned" ? 100 : familyAlignment === "adjacent" ? 72 : familyAlignment === "mismatch" ? 42 : 60
  );

  if (seniorityMismatch.hasMismatch) {
    signals.push(45);
  }

  return signals.length > 0
    ? Math.round(signals.reduce((total, value) => total + value, 0) / signals.length)
    : 0;
}

function calculateAlignmentScore(
  resume: ParsedResumeResult,
  jobDescription: ProcessedJobDescription,
  keywordArtifacts: KeywordArtifact[],
  mustHaveCoverage: number,
  yearsExperienceScore: number | null,
  jobRoleFamily: RoleFamily | null,
  resumeRoleFamily: RoleFamily | null,
  seniorityMismatch: { hasMismatch: boolean }
) {
  const relevantKeywords = keywordArtifacts.filter(
    (keyword) => keyword.category === "technical_skill" || keyword.category === "tool" || keyword.category === "domain"
  );
  const relevantCoverage = getWeightedCoverage(relevantKeywords);
  const summaryText = `${resume.summary ?? ""} ${resume.normalizedText.slice(0, 420)}`.toLowerCase();
  const summaryKeywordHits = jobDescription.extractedKeywords.filter((keyword) =>
    keyword.matchTerms.some((term) => hasWholeTerm(summaryText, term))
  ).length;
  const summaryAlignment = jobDescription.title && hasWholeTerm(summaryText, jobDescription.title.toLowerCase())
    ? 100
    : summaryKeywordHits >= 4
      ? 90
      : summaryKeywordHits >= 2
        ? 70
        : summaryKeywordHits === 1
          ? 45
          : 20;
  const yearsSignal = yearsExperienceScore ?? 70;
  const familyAlignment = classifyRoleFamilyAlignment(jobRoleFamily, resumeRoleFamily);
  const familySignal =
    familyAlignment === "aligned" ? 100 : familyAlignment === "adjacent" ? 76 : familyAlignment === "mismatch" ? 45 : 65;
  const senioritySignal = seniorityMismatch.hasMismatch ? 50 : 90;

  return Math.min(
    100,
    Math.round(
      relevantCoverage * 0.35 +
        mustHaveCoverage * 0.25 +
        summaryAlignment * 0.1 +
        yearsSignal * 0.1 +
        familySignal * 0.1 +
        senioritySignal * 0.1
    )
  );
}

function calculateBonusScore(
  resume: ParsedResumeResult,
  achievementSignals: Array<{ bullet: string; evidence: string[] }>,
  roleFamilyAlignment: "aligned" | "adjacent" | "mismatch" | "unknown"
) {
  let score = 0;
  const bonusSignals: string[] = [];

  if (resume.sections.projects) {
    score += 1;
    bonusSignals.push("Projects section detected");
  }

  if (/\b(\d+%|\d+x|\d+\+|\$\d+)\b/.test(resume.normalizedText)) {
    score += 2;
    bonusSignals.push("Quantified impact detected");
  }

  if (new RegExp(`\\b(${actionVerbs.join("|")})\\b`).test(resume.normalizedText)) {
    score += 1;
    bonusSignals.push("Strong action-oriented project language detected");
  }

  if (achievementSignals.length >= 3) {
    score += 2;
    bonusSignals.push("Achievement-heavy bullet evidence detected");
  }

  if (roleFamilyAlignment === "aligned") {
    score += 1;
    bonusSignals.push("Resume experience aligns closely with the detected role family");
  }

  return {
    score: Math.min(score, maxBonusScore),
    bonusSignals
  };
}

function generateSuggestions(
  resume: ParsedResumeResult,
  keywordArtifacts: KeywordArtifact[],
  score: ScoreBreakdown,
  readabilityScore: number,
  bulletQualityScore: number,
  yearsExperienceScore: number | null,
  weakBullets: Array<{ bullet: string; issues: string[] }>,
  seniorityMismatch: { hasMismatch: boolean; summary: string | null },
  semanticMatches: Array<{ keyword: string; evidence: string }>,
  roleFamilyAlignment: "aligned" | "adjacent" | "mismatch" | "unknown"
): AnalysisSuggestion[] {
  const suggestions: AnalysisSuggestion[] = [];
  const missingMustHaves = keywordArtifacts.filter((keyword) => keyword.isMustHave && keyword.matchType === "missing");
  const missingSections = [
    !resume.sections.summary ? "summary" : null,
    !resume.sections.skills ? "skills" : null,
    !resume.sections.projects ? "projects" : null
  ].filter((value): value is string => Boolean(value));

  if (missingMustHaves.length > 0) {
    suggestions.push({
      title: "Close the highest-priority skill gaps",
      description: `Add or strengthen evidence for ${missingMustHaves
        .slice(0, 4)
        .map((keyword) => keyword.keyword)
        .join(", ")} in your skills or experience sections.`,
      priority: "high",
      suggestionType: "keyword"
    });
  }

  if (semanticMatches.length > 0) {
    suggestions.push({
      title: "Turn adjacent experience into explicit skill evidence",
      description: `The resume shows nearby experience for ${semanticMatches
        .slice(0, 3)
        .map((match) => `${match.keyword} via ${match.evidence}`)
        .join(", ")}. Name those tools and technologies directly so they count more strongly.`,
      priority: "medium",
      suggestionType: "content"
    });
  }

  if (missingSections.length > 0) {
    suggestions.push({
      title: "Fill in missing resume sections",
      description: `This resume would be easier to scan with ${missingSections.join(", ")} clearly labelled.`,
      priority: "high",
      suggestionType: "section"
    });
  }

  if (bulletQualityScore <= 60) {
    suggestions.push({
      title: "Upgrade bullet quality",
      description:
        "Lead bullets with action verbs, make outcomes more specific, and add measurable impact where you can.",
      priority: "medium",
      suggestionType: "readability"
    });
  }

  if (weakBullets.length > 0) {
    suggestions.push({
      title: "Rewrite the weakest bullets first",
      description: `The weakest bullets currently read as ${weakBullets[0].issues.join(", ")}. Tightening even 2-3 of them can improve both readability and role fit.`,
      priority: "high",
      suggestionType: "content"
    });
  }

  if (readabilityScore <= 62) {
    suggestions.push({
      title: "Tighten readability",
      description:
        "Shorter sentences, cleaner spacing, and a more concise summary will make the resume easier to scan quickly.",
      priority: "medium",
      suggestionType: "readability"
    });
  }

  if (yearsExperienceScore !== null && yearsExperienceScore < 70) {
    suggestions.push({
      title: "Make experience depth easier to spot",
      description:
        "Call out timeline length, ownership, and sustained work on relevant technologies so experience signals are easier to detect.",
      priority: "medium",
      suggestionType: "content"
    });
  }

  if (score.alignment <= 6) {
    suggestions.push({
      title: "Mirror the role language more directly",
      description:
        "Reflect the job description more closely by adding role-relevant tools, responsibilities, and outcomes to recent experience bullets.",
      priority: "medium",
      suggestionType: "content"
    });
  }

  const missingSoftSkills = keywordArtifacts.filter(
    (keyword) => keyword.category === "soft_skill" && keyword.matchType === "missing"
  );

  if (missingSoftSkills.length > 0) {
    suggestions.push({
      title: "Add collaboration and stakeholder signals",
      description: `Consider reflecting examples of ${missingSoftSkills
        .slice(0, 2)
        .map((keyword) => keyword.keyword)
        .join(" and ")} through concrete project examples.`,
      priority: "low",
      suggestionType: "content"
    });
  }

  if (seniorityMismatch.hasMismatch && seniorityMismatch.summary) {
    suggestions.push({
      title: "Clarify the seniority story",
      description: seniorityMismatch.summary,
      priority: "high",
      suggestionType: "content"
    });
  }

  if (roleFamilyAlignment === "mismatch") {
    suggestions.push({
      title: "Retarget the resume toward the role family",
      description:
        "The current resume reads strongest for a different role family. Rebalance the most recent bullets and skills section around the target workflow and tooling.",
      priority: "high",
      suggestionType: "content"
    });
  }

  return suggestions.slice(0, 6);
}

export function analyzeResumeAgainstJob(resume: ParsedResumeResult, jobDescription: ProcessedJobDescription): AnalysisSummary {
  const keywordArtifacts = buildKeywordArtifacts(resume, jobDescription);
  const matchedKeywords = keywordArtifacts.filter((keyword) => keyword.matchType === "matched");
  const partialKeywords = keywordArtifacts.filter((keyword) => keyword.matchType === "partial");
  const missingKeywords = keywordArtifacts.filter((keyword) => keyword.matchType === "missing");
  const mustHaveKeywords = keywordArtifacts.filter((keyword) => keyword.isMustHave);
  const keywordCoverage = getWeightedCoverage(keywordArtifacts);
  const mustHaveCoverage = getWeightedCoverage(mustHaveKeywords);
  const sectionCompleteness = {
    summary: resume.sections.summary,
    skills: resume.sections.skills,
    experience: resume.sections.experience,
    education: resume.sections.education,
    projects: resume.sections.projects
  };
  const sectionCoverage = percentage(Object.values(sectionCompleteness).filter(Boolean).length, 5);
  const sectionCoverageAdjusted = Math.round(sectionCoverage * 0.75);
  const estimatedYearsExperience = estimateYearsExperience(resume);
  const detectedResumeSeniority = inferResumeSeniority(resume, estimatedYearsExperience);
  const seniorityMismatch = assessSeniorityMismatch(jobDescription.seniority, detectedResumeSeniority);
  const jobRoleFamily = detectRoleFamily(
    `${jobDescription.title ?? ""} ${jobDescription.normalizedText}`,
    jobDescription.extractedKeywords.map((keyword) => keyword.keyword)
  );
  const resumeRoleFamily = detectRoleFamily(
    `${resume.summary ?? ""} ${resume.normalizedText}`,
    keywordArtifacts
      .filter((keyword) => keyword.matchType !== "missing")
      .map((keyword) => keyword.keyword)
  );
  const roleFamilyAlignment = classifyRoleFamilyAlignment(jobRoleFamily, resumeRoleFamily);
  const yearsExperienceScore = calculateYearsExperienceScore(
    estimatedYearsExperience,
    jobDescription.requiredYearsExperience
  );
  const achievementSignals = detectAchievementSignals(resume);
  const weakBullets = detectWeakBullets(resume, keywordArtifacts);
  const semanticMatches = keywordArtifacts
    .filter((keyword) => keyword.matchedVia === "semantic" && keyword.semanticEvidence)
    .map((keyword) => ({
      keyword: keyword.keyword,
      evidence: keyword.semanticEvidence as string
    }));
  const roleRelevanceRaw = calculateRoleRelevance(
    resume,
    jobDescription,
    keywordArtifacts,
    yearsExperienceScore,
    jobRoleFamily,
    resumeRoleFamily,
    seniorityMismatch
  );
  const alignmentRaw = calculateAlignmentScore(
    resume,
    jobDescription,
    keywordArtifacts,
    mustHaveCoverage,
    yearsExperienceScore,
    jobRoleFamily,
    resumeRoleFamily,
    seniorityMismatch
  );
  const readabilityScore = calculateReadabilityScore(resume);
  const bulletQualityScore = calculateBulletQualityScore(resume);
  const structureQualityRaw = Math.round(resume.structureScore * 0.45 + readabilityScore * 0.2 + bulletQualityScore * 0.35);
  const bonus = calculateBonusScore(resume, achievementSignals, roleFamilyAlignment);
  const rewriteAssist = buildRewriteAssist(
    weakBullets,
    keywordArtifacts.filter((keyword) => keyword.isMustHave && keyword.matchType === "missing"),
    jobRoleFamily
  );

  const score: ScoreBreakdown = {
    keywordMatch: Math.round((keywordCoverage * scoringWeights[0].weight) / 100),
    mustHaveSkills: Math.round((mustHaveCoverage * scoringWeights[1].weight) / 100),
    sectionCompleteness: Math.round((sectionCoverageAdjusted * scoringWeights[2].weight) / 100),
    roleRelevance: Math.round((roleRelevanceRaw * scoringWeights[3].weight) / 100),
    structureQuality: Math.round((structureQualityRaw * scoringWeights[4].weight) / 100),
    alignment: Math.round((alignmentRaw * scoringWeights[5].weight) / 100),
    bonus: bonus.score,
    total: 0
  };

  score.total = Math.min(
    100,
    score.keywordMatch +
      score.mustHaveSkills +
      score.sectionCompleteness +
      score.roleRelevance +
      score.structureQuality +
      score.alignment +
      score.bonus
  );

  const explanation: ScoreExplanation = {
    keywordCoverage,
    matchedKeywordCount: matchedKeywords.length,
    partialKeywordCount: partialKeywords.length,
    totalKeywordCount: keywordArtifacts.length,
    mustHaveCoverage,
    matchedMustHaveCount: mustHaveKeywords.filter((keyword) => keyword.matchType === "matched").length,
    partialMustHaveCount: mustHaveKeywords.filter((keyword) => keyword.matchType === "partial").length,
    totalMustHaveCount: mustHaveKeywords.length,
    sectionCoverage,
    roleRelevanceRaw,
    structureQualityRaw,
    alignmentRaw,
    readabilityScore,
    bulletQualityScore,
    estimatedYearsExperience,
    requiredYearsExperience: jobDescription.requiredYearsExperience,
    yearsExperienceScore,
    bonusSignals: bonus.bonusSignals,
    canonicalMatchedKeywords: uniqueLabels(matchedKeywords),
    canonicalPartialKeywords: uniqueLabels(partialKeywords),
    canonicalMissingKeywords: uniqueLabels(missingKeywords),
    filteredOutPhrases: jobDescription.filteredOutPhrases,
    roleFamily: jobRoleFamily,
    resumeRoleFamily,
    roleFamilyAlignment,
    detectedResumeSeniority,
    seniorityMismatch,
    semanticMatches,
    achievementSignals,
    weakBullets,
    rewriteAssist
  };

  return {
    score,
    explanation,
    matchedKeywords,
    partialKeywords,
    missingKeywords,
    sectionCompleteness,
    suggestions: generateSuggestions(
      resume,
      keywordArtifacts,
      score,
      readabilityScore,
      bulletQualityScore,
      yearsExperienceScore,
      weakBullets,
      seniorityMismatch,
      semanticMatches,
      roleFamilyAlignment
    )
  };
}
