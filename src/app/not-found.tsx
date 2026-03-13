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
          <h1 className="mt-4 font-heading text-5xl text-white">This analysis route does not exist.</h1>
          <p className="mx-auto mt-5 max-w-2xl text-base leading-8 text-[var(--muted-foreground)]">
            Use this state for missing reports, deleted sessions, or bad share links. Good empty and error states make
            the project feel much more like a real product.
          </p>
          <div className="mt-8 flex justify-center gap-3">
            <Button asChild>
              <Link href="/">Back to home</Link>
            </Button>
            <Button asChild variant="secondary">
              <Link href="/upload">Open analyzer</Link>
            </Button>
          </div>
        </Card>
      </div>
    </section>
  );
}
