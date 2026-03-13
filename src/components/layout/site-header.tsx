"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu } from "lucide-react";

import { Button } from "@/components/ui/button";
import { siteConfig } from "@/lib/site";

export function SiteHeader() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-30 border-b border-white/8 bg-[rgba(8,12,20,0.72)] backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 lg:px-8">
        <Link href="/" className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,var(--color-brand-500),var(--color-accent-500))] text-sm font-bold text-white shadow-[0_10px_30px_rgba(245,106,72,0.3)]">
            AR
          </div>
          <div>
            <p className="font-heading text-sm tracking-[0.24em] text-white uppercase">
              ATS Resume Analyzer
            </p>
            <p className="text-sm text-[var(--muted-foreground)]">
              Resume feedback that helps you tailor every application
            </p>
          </div>
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          {siteConfig.nav.map((item) => (
            <a
              key={item.href}
              href={pathname === "/" ? item.href : `/${item.href}`}
              className="text-sm font-medium text-[var(--muted-foreground)] transition hover:text-white"
            >
              {item.label}
            </a>
          ))}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          <Button asChild variant="ghost" size="sm">
            <Link href="/analyses">History</Link>
          </Button>
          <Button asChild size="sm">
            <Link href="/upload">Analyze Resume</Link>
          </Button>
        </div>

        <Button variant="secondary" size="sm" className="md:hidden" aria-label="Open navigation">
          <Menu className="size-4" />
        </Button>
      </div>
    </header>
  );
}
