# Interview Notes

## Short intro

ATS Resume Analyzer is a production-style web app that evaluates a resume against a job description using deterministic parsing and rule-based scoring. I built it to look and feel like a real SaaS product while staying fully explainable and free of paid AI APIs.

## Repo assets

- GitHub repo description: `ATS Resume Analyzer: a deterministic, full-stack SaaS app for resume-to-job scoring with explainable insights.`
- One-line project pitch: `A premium full-stack web app that scores resumes against job descriptions using transparent, rule-based NLP and ATS-style analysis.`
- Resume bullet: `Built a production-style ATS Resume Analyzer with Next.js, Prisma, SQLite, and deterministic NLP scoring, including PDF/DOCX parsing, explainable keyword analysis, and a polished SaaS dashboard.`

## 30-second explanation

- Users upload a PDF or DOCX resume and optionally provide a job description.
- The backend extracts and normalizes text, processes the job description into structured keywords, and compares the two with deterministic rules.
- The app persists every artifact and returns a polished dashboard with ATS score, keyword gaps, section completeness, suggestions, history, and reports.

## Architecture summary

1. Frontend:
   landing page, upload flow, dashboard, history page, shareable results
2. Backend:
   file validation, text extraction, JD processing, scoring, suggestion generation, report export
3. Persistence:
   Prisma models for sessions, parsed resumes, job descriptions, keyword results, scores, and suggestions

## Why deterministic scoring

- It is honest and explainable.
- It avoids API costs and external dependencies.
- It is easy to debug and defend in interviews.
- It is better for a portfolio project where system design clarity matters more than pretending to have ML.

## Strong engineering decisions to highlight

- I separated parsing, NLP, scoring, and presentation into different modules so business logic is not trapped in UI files.
- I persisted intermediate artifacts, not just the final score, so features like history, share pages, and downloadable reports were easy to add later.
- I designed the scoring engine to penalize missing sections and weak alignment, which keeps it from rewarding naive keyword stuffing.
- I built the UI to feel like a startup product, because polish matters when recruiters review portfolio work.

## Demo flow

1. Start on the landing page.
   Explain the value proposition and the “no black-box AI” positioning.
2. Open the upload flow.
   Show file validation, accepted formats, and optional job description input.
3. Open a completed analysis dashboard.
   Walk through the ATS score, score breakdown, matched vs missing keywords, and suggestions.
4. Show the history page.
   Explain how stored sessions make the product feel like a real SaaS workflow.
5. Open the shareable view and report export.
   Emphasize polish and product completeness.

## Questions you may get

### Why not use OpenAI or another LLM?

I wanted the system to stay free, reproducible, and explainable. For this use case, deterministic scoring was a stronger product and interview choice than adding an opaque paid dependency.

### How would you improve accuracy later?

- expand the keyword catalog
- add better phrase dictionaries by domain
- improve synonym handling
- add optional semantic matching as a secondary assistive layer, while keeping the rule-based score visible and primary

### How would you scale this in production?

- move SQLite to PostgreSQL
- store uploads in object storage
- move parsing/scoring to background jobs
- add auth and per-user session isolation
- add caching for heavy report and trend views

### What was the hardest part?

Keeping the product honest while still making it feel impressive. That meant investing in architecture, UX, and explainability instead of hiding behind vague “AI” claims.
