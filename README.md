# ATS Resume Analyzer

ATS Resume Analyzer is a production-style SaaS portfolio project that compares a resume against a job description using deterministic parsing, rule-based NLP, and transparent ATS-style scoring. It is built entirely with free and open-source tools, with no paid AI APIs and no fake black-box claims.

## One-line pitch

`A premium full-stack web app that scores resumes against job descriptions using transparent, rule-based NLP and ATS-style analysis.`

## Why this project stands out

- It demonstrates full-stack product engineering, not just one algorithm.
- It handles real document ingestion with PDF and DOCX parsing.
- It separates parsing, NLP, scoring, and persistence into clean service boundaries.
- It presents results through a polished startup-style dashboard and history workflow.
- It is honest and explainable: every score is deterministic and inspectable.

## Core features

- Upload resume files in PDF or DOCX format
- Extract and normalize resume text
- Paste a target job description
- Detect categorized JD keywords and must-have signals
- Compare resume content against extracted phrases and terms
- Calculate a deterministic ATS-style score
- Show matched, partial, and missing keywords
- Detect resume section completeness
- Generate rule-based improvement suggestions
- Save and revisit analysis history
- Download a report
- Open a shareable read-only results page

## Tech stack

- Next.js App Router
- TypeScript
- Tailwind CSS
- Local shadcn-style UI primitives
- React Hook Form + Zod
- Prisma ORM
- SQLite for local development
- `pdf-parse` for PDF extraction
- `mammoth` for DOCX extraction
- `compromise` and `natural` tokenization utilities for deterministic NLP helpers
- `recharts` for dashboard charts

## Product walkthrough

### 1. Upload flow

Users upload a resume, optionally paste a job description, and create an analysis session. The server validates the file, stores metadata, saves the document locally, and kicks off parsing immediately.

### 2. Parsing and NLP

- PDF resumes are parsed with `pdf-parse`
- DOCX resumes are parsed with `mammoth`
- resume text is normalized and section heuristics are detected
- the job description is tokenized, phrase-matched, categorized, and split into must-have vs nice-to-have keyword groups

### 3. Scoring engine

The ATS score is weighted across:

- keyword match percentage
- must-have skill coverage
- section completeness
- role relevance
- resume structure quality
- job description alignment
- bonus points for strong project or impact signals

### 4. Result surfaces

- polished analysis dashboard
- keyword match groups
- suggestion panel
- history page with trend framing
- shareable results view
- downloadable markdown report

## Architecture

### Frontend

- marketing landing page
- upload workflow and validation UI
- results dashboard
- saved analysis history
- shareable read-only route

### Backend

- multipart file handling
- local file persistence
- PDF/DOCX text extraction
- deterministic NLP processing
- ATS scoring and suggestion generation
- report generation endpoint

### Persistence

Prisma stores:

- analysis sessions
- uploaded file metadata
- parsed resume text
- job descriptions
- keyword match results
- scoring summaries
- suggestions

## Project structure

```text
src/
  app/                      App Router pages and API routes
  components/               Shared UI, layout, and marketing components
  features/
    analysis/               Dashboard UI, scoring logic, shared analysis mappers
    history/                History page components and summary helpers
    job-description/        JD extraction and categorization
    nlp/                    Tokenization and normalization helpers
    resume-parser/          PDF/DOCX parsing and section detection
    upload/                 Upload form, schemas, and intake service
  lib/                      Shared db client, env helpers, utilities
prisma/
  schema.prisma             Database models
docs/
  product-blueprint.md      Product and architecture blueprint
  interview-notes.md        Interview narrative and demo notes
  showcase-guide.md         Screenshot checklist and GitHub presentation guide
```

## Local setup

### Prerequisites

- Node.js 20+
- npm 10+

### Environment variables

Copy `.env.example` to `.env`.

```bash
cp .env.example .env
```

Default local values:

```env
DATABASE_URL="file:./dev.db"
UPLOAD_DIR="uploads"
```

### Install and run

```bash
npm install
npm run prisma:generate
npm run dev
```

Open `http://localhost:3000`.

## Useful commands

```bash
npm run dev
npm run lint
npm run build
npm run prisma:generate
npm run db:push
```

## Current implementation status

Implemented:

- landing page and SaaS-style shell
- upload form and validation
- resume parsing pipeline
- job description processing
- deterministic ATS scoring engine
- polished analysis dashboard
- saved analysis history
- report exports
- shareable result pages

Not implemented yet:

- auth or multi-user accounts
- cloud object storage
- PostgreSQL deployment config
- dark mode toggle
- side-by-side multi-resume comparison

## Interview talking points

- I intentionally chose deterministic scoring over paid or opaque AI APIs so the product stays explainable and cost-free.
- I split the system into upload, parsing, NLP, scoring, history, and reporting layers to keep the code interview-friendly and maintainable.
- I used Prisma to persist every analysis artifact so the product could support history, reports, and future comparisons without reworking the schema.
- I treated the UI like a real SaaS product, because design quality changes how engineering work is perceived.

## Resume and GitHub assets

- GitHub repo description: `ATS Resume Analyzer: a deterministic, full-stack SaaS app for resume-to-job scoring with explainable insights.`
- Resume bullet: `Built a production-style ATS Resume Analyzer with Next.js, Prisma, SQLite, and deterministic NLP scoring, including PDF/DOCX parsing, explainable keyword analysis, and a polished SaaS dashboard.`

## Docs

- [Product blueprint](./docs/product-blueprint.md)
- [Interview notes](./docs/interview-notes.md)
- [Showcase guide](./docs/showcase-guide.md)
