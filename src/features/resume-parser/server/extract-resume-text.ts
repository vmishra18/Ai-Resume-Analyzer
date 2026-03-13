import { execFile } from "node:child_process";
import { promises as fs } from "node:fs";
import path from "node:path";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);

interface ResumeExtractionInput {
  filePath: string;
  mimeType: string;
}

async function extractPdfText(filePath: string) {
  const parserCliPath = path.join(process.cwd(), "node_modules", "pdf-parse", "bin", "cli.mjs");

  try {
    await fs.access(parserCliPath);

    const { stdout } = await execFileAsync(process.execPath, [parserCliPath, "text", filePath], {
      maxBuffer: 16 * 1024 * 1024
    });

    return stdout;
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown PDF parsing error";
    throw new Error(`Unable to extract text from the uploaded PDF. ${message}`, {
      cause: error
    });
  }
}

async function extractDocxText(filePath: string) {
  const buffer = await fs.readFile(filePath);
  const mammoth = await import("mammoth");
  const result = await mammoth.extractRawText({ buffer });

  return result.value;
}

export async function extractResumeText(input: ResumeExtractionInput) {
  if (input.mimeType === "application/pdf") {
    return extractPdfText(input.filePath);
  }

  if (
    input.mimeType === "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
  ) {
    return extractDocxText(input.filePath);
  }

  throw new Error(`Unsupported resume file type: ${input.mimeType}`);
}
