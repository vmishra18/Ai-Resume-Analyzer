# Interview Notes

## Repo assets

- GitHub repo description: `ATS Resume Analyzer: a deterministic, full-stack SaaS app for resume-to-job scoring with explainable insights.`
- One-line project pitch: `A premium full-stack web app that scores resumes against job descriptions using transparent, rule-based NLP and ATS-style analysis.`
- Resume bullet: `Built a production-style ATS Resume Analyzer with Next.js, Prisma, SQLite, and deterministic NLP scoring, including PDF/DOCX parsing, explainable keyword analysis, and a polished SaaS dashboard.`

## How to explain the project

Start with the user problem:

- Most resume analyzers either hide their scoring logic or rely on paid AI APIs.
- I wanted a tool that felt product-grade while staying fully explainable and cost-free.

Explain the architecture in one pass:

1. The frontend handles upload UX, dashboard rendering, history views, and polished state management.
2. The backend validates files, extracts text, processes job descriptions, and runs a deterministic scoring engine.
3. Prisma persists every artifact so results can be revisited, compared, and eventually exported or shared.

## Why the scoring model is strong

- It is deterministic, so every score is traceable to concrete rules.
- It is more honest than pretending there is ML when there is not.
- It is easy to debug, test, and discuss in interviews.
- It balances keyword coverage with section completeness and structural quality, which helps avoid naive keyword stuffing.

## Good talking points

- I separated parsing, NLP, scoring, and suggestions so each service has one responsibility.
- I chose SQLite first for local simplicity, but the schema is ready to move to PostgreSQL for deployment.
- I designed the UI to look like a startup product because visual quality changes how recruiters perceive engineering projects.
- I made the project explainable enough that a recruiter or hiring manager could understand why a resume scored the way it did.

## Demo flow

1. Show the landing page and explain the value proposition.
2. Walk through the upload route and describe validation and parsing.
3. Open the results dashboard and explain score weights, matched keywords, missing terms, and suggestions.
4. Show history and discuss how persistence enables trend analysis and resume comparison.
5. Close by emphasizing that the entire pipeline runs on free and open-source tooling.
