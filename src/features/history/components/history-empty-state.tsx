import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export function HistoryEmptyState() {
  return (
    <Card className="text-center">
      <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[var(--color-brand-300)]">
        No saved analyses yet
      </p>
      <h1 className="mt-4 font-heading text-4xl text-[var(--foreground)]">Start with your first resume check.</h1>
      <p className="mx-auto mt-5 max-w-2xl text-base leading-8 text-[var(--muted-foreground)]">
        Once you run an analysis, your results will appear here so you can come back, compare versions, and track your
        progress over time.
      </p>
      <div className="mt-8 flex justify-center">
        <Button asChild size="lg">
          <Link href="/upload">Create first analysis</Link>
        </Button>
      </div>
    </Card>
  );
}
