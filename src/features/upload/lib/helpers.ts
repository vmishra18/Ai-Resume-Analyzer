import { ACCEPTED_RESUME_EXTENSIONS, ACCEPTED_RESUME_TYPES, MAX_RESUME_FILE_SIZE } from "@/features/upload/lib/constants";

export function getFileExtension(fileName: string) {
  const match = fileName.toLowerCase().match(/\.[^.]+$/);

  return match?.[0] ?? "";
}

export function isAcceptedResumeFile(file: File) {
  const extension = getFileExtension(file.name);

  return (
    ACCEPTED_RESUME_TYPES.includes(file.type as (typeof ACCEPTED_RESUME_TYPES)[number]) &&
    ACCEPTED_RESUME_EXTENSIONS.includes(extension as (typeof ACCEPTED_RESUME_EXTENSIONS)[number]) &&
    file.size <= MAX_RESUME_FILE_SIZE
  );
}

export function normalizeWhitespace(value: string) {
  return value.replace(/\r\n/g, "\n").replace(/\t/g, " ").replace(/[ ]{2,}/g, " ").trim();
}

export function buildAnalysisTitle(fileName: string) {
  const baseName = fileName.replace(/\.[^.]+$/, "").trim();

  return baseName.length > 0 ? `${baseName} Analysis` : "Resume Analysis";
}

export function sanitizeFileName(fileName: string) {
  return fileName.toLowerCase().replace(/[^a-z0-9.\-_]/g, "-").replace(/-+/g, "-");
}

export function formatBytes(bytes: number) {
  if (bytes < 1024) {
    return `${bytes} B`;
  }

  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1)} KB`;
  }

  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
