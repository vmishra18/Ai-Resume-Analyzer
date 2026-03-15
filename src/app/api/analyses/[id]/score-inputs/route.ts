import { NextResponse } from "next/server";
import { z } from "zod";

import { getCurrentUser } from "@/features/auth/server/session";
import { rerunAnalysisWithKeywordReview } from "@/features/analysis/server/rerun-analysis-with-keyword-review";

const scoreInputSchema = z
  .object({
    mustHaveKeywordsText: z.string().trim(),
    supportingKeywordsText: z.string().trim()
  })
  .refine(
    (value) =>
      value.mustHaveKeywordsText.length > 0 || value.supportingKeywordsText.length > 0,
    {
      message: "Add at least one must-have or supporting keyword before rerunning the score.",
      path: ["mustHaveKeywordsText"]
    }
  );

export const runtime = "nodejs";

interface RouteContext {
  params: Promise<{
    id: string;
  }>;
}

export async function POST(request: Request, context: RouteContext) {
  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.json(
      {
        message: "Sign in to rerun the score with reviewed keywords."
      },
      { status: 401 }
    );
  }

  const { id } = await context.params;
  const payload = await request.json().catch(() => null);
  const parsed = scoreInputSchema.safeParse(payload);

  if (!parsed.success) {
    return NextResponse.json(
      {
        message: parsed.error.issues[0]?.message ?? "Please check the keyword inputs and try again."
      },
      { status: 400 }
    );
  }

  try {
    const response = await rerunAnalysisWithKeywordReview(id, user.id, parsed.data);

    return NextResponse.json(response);
  } catch (error) {
    console.error("Failed to rerun analysis with reviewed keywords", error);

    return NextResponse.json(
      {
        message: error instanceof Error ? error.message : "We couldn't rerun the score right now."
      },
      { status: 500 }
    );
  }
}
