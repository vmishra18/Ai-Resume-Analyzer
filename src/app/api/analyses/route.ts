import { NextResponse } from "next/server";

import { uploadRequestSchema } from "@/features/upload/lib/schemas";
import { createAnalysisSessionFromUpload } from "@/features/upload/server/create-analysis-session";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const formData = await request.formData();

  const parsed = uploadRequestSchema.safeParse({
    resume: formData.get("resume"),
    jobDescription: formData.get("jobDescription")
  });

  if (!parsed.success) {
    const { fieldErrors } = parsed.error.flatten();

    return NextResponse.json(
      {
        message: "Please fix the highlighted fields and try again.",
        fieldErrors
      },
      { status: 400 }
    );
  }

  try {
    const response = await createAnalysisSessionFromUpload(parsed.data);

    return NextResponse.json(response, { status: 201 });
  } catch (error) {
    console.error("Failed to create analysis session", error);

    return NextResponse.json(
      {
        message: "We couldn't create the analysis session. Please try again."
      },
      { status: 500 }
    );
  }
}
