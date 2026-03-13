import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export function HistoryEmptyState() {
  return (
    <Card className="text-center">
      <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[var(--color-brand-300)]">
        No saved analyses yet
      </p>
      <h1 className="mt-4 font-heading text-4xl text-white">Start with your first resume-to-job comparison.</h1>
      <p className="mx-auto mt-5 max-w-2xl text-base leading-8 text-[var(--muted-foreground)]">
        This page becomes your analysis workspace over time. Completed sessions will appear here with score history,
        trend context, and quick links back to the full dashboard.
      </p>
      <div className="mt-8 flex justify-center">
        <Button asChild size="lg">
          <Link href="/upload">Create first analysis</Link>
        </Button>
      </div>
    </Card>
  );
}
