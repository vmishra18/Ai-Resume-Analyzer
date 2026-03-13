import { promises as fs } from "node:fs";
import path from "node:path";
import { randomUUID } from "node:crypto";

import type {
  KeywordCategory as PrismaKeywordCategory,
  KeywordMatchType as PrismaKeywordMatchType,
  Prisma,
  SuggestionPriority as PrismaSuggestionPriority,
  SuggestionType as PrismaSuggestionType
} from "@prisma/client";
import { analyzeResumeAgainstJob } from "@/features/analysis/server/analysis-engine";
import { processJobDescription } from "@/features/job-description/server/process-job-description";
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

function toPrismaKeywordCategory(category: string) {
  return category.toUpperCase() as PrismaKeywordCategory;
}

function toPrismaKeywordMatchType(matchType: string) {
  return matchType.toUpperCase() as PrismaKeywordMatchType;
}

function toPrismaSuggestionPriority(priority: string) {
  return priority.toUpperCase() as PrismaSuggestionPriority;
}

function toPrismaSuggestionType(suggestionType: string) {
  return suggestionType.toUpperCase() as PrismaSuggestionType;
}

export async function createAnalysisSessionFromUpload(
  input: UploadRequestInput
): Promise<CreateAnalysisSessionResponse> {
  const { resume, jobDescription } = input;
  const normalizedJobDescription = normalizeWhitespace(jobDescription ?? "");
  const savedFile = await persistUploadedResume(resume);
  const sessionTitle = buildAnalysisTitle(resume.name);
  const processedJobDescription = normalizedJobDescription
    ? processJobDescription(jobDescription ?? "")
    : null;

  try {
    const session = await db.analysisSession.create({
      data: {
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

      const analysisSummary = processedJobDescription
        ? analyzeResumeAgainstJob(parsedResume, processedJobDescription)
        : null;

      await db.$transaction(async (transaction) => {
        await transaction.analysisSession.update({
          where: { id: session.id },
          data: {
            status: analysisSummary ? "COMPLETED" : "PENDING",
            overallScore: analysisSummary?.score.total,
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
            scoringSummary: analysisSummary
              ? {
                  create: {
                    keywordMatchScore: analysisSummary.score.keywordMatch,
                    mustHaveSkillScore: analysisSummary.score.mustHaveSkills,
                    sectionCompletenessScore: analysisSummary.score.sectionCompleteness,
                    roleRelevanceScore: analysisSummary.score.roleRelevance,
                    structureQualityScore: analysisSummary.score.structureQuality,
                    alignmentScore: analysisSummary.score.alignment,
                    bonusScore: analysisSummary.score.bonus,
                    explanation: analysisSummary.explanation as unknown as Prisma.InputJsonValue
                  }
                }
              : undefined
          }
        });

        if (!analysisSummary) {
          return;
        }

        const allKeywordResults = [
          ...analysisSummary.matchedKeywords,
          ...analysisSummary.partialKeywords,
          ...analysisSummary.missingKeywords
        ];

        if (allKeywordResults.length > 0) {
          await transaction.keywordResult.createMany({
            data: allKeywordResults.map((keyword) => ({
              sessionId: session.id,
              keyword: keyword.keyword,
              normalizedKeyword: keyword.normalizedKeyword,
              category: toPrismaKeywordCategory(keyword.category),
              matchType: toPrismaKeywordMatchType(keyword.matchType),
              occurrences: keyword.occurrences
            }))
          });
        }

        if (analysisSummary.suggestions.length > 0) {
          await transaction.suggestion.createMany({
            data: analysisSummary.suggestions.map((suggestion) => ({
              sessionId: session.id,
              title: suggestion.title,
              description: suggestion.description,
              priority: toPrismaSuggestionPriority(suggestion.priority),
              suggestionType: toPrismaSuggestionType(suggestion.suggestionType)
            }))
          });
        }
      });

      return {
        sessionId: session.id,
        redirectTo: `/analyses/${session.id}`,
        status: analysisSummary ? "COMPLETED" : "PENDING",
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
