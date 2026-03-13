import { notFound } from "next/navigation";
import type { Route } from "next";

import { AnalysisDashboard } from "@/features/analysis/components/analysis-dashboard";
import { buildAnalysisDashboardData, getAnalysisSessionOrNull } from "@/features/analysis/server/get-analysis-session";

interface ShareAnalysisPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function ShareAnalysisPage({ params }: ShareAnalysisPageProps) {
  const { id } = await params;
  const session = await getAnalysisSessionOrNull(id);

  if (!session) {
    notFound();
  }

  const dashboardData = buildAnalysisDashboardData(session);

  return (
    <AnalysisDashboard
      {...dashboardData}
      headerBadge="Shareable results"
      actions={{
        reportHref: `/api/analyses/${session.id}/report`,
        shareHref: `/share/${session.id}` as Route,
        historyHref: "/analyses",
        uploadHref: "/upload"
      }}
    />
  );
}
