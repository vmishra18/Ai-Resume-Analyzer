# Resume Signal

Resume Signal is a resume review workspace for job seekers who want a clearer read on how a resume lines up with a specific role.

The app accepts PDF and DOCX resumes, parses the document into structured sections, compares it against a job description, and saves each report so you can revisit earlier drafts and compare versions side by side.

## What you can do

- Upload a resume in PDF or DOCX format
- Paste a target job description for role-specific feedback
- Review score breakdowns, missing skills, and section coverage
- Get practical suggestions for stronger bullets and clearer positioning
- Keep a private history of past analyses and compare saved drafts

## Stack

- Next.js App Router
- TypeScript
- Tailwind CSS
- React Hook Form and Zod
- Prisma ORM
- SQLite for local development
- `pdf-parse`
- `mammoth`
- `compromise`
- `natural`
- `recharts`

## Local setup

```bash
cp .env.example .env
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
npm run test
npm run build
npm run prisma:generate
npm run db:push
```

## Project structure

```text
src/
  app/                      Routes and API handlers
  components/               Shared UI, layout, and marketing components
  features/
    analysis/               Scoring, dashboard mapping, and reports
    auth/                   Account flows and session handling
    history/                Saved analysis views and comparison helpers
    job-description/        Job description parsing and keyword extraction
    nlp/                    Text normalization helpers
    resume-parser/          PDF and DOCX parsing plus section detection
    upload/                 Upload form, validation, and intake flow
  lib/                      Shared utilities, Prisma client, and site config
prisma/
  schema.prisma             Database models
docs/
  product-blueprint.md      Product and architecture notes
tests/
  *.test.cjs                Targeted parser and scoring tests
```

## Notes

- Scoring is rule-based and designed to be easy to explain
- Uploads are stored locally in development
- The current setup is optimized for local use and straightforward deployment
