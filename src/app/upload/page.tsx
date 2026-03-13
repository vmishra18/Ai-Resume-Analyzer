import { Card } from "@/components/ui/card";

export default function UploadPage() {
  return (
    <section className="px-6 py-20 lg:px-8">
      <div className="mx-auto max-w-4xl">
        <Card>
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[var(--color-brand-300)]">
            Phase 3 preview
          </p>
          <h1 className="mt-4 font-heading text-4xl text-white">Resume upload flow is next.</h1>
          <p className="mt-5 max-w-2xl text-base leading-8 text-[var(--muted-foreground)]">
            This route is intentionally in place now so the app has a realistic navigation shell. In the next phase,
            we will add file validation, form handling, drag-and-drop upload, and server-side parsing orchestration.
          </p>
        </Card>
      </div>
    </section>
  );
}
