# Resume Signal

Resume Signal helps you compare a resume against a job description and improve the next version before you apply.

It parses PDF and DOCX resumes, extracts job requirements, highlights missing skills, and saves each analysis so you can revisit earlier versions without losing track of what changed.

## What it does

- upload a resume in PDF or DOCX format
- paste a target job description
- review a match score, missing skills, and section coverage
- get practical suggestions for what to improve next
- save your history and compare resume versions side by side

## Stack

- Next.js App Router
- TypeScript
- Tailwind CSS
- React Hook Form + Zod
- Prisma ORM
- SQLite for local development
- `pdf-parse`
- `mammoth`
- `compromise`
- `recharts`

## Local setup

Copy the env file:

```bash
cp .env.example .env
```

Install dependencies and start the app:

```bash
npm install
npm run prisma:generate
npm run db:push
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

## Project structure

```text
src/
  app/                      Routes and API handlers
  components/               Shared UI, layout, and landing-page components
  features/
    analysis/               Scoring, dashboard mapping, and reports
    auth/                   Account flows and session handling
    history/                Saved analysis views and comparison helpers
    job-description/        Job description parsing and keyword extraction
    nlp/                    Text normalization helpers
    resume-parser/          PDF/DOCX parsing and section detection
    upload/                 Upload form, validation, and intake flow
  lib/                      Shared utilities, Prisma client, and config
prisma/
  schema.prisma             Database models
docs/
  product-blueprint.md      Product and implementation notes
```

## Notes

- the scoring is deterministic and explainable
- the app uses only free and open-source tooling
- uploads are stored locally during development
