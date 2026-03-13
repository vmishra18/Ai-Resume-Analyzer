import { NextResponse } from "next/server";

import { buildAnalysisReportMarkdown } from "@/features/analysis/server/build-analysis-report";
import { getCurrentUser } from "@/features/auth/server/session";
import { buildAnalysisDashboardData, getAnalysisSessionOrNull } from "@/features/analysis/server/get-analysis-session";

export const runtime = "nodejs";

interface ReportRouteProps {
  params: Promise<{
    id: string;
  }>;
}

export async function GET(_request: Request, { params }: ReportRouteProps) {
  const { id } = await params;
  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.json(
      {
        message: "Sign in to download private reports."
      },
      { status: 401 }
    );
  }

  const session = await getAnalysisSessionOrNull(id, user.id);

  if (!session) {
    return NextResponse.json(
      {
        message: "Analysis session not found."
      },
      { status: 404 }
    );
  }

  const dashboardData = buildAnalysisDashboardData(session);
  const report = buildAnalysisReportMarkdown({
    sessionTitle: dashboardData.sessionTitle,
    ...dashboardData.reportData
  });

  return new NextResponse(report.content, {
    status: 200,
    headers: {
      "Content-Type": "text/markdown; charset=utf-8",
      "Content-Disposition": `attachment; filename="${report.fileName}"`
    }
  });
}
