import { NextResponse } from "next/server";

import { buildAnalysisReportMarkdown } from "@/features/analysis/server/build-analysis-report";
import { buildAnalysisDashboardData, getAnalysisSessionOrNull } from "@/features/analysis/server/get-analysis-session";

export const runtime = "nodejs";

interface ReportRouteProps {
  params: Promise<{
    id: string;
  }>;
}

export async function GET(_request: Request, { params }: ReportRouteProps) {
  const { id } = await params;
  const session = await getAnalysisSessionOrNull(id);

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
