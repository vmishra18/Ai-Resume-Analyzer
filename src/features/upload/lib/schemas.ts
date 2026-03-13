import { z } from "zod";

import { ACCEPTED_RESUME_EXTENSIONS, ACCEPTED_RESUME_TYPES, MAX_RESUME_FILE_SIZE } from "@/features/upload/lib/constants";
import { getFileExtension } from "@/features/upload/lib/helpers";

export const resumeFileSchema = z
  .custom<File>((value) => value instanceof File, {
    message: "Please choose a PDF or DOCX resume."
  })
  .superRefine((file, ctx) => {
    if (!(file instanceof File)) {
      return;
    }

    const extension = getFileExtension(file.name);

    if (file.size === 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "The uploaded file is empty."
      });
    }

    if (file.size > MAX_RESUME_FILE_SIZE) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Resume files must be 4 MB or smaller."
      });
    }

    if (!ACCEPTED_RESUME_TYPES.includes(file.type as (typeof ACCEPTED_RESUME_TYPES)[number])) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Only PDF and DOCX resumes are supported."
      });
    }

    if (!ACCEPTED_RESUME_EXTENSIONS.includes(extension as (typeof ACCEPTED_RESUME_EXTENSIONS)[number])) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "The file extension must be .pdf or .docx."
      });
    }
  });

export const uploadRequestSchema = z.object({
  resume: resumeFileSchema,
  jobDescription: z.string().max(12000, "Job descriptions must be 12,000 characters or fewer.").optional()
});

export type UploadRequestInput = z.infer<typeof uploadRequestSchema>;
