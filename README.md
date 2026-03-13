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

Phase 1 foundation is in place:

- project scaffold
- visual design system
- product architecture blueprint
- Prisma schema
- analysis domain types and initial scoring service
- landing page shell and app routes

## Getting started

1. Install dependencies.
2. Copy `.env.example` to `.env`.
3. Run `npm run prisma:generate`.
4. Run `npm run dev`.

## Project docs

- [Product blueprint](./docs/product-blueprint.md)

## Repository assets

- GitHub repo description: `ATS Resume Analyzer: a deterministic, full-stack SaaS app for resume-to-job scoring with explainable insights.`
- One-line pitch: `A premium full-stack web app that scores resumes against job descriptions using transparent, rule-based NLP and ATS-style analysis.`
