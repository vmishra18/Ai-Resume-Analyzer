interface HistorySessionLike {
  id: string;
  title: string;
  status: string;
  overallScore: number | null;
  createdAt: Date;
}

export function formatHistoryDate(value: Date) {
  return new Intl.DateTimeFormat("en-GB", {
    dateStyle: "medium",
    timeStyle: "short"
  }).format(value);
}

export function buildTrendData(sessions: HistorySessionLike[]) {
  return sessions
    .filter((session) => session.overallScore !== null)
    .slice(0, 6)
    .reverse()
    .map((session, index) => ({
      label: `Run ${index + 1}`,
      value: session.overallScore ?? 0
    }));
}

export function summarizeHistory(sessions: HistorySessionLike[]) {
  const completed = sessions.filter((session) => session.status === "COMPLETED");
  const completedScores = completed
    .map((session) => session.overallScore)
    .filter((score): score is number => score !== null);

  const averageScore =
    completedScores.length > 0
      ? Math.round(completedScores.reduce((total, score) => total + score, 0) / completedScores.length)
      : null;
  const bestScore = completedScores.length > 0 ? Math.max(...completedScores) : null;
  const failedCount = sessions.filter((session) => session.status === "FAILED").length;

  const recentScores = completedScores.slice(0, 3);
  const priorScores = completedScores.slice(3, 6);
  const recentAverage =
    recentScores.length > 0
      ? recentScores.reduce((total, score) => total + score, 0) / recentScores.length
      : null;
  const priorAverage =
    priorScores.length > 0 ? priorScores.reduce((total, score) => total + score, 0) / priorScores.length : null;
  const trendDelta =
    recentAverage !== null && priorAverage !== null ? Math.round(recentAverage - priorAverage) : null;

  return {
    totalSessions: sessions.length,
    completedSessions: completed.length,
    averageScore,
    bestScore,
    failedCount,
    trendDelta
  };
}
