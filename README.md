# ATS Resume Analyzer

ATS Resume Analyzer is a production-style portfolio project that compares resumes against job descriptions using deterministic parsing, rule-based NLP, and explainable scoring. The goal is to deliver a polished SaaS experience without paid AI APIs or black-box scoring.

## Stack

- Next.js App Router
- TypeScript
- Tailwind CSS
- Prisma ORM
- SQLite for local development
- Planned: React Hook Form, Zod, pdf-parse, mammoth, compromise, natural, Recharts

## Current status

Implemented so far:

- project scaffold
- visual design system
- product architecture blueprint
- Prisma schema
- analysis domain types and initial scoring service
- landing page shell and app routes
- drag-and-drop upload form with React Hook Form + Zod
- server-side upload endpoint and local file persistence
- analysis session creation flow with upload metadata storage
- analysis detail route for persisted session intake review
- PDF and DOCX parsing pipeline with normalized text extraction
- section detection, extracted summary heuristics, and structure scoring
- job description keyword extraction with must-have vs nice-to-have detection
- role title, seniority, and categorized keyword insights persisted for later scoring

## Getting started

1. Install dependencies.
2. Copy `.env.example` to `.env`.
3. Run `npm run prisma:generate`.
4. Run your preferred Prisma database setup command locally.
5. Run `npm run dev`.

## Project docs

- [Product blueprint](./docs/product-blueprint.md)

## Repository assets

- GitHub repo description: `ATS Resume Analyzer: a deterministic, full-stack SaaS app for resume-to-job scoring with explainable insights.`
- One-line pitch: `A premium full-stack web app that scores resumes against job descriptions using transparent, rule-based NLP and ATS-style analysis.`
