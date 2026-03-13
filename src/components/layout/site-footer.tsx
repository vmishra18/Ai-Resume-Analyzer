export function SiteFooter() {
  return (
    <footer className="border-t border-white/8">
      <div className="mx-auto flex max-w-7xl flex-col gap-3 px-6 py-8 text-sm text-[var(--muted-foreground)] lg:flex-row lg:items-center lg:justify-between lg:px-8">
        <p>Built with Next.js, Prisma, Tailwind, and fully deterministic resume analysis logic.</p>
        <p>No paid APIs. No fake AI claims. Just explainable product engineering.</p>
      </div>
    </footer>
  );
}
