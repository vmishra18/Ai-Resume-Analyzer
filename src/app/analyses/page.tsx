import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export default function AnalysesPage() {
  return (
    <section className="px-6 py-20 lg:px-8">
      <div className="mx-auto max-w-5xl">
        <Card>
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[var(--color-brand-300)]">
            History page
          </p>
          <h1 className="mt-4 font-heading text-4xl text-white">Analysis history will live here.</h1>
          <p className="mt-5 max-w-3xl text-base leading-8 text-[var(--muted-foreground)]">
            Once persistence is wired in, this page will list saved sessions, score trends, and resume-to-job comparisons.
            For now it anchors the app structure and gives us the routes we need for the next build slices.
          </p>
          <div className="mt-8">
            <Button asChild>
              <Link href="/upload">Create your first analysis</Link>
            </Button>
          </div>
        </Card>
      </div>
    </section>
  );
}
