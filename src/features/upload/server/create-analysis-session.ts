import { promises as fs } from "node:fs";
import path from "node:path";
import { randomUUID } from "node:crypto";

import type { Prisma } from "@prisma/client";
import { getProcessedJobDescription } from "@/features/job-description/server/get-processed-job-description";
import { parseResumeFile } from "@/features/resume-parser/server/parse-resume-file";
import type { CreateAnalysisSessionResponse } from "@/features/upload/lib/types";
import { buildAnalysisTitle, getFileExtension, normalizeWhitespace, sanitizeFileName } from "@/features/upload/lib/helpers";
import type { UploadRequestInput } from "@/features/upload/lib/schemas";
import { db } from "@/lib/db";

async function persistUploadedResume(file: File) {
  const uploadRoot = path.join(process.cwd(), process.env.UPLOAD_DIR ?? "uploads", "resumes");
  const storageName = `${randomUUID()}-${sanitizeFileName(file.name)}`;
  const absolutePath = path.join(uploadRoot, storageName);
  const relativePath = path.relative(process.cwd(), absolutePath);
  const buffer = Buffer.from(await file.arrayBuffer());

  await fs.mkdir(uploadRoot, { recursive: true });
  await fs.writeFile(absolutePath, buffer);

  return {
    absolutePath,
    relativePath
  };
}

export async function createAnalysisSessionFromUpload(
  input: UploadRequestInput,
  userId: string
): Promise<CreateAnalysisSessionResponse> {
  const { resume, jobDescription } = input;
  const normalizedJobDescription = normalizeWhitespace(jobDescription ?? "");
  const savedFile = await persistUploadedResume(resume);
  const sessionTitle = buildAnalysisTitle(resume.name);
  const processedJobDescription = normalizedJobDescription
    ? await getProcessedJobDescription(jobDescription ?? "")
    : null;

  try {
    const session = await db.analysisSession.create({
      data: {
        userId,
        title: sessionTitle,
        status: "PROCESSING",
        uploadedFile: {
          create: {
            originalName: resume.name,
            storagePath: savedFile.relativePath,
            mimeType: resume.type,
            extension: getFileExtension(resume.name),
            sizeBytes: resume.size,
            uploadStatus: "COMPLETED"
          }
        },
        jobDescription: normalizedJobDescription
          ? {
              create: {
                rawText: processedJobDescription?.rawText ?? "",
                normalizedText: processedJobDescription?.normalizedText ?? normalizedJobDescription,
                title: processedJobDescription?.title,
                company: processedJobDescription?.company,
                seniority: processedJobDescription?.seniority,
                requiredYearsExperience: processedJobDescription?.requiredYearsExperience,
                extractedKeywords:
                  (processedJobDescription?.extractedKeywords ?? []) as unknown as Prisma.InputJsonValue,
                mustHaveKeywords:
                  (processedJobDescription?.mustHaveKeywords ?? []) as unknown as Prisma.InputJsonValue,
                niceToHaveKeywords:
                  (processedJobDescription?.niceToHaveKeywords ?? []) as unknown as Prisma.InputJsonValue
              }
            }
          : undefined
      }
    });

    try {
      const parsedResume = await parseResumeFile({
        filePath: savedFile.absolutePath,
        mimeType: resume.type
      });

      await db.$transaction(async (transaction) => {
        await transaction.analysisSession.update({
          where: { id: session.id },
          data: {
            status: "PENDING",
            overallScore: null,
            parsedResume: {
              create: {
                rawText: parsedResume.rawText,
                normalizedText: parsedResume.normalizedText,
                summary: parsedResume.summary,
                hasSummary: parsedResume.sections.summary,
                hasSkills: parsedResume.sections.skills,
                hasExperience: parsedResume.sections.experience,
                hasEducation: parsedResume.sections.education,
                hasProjects: parsedResume.sections.projects,
                structureScore: parsedResume.structureScore
              }
            },
            scoringSummary: undefined
          }
        });

      });

      return {
        sessionId: session.id,
        redirectTo: processedJobDescription ? `/analyses/${session.id}/review` : `/analyses/${session.id}`,
        status: "PENDING",
        title: session.title
      };
    } catch (error) {
      console.error("Failed to parse or analyze uploaded resume", error);

      await db.analysisSession.update({
        where: { id: session.id },
        data: {
          status: "FAILED"
        }
      });

      return {
        sessionId: session.id,
        redirectTo: `/analyses/${session.id}`,
        status: "FAILED",
        title: sessionTitle
      };
    }
  } catch (error) {
    await fs.rm(savedFile.absolutePath, { force: true });
    throw error;
  }
}
