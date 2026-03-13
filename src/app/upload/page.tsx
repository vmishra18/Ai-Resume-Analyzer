import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { getCurrentUser } from "@/features/auth/server/session";
import { UploadForm } from "@/features/upload/components/upload-form";

export default async function UploadPage() {
  const user = await getCurrentUser();

  if (!user) {
    return (
      <section className="px-6 py-16 lg:px-8 lg:py-20">
        <div className="mx-auto max-w-4xl">
          <Card className="text-center">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[var(--color-brand-300)]">
              Sign in required
            </p>
            <h1 className="mt-4 font-heading text-4xl text-[var(--foreground)] sm:text-5xl">
              Create a workspace before starting a new analysis.
            </h1>
            <p className="mx-auto mt-5 max-w-2xl text-base leading-8 text-[var(--muted-foreground)]">
              Analyses are now saved privately to your account so your history, comparisons, and repeat job descriptions
              stay organized in one place.
            </p>
            <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
              <Button asChild size="lg">
                <Link href="/auth">Create workspace</Link>
              </Button>
              <Button asChild size="lg" variant="secondary">
                <Link href="/auth">Sign in</Link>
              </Button>
            </div>
          </Card>
        </div>
      </section>
    );
  }

  return <UploadForm userName={user.name} />;
}
