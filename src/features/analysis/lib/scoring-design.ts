export const scoringWeights = [
  {
    key: "keywordMatch",
    label: "Keyword match percentage",
    weight: 30,
    description: "Measures how many JD keywords and phrases appear in the resume after normalization."
  },
  {
    key: "mustHaveSkills",
    label: "Must-have skill coverage",
    weight: 25,
    description: "Rewards overlap with explicitly required skills, tools, and qualifications."
  },
  {
    key: "sectionCompleteness",
    label: "Section completeness",
    weight: 15,
    description: "Checks for summary, skills, experience, education, and project sections."
  },
  {
    key: "roleRelevance",
    label: "Role relevance",
    weight: 10,
    description: "Looks for title and domain alignment between the resume and job description."
  },
  {
    key: "structureQuality",
    label: "Resume structure quality",
    weight: 10,
    description: "Penalizes thin resumes, missing headings, and poor content distribution."
  },
  {
    key: "alignment",
    label: "Job description alignment",
    weight: 10,
    description: "Evaluates whether the resume reflects the responsibilities and language of the role."
  }
] as const;

export const maxBonusScore = 5;
