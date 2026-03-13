export const implementationPhases = [
  {
    name: "Phase 1",
    goal: "Project setup and base architecture",
    files: ["package.json", "src/app", "src/lib", "prisma/schema.prisma", "docs/product-blueprint.md"],
    outcome:
      "Create the Next.js foundation, shared design tokens, Prisma schema, and architecture documentation so every later phase has stable boundaries."
  },
  {
    name: "Phase 2",
    goal: "UI shell and landing page",
    files: ["src/components/layout", "src/components/marketing", "src/app/page.tsx"],
    outcome:
      "Build a premium landing page, navigation, page layout, and branded visual system that gives the app a SaaS feel."
  },
  {
    name: "Phase 3",
    goal: "Upload flow and validation",
    files: ["src/app/upload/page.tsx", "src/features/upload", "src/app/api/uploads"],
    outcome:
      "Implement validated file upload UX with clear error states, accepted file restrictions, and server-side file handling."
  },
  {
    name: "Phase 4",
    goal: "Resume parsing for PDF and DOCX",
    files: ["src/features/resume-parser", "src/app/api/analyze"],
    outcome:
      "Extract raw text from documents, normalize the output, and persist parsed resume data for later analysis."
  },
  {
    name: "Phase 5",
    goal: "Job description processing and keyword extraction",
    files: ["src/features/job-description", "src/features/nlp"],
    outcome:
      "Tokenize the job description, detect skill phrases, categorize keywords, and separate must-have vs nice-to-have terms."
  },
  {
    name: "Phase 6",
    goal: "ATS scoring engine",
    files: ["src/features/analysis/server", "src/features/analysis/lib"],
    outcome:
      "Compute the weighted ATS score, section completeness, structural quality, and rule-based suggestions."
  },
  {
    name: "Phase 7",
    goal: "Results dashboard",
    files: ["src/app/analyses/[id]/page.tsx", "src/features/analysis/components"],
    outcome:
      "Render score cards, keyword comparisons, charts, sections, and improvement suggestions in a polished dashboard."
  },
  {
    name: "Phase 8",
    goal: "Persistence and analysis history",
    files: ["src/app/analyses/page.tsx", "src/features/history"],
    outcome:
      "Store completed sessions and let users revisit, compare, and trend historical analyses."
  },
  {
    name: "Phase 9",
    goal: "Refinements, edge cases, and polish",
    files: ["src/components/ui", "src/features/analysis", "src/features/upload"],
    outcome:
      "Add dark mode, report export, shareable results, better empty states, and more resilient parsing/error handling."
  },
  {
    name: "Phase 10",
    goal: "README and interview presentation notes",
    files: ["README.md", "docs/interview-notes.md"],
    outcome:
      "Document the architecture, scoring logic, setup flow, and interview narrative so the project is presentation-ready."
  }
] as const;
