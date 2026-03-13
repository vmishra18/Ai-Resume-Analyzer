import { notFound } from "next/navigation";
import type { Route } from "next";

import { AnalysisDashboard } from "@/features/analysis/components/analysis-dashboard";
import { requireCurrentUser } from "@/features/auth/server/session";
import { buildAnalysisDashboardData, getAnalysisSessionOrNull } from "@/features/analysis/server/get-analysis-session";

interface AnalysisDetailPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function AnalysisDetailPage({ params }: AnalysisDetailPageProps) {
  const { id } = await params;
  const user = await requireCurrentUser();

  const session = await getAnalysisSessionOrNull(id, user.id);

  if (!session) {
    notFound();
  }

  const dashboardData = buildAnalysisDashboardData(session);

  return (
    <AnalysisDashboard
      {...dashboardData}
      actions={{
        reportHref: `/api/analyses/${session.id}/report`,
        shareHref: `/share/${session.id}` as Route,
        historyHref: "/analyses",
        uploadHref: "/upload"
      }}
    />
  );
}
