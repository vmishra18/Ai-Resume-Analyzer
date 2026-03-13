import { promises as fs } from "node:fs";

import { PDFParse } from "pdf-parse";

interface ResumeExtractionInput {
  filePath: string;
  mimeType: string;
}

async function extractPdfText(filePath: string) {
  const buffer = await fs.readFile(filePath);
  const parser = new PDFParse({
    data: new Uint8Array(buffer),
    disableFontFace: true
  });

  try {
    const result = await parser.getText();
    return result.text;
  } finally {
    await parser.destroy();
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
