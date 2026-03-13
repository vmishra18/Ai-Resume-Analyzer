import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export default function NotFound() {
  return (
    <section className="px-6 py-20 lg:px-8">
      <div className="mx-auto max-w-3xl">
        <Card className="text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[var(--color-brand-300)]">
            404
          </p>
          <h1 className="mt-4 font-heading text-5xl text-[var(--foreground)]">We couldn&apos;t find that page.</h1>
          <p className="mx-auto mt-5 max-w-2xl text-base leading-8 text-[var(--muted-foreground)]">
            The link may be out of date, the analysis may have been removed, or the page may never have existed.
          </p>
          <div className="mt-8 flex justify-center gap-3">
            <Button asChild>
              <Link href="/">Back to home</Link>
            </Button>
            <Button asChild variant="secondary">
              <Link href="/upload">Start analysis</Link>
            </Button>
          </div>
        </Card>
      </div>
    </section>
  );
}
