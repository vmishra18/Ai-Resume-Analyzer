# Resume Signal Product Notes

## Overview

Resume Signal compares a resume against a job description and turns the result into a saved report. The goal is simple: help someone understand whether their current draft is ready to send and what should change before they apply.

The app focuses on explainable scoring. Instead of hiding the result behind a single opaque grade, it breaks the report into keyword coverage, must-have skills, section completeness, role alignment, readability, and concrete revision ideas.

## Who it helps

- Job seekers tailoring one resume for multiple roles
- Career changers translating past work into a new domain
- Students or early-career candidates tightening internship applications
- Recruiters, coaches, or mentors reviewing drafts with someone else

## Core workflow

1. Upload a PDF or DOCX resume.
2. Parse the file into raw text, normalized text, and section signals.
3. Paste a target job description.
4. Extract keywords, required skills, seniority cues, and role-family hints.
5. Score the resume against those signals.
6. Save the report so it can be reopened or compared later.

## Scoring model

| Category | Weight | What it captures |
| --- | ---: | --- |
| Keyword match percentage | 30 | Overall overlap with role-specific keywords and phrases |
| Must-have skill coverage | 25 | Coverage of required tools, skills, and qualifications |
| Section completeness | 15 | Presence of summary, skills, experience, education, and projects |
| Role relevance | 10 | Title and domain alignment between the resume and the target role |
| Resume structure quality | 10 | Signs that the resume is organized and easy to scan |
| Job description alignment | 10 | Whether the resume reflects the responsibilities and language of the role |
| Bonus points | 0-5 | Extra credit for measurable impact and strong project evidence |

## Architecture snapshot

### Frontend

- Landing page, auth flow, upload flow, report pages, history, and comparison views
- Form validation and upload feedback
- Dashboard cards, charts, keyword groups, and rewrite helpers

### Backend

- File validation and storage
- PDF and DOCX text extraction
- Job description normalization and keyword categorization
- Resume scoring, suggestions, and rewrite assists
- Prisma-backed persistence for sessions and report artifacts

## Important domain pieces

### Resume parsing

- Extracts text from PDF and DOCX uploads
- Normalizes whitespace and headings
- Detects major resume sections
- Estimates structure quality from section presence and document shape

### Job description processing

- Cleans pasted role descriptions
- Pulls out candidate keywords and phrases
- Separates must-have signals from supporting terms
- Infers role family and seniority where possible

### Analysis engine

- Matches exact keywords, partial matches, and semantic neighbors
- Scores role alignment and document quality
- Flags weak bullets, missing must-haves, and seniority mismatches
- Produces suggestions that can be rendered directly in the UI

## Data model

- `AnalysisSession`: root record for one report
- `UploadedFile`: uploaded resume metadata and storage path
- `ParsedResume`: raw text, normalized text, summary, sections, structure score
- `JobDescription`: normalized role text plus extracted keyword sets
- `KeywordResult`: matched, partial, and missing keyword artifacts
- `ScoringSummary`: category scores and structured explanation payload
- `Suggestion`: prioritized recommendations attached to the session

## Current scope

- Private history for signed-in users
- Resume upload with PDF and DOCX support
- Role-specific analysis when a job description is provided
- Side-by-side comparison of saved reports
- Shareable report pages

## Next improvements

- Broader parser coverage for more document layouts
- Better report export options
- More nuanced readability and bullet-quality guidance
- Stronger handling for image-heavy or scanned resumes
