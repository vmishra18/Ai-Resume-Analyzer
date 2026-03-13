export const MAX_RESUME_FILE_SIZE = 4 * 1024 * 1024;

export const ACCEPTED_RESUME_TYPES = [
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
] as const;

export const ACCEPTED_RESUME_EXTENSIONS = [".pdf", ".docx"] as const;
