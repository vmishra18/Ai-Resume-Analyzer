import { siteConfig } from "@/lib/site";

export function SiteFooter() {
  return (
    <footer className="mt-12 border-t border-[var(--border-soft)] px-6 pb-8 pt-8 lg:px-8">
      <div className="mx-auto flex max-w-7xl flex-col gap-4 text-sm text-[var(--muted-foreground)] lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="font-heading text-sm font-semibold uppercase tracking-[0.22em] text-[var(--foreground)]">
            {siteConfig.name}
          </p>
          <p className="mt-2 max-w-xl">Resume feedback that helps you choose the next edit with more confidence.</p>
        </div>
        <p className="max-w-md lg:text-right">Private history, clearer gaps, and practical next steps for each role.</p>
      </div>
    </footer>
  );
}
