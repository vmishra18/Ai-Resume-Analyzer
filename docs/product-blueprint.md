# ATS Resume Analyzer Blueprint

## 1. Product overview

ATS Resume Analyzer is a production-style web application that compares a candidate's resume against a job description using deterministic parsing, keyword extraction, and rule-based scoring. Users upload a PDF or DOCX resume, optionally paste a job description, and receive a premium dashboard showing ATS-style score, matched and missing keywords, section completeness, and practical improvement suggestions.

## 2. Who it is for

- Job seekers who want clearer resume feedback before applying.
- Career changers adapting resumes to a new role or industry.
- Students creating more targeted internship applications.
- Recruiters or coaches who want a fast, explainable review workflow.

## 3. Real-world use cases

- Tailoring one resume against several product engineering job descriptions.
- Comparing multiple resume versions to see which aligns best with a target role.
- Identifying missing must-have tools such as SQL, Docker, AWS, or Figma.
- Auditing whether a resume is missing key sections like summary or projects.
- Tracking whether resume revisions improve job-fit over time.

## 4. Why it is a strong product build

- Demonstrates full-stack architecture, file upload, persistence, and data modeling.
- Shows product judgment through polished UX and explainable scoring.
- Proves the ability to build useful features without paid AI services.
- Shows how deterministic systems can still feel polished and useful.
- Combines backend rigor and frontend polish in one product.

## 5. How to explain the product

- Lead with the problem: resumes are often opaque to ATS systems and most tools hide scoring logic.
- Emphasize your design decision: deterministic and explainable scoring over black-box AI claims.
- Walk through the pipeline: upload -> parse -> normalize -> extract keywords -> score -> persist -> visualize.
- Highlight engineering boundaries: parsing services, scoring engine, suggestions engine, Prisma models, and UI components.
- Discuss tradeoffs honestly: rules are interpretable and cheap, but less adaptive than ML. That tradeoff is intentional for transparency and control.

## 6. Final recommended stack

- Next.js App Router for product-grade full-stack structure and server-side capabilities.
- TypeScript with strict mode for maintainability and safer refactoring.
- Tailwind CSS for a polished UI system and fast iteration.
- shadcn/ui patterns with local components for accessible building blocks.
- React Hook Form + Zod for ergonomic form state and shared validation.
- Prisma ORM for clean database access and maintainable schema design.
- SQLite for local development, with a clean path to PostgreSQL later.
- `pdf-parse` for PDF extraction.
- `mammoth` for DOCX extraction.
- `compromise` plus `natural` for deterministic NLP helpers, phrase handling, and token-level utilities.
- `recharts` for score visualization.
- `zustand` only if cross-page client state becomes necessary; otherwise server-first state.

## 7. Detailed feature breakdown

### MVP features

- Upload resume in PDF or DOCX format.
- Extract raw text and normalize content.
- Paste a target job description.
- Extract important keywords, phrases, and must-have skills from the job description.
- Compare the resume against these keywords.
- Detect missing skills and missing keywords.
- Calculate a transparent ATS-style score.
- Detect key sections: summary, skills, experience, education, projects.
- Generate rule-based suggestions.
- Display results in a polished dashboard.

### Advanced features

- Save previous analyses.
- Compare multiple resumes against the same job description.
- Download a printable analysis report.
- Highlight strongest and weakest sections.
- Show keyword density and repeated term coverage.
- Add readability hints.
- Visualize job-fit trend over time.
- Support dark mode.
- Provide a shareable results page.

## 8. System architecture

### Frontend responsibilities

- Landing page, upload flow, result dashboard, history page, empty/error states.
- Controlled forms and validation messaging.
- Rendering charts, cards, keyword chips, section health panels, and suggestions.
- Triggering server actions or API routes and presenting processing/loading states.

### Backend responsibilities

- File validation and storage metadata creation.
- Resume text extraction for PDF and DOCX.
- Job description processing and keyword categorization.
- Deterministic ATS scoring and suggestion generation.
- Persistence of sessions, parsed content, keywords, scores, and suggestions.

### Text extraction pipeline

1. Validate file type, size, and extension.
2. Persist file metadata.
3. Route PDF files through `pdf-parse`.
4. Route DOCX files through `mammoth`.
5. Normalize output whitespace and headings.
6. Save raw and normalized text for downstream analysis.

### NLP analysis pipeline

1. Lowercase and normalize punctuation.
2. Tokenize text into words and candidate phrases.
3. Remove stop words only for keyword extraction, not for display.
4. Detect noun phrases and multi-word skill phrases.
5. Categorize terms into technical skills, tools, soft skills, qualifications, and domain terms.
6. Compare JD keyword inventory with resume tokens and phrases.
7. Mark matched, partial, and missing signals.
8. Feed artifacts into the scoring and suggestion engines.

### Scoring engine

- `keywordMatchPercentage` uses the ratio of matched JD keywords to total extracted keywords.
- `mustHaveSkillCoverage` focuses on required skills, tools, and qualifications.
- `sectionCompleteness` checks for summary, skills, experience, education, and projects.
- `roleRelevance` compares title and domain wording between the resume and JD.
- `resumeStructureQuality` evaluates whether the resume appears complete and readable.
- `jobDescriptionAlignment` checks whether responsibilities and phrasing are reflected in the resume.
- `bonusPoints` reward strong projects, measurable outcomes, and technical depth.

### Persistence layer

- Prisma models store the analysis session and related artifacts.
- Each analysis keeps file metadata, parsed text, keyword results, scoring summary, and suggestions.
- SQLite supports local development; PostgreSQL can replace the datasource for deployment.

### Validation and error handling

- Zod schemas validate form inputs and route payloads.
- Server-side file checks enforce allowed MIME types and size limits.
- Parser failures should set analysis status to `FAILED` and store actionable error messages.
- UI shows dedicated empty states, file format errors, and processing feedback.

### Request/response flow

1. User submits resume file and job description.
2. Backend validates input and stores upload metadata.
3. Parsing service extracts resume text.
4. JD processor extracts and categorizes keywords.
5. Scoring engine computes weighted scores and suggestion artifacts.
6. Persistence layer stores the session and related records.
7. Frontend receives the session id and navigates to the results dashboard.

## 9. ATS scoring design

| Category | Weight | Purpose |
| --- | ---: | --- |
| Keyword match percentage | 30 | Measures overall overlap with target keywords and phrases |
| Must-have skill coverage | 25 | Prioritizes required technical skills, tools, and qualifications |
| Section completeness | 15 | Rewards the presence of expected resume sections |
| Role relevance | 10 | Checks title and domain alignment |
| Resume structure quality | 10 | Penalizes thin or poorly structured resumes |
| Job description alignment | 10 | Looks for responsibility and mission overlap |
| Bonus points | 0-5 | Rewards strong technical projects or quantified achievements |

The score is deterministic and traceable. Every category can be shown in the UI with a plain-English explanation.

## 10. Database schema design

### `AnalysisSession`

Root entity for a single resume-vs-job analysis. Stores status, title, overall score, and timestamps.

### `UploadedFile`

Stores file metadata such as original filename, MIME type, size, extension, and storage path.

### `ParsedResume`

Stores raw and normalized resume text, extracted summary, section booleans, and structure score.

### `JobDescription`

Stores raw and normalized JD text plus extracted keywords, must-have keywords, and optional role metadata.

### `KeywordResult`

Stores each keyword artifact, its category, whether it matched, and occurrence counts.

### `ScoringSummary`

Stores weighted category scores plus a JSON explanation payload for transparent rendering.

### `Suggestion`

Stores prioritized improvement suggestions linked to the session.

## 11. Folder structure

```text
src/
  app/                     App Router routes, layout, pages, and route handlers
  components/
    layout/                Header, footer, page chrome, shell primitives
    marketing/             Landing page sections and branded marketing UI
    ui/                    Reusable local UI primitives inspired by shadcn/ui
  features/
    analysis/
      components/          Dashboard cards, charts, keyword lists, suggestion panels
      lib/                 Domain types, constants, scoring weights, response models
      server/              Scoring engine and suggestion orchestration
    history/               Saved analysis list and trend views
    job-description/       JD normalization, phrase extraction, keyword categorization
    nlp/                   Tokenization, stop words, phrase utilities
    resume-parser/         PDF/DOCX parsing and section detection
    upload/                Upload forms, schemas, server actions
  lib/                     Shared utilities, db client, env parsing, app config
  styles/                  Optional future chart or utility styles
prisma/
  schema.prisma            Database models and enums
docs/
  product-blueprint.md     Product definition, architecture, and scoring narrative
public/                    Static assets
```

## 12. Phased implementation roadmap

### Phase 1: project setup and base architecture

- Goal: establish the codebase foundation, schema, design system, and architecture docs.
- Files: config files, `src/app`, `src/lib`, `prisma/schema.prisma`, `docs/product-blueprint.md`.
- Why now: every later phase depends on stable tooling and clear domain boundaries.
- Exact tasks: initialize Next.js structure, Tailwind styling, Prisma schema, shared utilities, and first marketing shell.
- Completion outcome: project runs locally and already communicates product direction.

### Phase 2: UI shell and landing page

- Goal: make the project visually impressive early.
- Files: layout, marketing sections, visual tokens, CTA pages.
- Why now: it creates motivation and gives the product a strong first impression.
- Exact tasks: build navigation, hero, architecture section, scoring section, and roadmap.
- Completion outcome: polished SaaS-style homepage.

### Phase 3: upload flow and validation

- Goal: accept resumes safely and clearly.
- Files: upload form, shared validation schemas, route handlers.
- Why now: file ingestion is the real product entry point.
- Exact tasks: add drag/drop upload, MIME validation, size limits, and server submission.
- Completion outcome: reliable resume upload flow.

### Phase 4: resume parsing for PDF and DOCX

- Goal: convert uploaded documents into normalized text.
- Files: parser services and persistence wiring.
- Why now: scoring depends on extracted content.
- Exact tasks: wire `pdf-parse`, `mammoth`, normalization helpers, and error handling.
- Completion outcome: parsed resume content is stored and ready for analysis.

### Phase 5: job description processing and keyword extraction

- Goal: derive a useful target keyword set from the JD.
- Files: JD processing and NLP utilities.
- Why now: resume comparison is only meaningful with a robust target inventory.
- Exact tasks: tokenize text, detect phrases, categorize skills, and separate must-haves.
- Completion outcome: structured JD keywords with explainable categories.

### Phase 6: ATS scoring engine

- Goal: compute deterministic, explainable scores.
- Files: scoring service, suggestion engine, response mappers.
- Why now: this is the product's core differentiator.
- Exact tasks: implement weighting, missing-term logic, section rules, and transparent explanations.
- Completion outcome: stable analysis summary model.

### Phase 7: results dashboard

- Goal: turn raw scoring into a polished product experience.
- Files: dashboard UI components, charts, keyword sections, breakdown cards.
- Why now: the results page is the product centerpiece.
- Exact tasks: build score card, charts, suggestions panel, section completeness, and insights cards.
- Completion outcome: a strong and understandable analysis flow.

### Phase 8: persistence and analysis history

- Goal: make the app feel like a real SaaS product.
- Files: history page, query services, comparison views.
- Why now: stored sessions unlock retention and trend storytelling.
- Exact tasks: list analyses, create detail routes, compare historical scores.
- Completion outcome: durable analysis timeline.

### Phase 9: refinements, edge cases, and polish

- Goal: raise quality and resilience.
- Files: cross-cutting improvements across features.
- Why now: polish is most effective after the core workflow exists.
- Exact tasks: export report, share page, dark mode, readability checks, parser edge cases, and empty states.
- Completion outcome: credible product polish.

### Phase 10: README and product notes

- Goal: make the project easy to run and understand.
- Files: `README.md`, setup docs.
- Why now: the implementation needs to exist before the narrative is finalized.
- Exact tasks: write architecture summary, setup guide, scoring explanation, screenshots checklist, and demo script.
- Completion outcome: well-documented repository.

## 13. Product summary

- Product description: `Resume Signal compares resumes against job descriptions and highlights the clearest next improvements before you apply.`
- Core principle: deterministic scoring keeps the product understandable and cost-free.
- System design: extraction, NLP, scoring, and persistence are separated so each layer can evolve independently.
- Data model: Prisma models preserve every analysis artifact for history, comparison, and reporting features.
