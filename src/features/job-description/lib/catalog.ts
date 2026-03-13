import type { KeywordCategory } from "@/features/analysis/lib/types";

interface CatalogEntry {
  phrase: string;
  category: KeywordCategory;
  aliases?: string[];
}

export const keywordCatalog: CatalogEntry[] = [
  { phrase: "react", category: "technical_skill" },
  { phrase: "next.js", category: "technical_skill", aliases: ["nextjs"] },
  { phrase: "node.js", category: "technical_skill", aliases: ["node", "nodejs"] },
  { phrase: "typescript", category: "technical_skill" },
  { phrase: "javascript", category: "technical_skill" },
  { phrase: "python", category: "technical_skill" },
  { phrase: "java", category: "technical_skill" },
  { phrase: "go", category: "technical_skill", aliases: ["golang"] },
  { phrase: "sql", category: "technical_skill" },
  { phrase: "postgresql", category: "technical_skill", aliases: ["postgres"] },
  { phrase: "mysql", category: "technical_skill" },
  { phrase: "mongodb", category: "technical_skill" },
  { phrase: "redis", category: "technical_skill" },
  { phrase: "graphql", category: "technical_skill" },
  { phrase: "rest api", category: "technical_skill", aliases: ["rest apis", "apis", "api design"] },
  { phrase: "microservices", category: "technical_skill" },
  { phrase: "system design", category: "technical_skill" },
  { phrase: "docker", category: "tool" },
  { phrase: "kubernetes", category: "tool" },
  { phrase: "aws", category: "tool", aliases: ["amazon web services"] },
  { phrase: "azure", category: "tool" },
  { phrase: "gcp", category: "tool", aliases: ["google cloud"] },
  { phrase: "tailwind css", category: "tool", aliases: ["tailwind"] },
  { phrase: "prisma", category: "tool" },
  { phrase: "figma", category: "tool" },
  { phrase: "jira", category: "tool" },
  { phrase: "github actions", category: "tool" },
  { phrase: "playwright", category: "tool" },
  { phrase: "jest", category: "tool" },
  { phrase: "cypress", category: "tool" },
  { phrase: "communication", category: "soft_skill", aliases: ["communication skills"] },
  { phrase: "collaboration", category: "soft_skill", aliases: ["cross-functional collaboration"] },
  { phrase: "leadership", category: "soft_skill" },
  { phrase: "ownership", category: "soft_skill" },
  { phrase: "mentoring", category: "soft_skill" },
  { phrase: "stakeholder management", category: "soft_skill" },
  { phrase: "problem solving", category: "soft_skill" },
  { phrase: "teamwork", category: "soft_skill" },
  { phrase: "bachelor's degree", category: "qualification", aliases: ["bachelors degree", "bs degree"] },
  { phrase: "master's degree", category: "qualification", aliases: ["masters degree", "ms degree"] },
  { phrase: "computer science", category: "qualification" },
  { phrase: "equivalent experience", category: "qualification" },
  { phrase: "saas", category: "domain" },
  { phrase: "b2b", category: "domain" },
  { phrase: "analytics", category: "domain" },
  { phrase: "experimentation", category: "domain", aliases: ["a/b testing", "ab testing"] },
  { phrase: "product engineering", category: "domain" },
  { phrase: "machine learning", category: "domain" },
  { phrase: "artificial intelligence", category: "domain", aliases: ["ai"] },
  { phrase: "fintech", category: "domain" },
  { phrase: "healthcare", category: "domain" },
  { phrase: "ecommerce", category: "domain" }
];

export const roleTitlePatterns = [
  "frontend engineer",
  "backend engineer",
  "full stack engineer",
  "software engineer",
  "product engineer",
  "product designer",
  "data engineer",
  "machine learning engineer",
  "engineering manager"
] as const;

export const seniorityPatterns = [
  "intern",
  "junior",
  "mid-level",
  "mid level",
  "senior",
  "staff",
  "lead",
  "principal",
  "manager"
] as const;
