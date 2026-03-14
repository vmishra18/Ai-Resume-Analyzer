"use client";

import Link from "next/link";
import { Menu, X } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { startTransition, useState } from "react";

import { ThemeToggle } from "@/components/layout/theme-toggle";
import { Button } from "@/components/ui/button";
import { siteConfig } from "@/lib/site";

interface SiteHeaderProps {
  currentUser: {
    name: string;
  } | null;
}

export function SiteHeader({ currentUser }: SiteHeaderProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const displayName = currentUser?.name?.trim() || "Workspace";

  const navItems = siteConfig.nav.map((item) => ({
    ...item,
    resolvedHref: pathname === "/" ? item.href : `/${item.href}`
  }));

  async function handleLogout() {
    await fetch("/api/auth/logout", {
      method: "POST"
    });

    startTransition(() => {
      setIsMobileOpen(false);
      router.push("/");
      router.refresh();
    });
  }

  return (
    <header className="sticky top-0 z-30 border-b border-[var(--border-soft)] bg-[var(--header-bg)] backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex min-w-0 items-center gap-3">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,var(--color-brand-500),var(--color-accent-500))] text-sm font-bold text-white shadow-[0_10px_30px_rgba(245,106,72,0.3)]">
            RS
          </div>
          <div className="min-w-0">
            <p className="font-heading text-sm tracking-[0.24em] text-[var(--foreground)] uppercase">{siteConfig.name}</p>
            <p className="max-w-[12rem] truncate text-sm text-[var(--muted-foreground)] sm:max-w-[18rem] lg:max-w-[14rem] xl:max-w-none">
              {siteConfig.tagline}
            </p>
          </div>
        </Link>

        <nav className="hidden items-center gap-6 lg:flex xl:gap-8">
          {navItems.map((item) => (
            <a
              key={item.href}
              href={item.resolvedHref}
              className="text-sm font-medium text-[var(--muted-foreground)] transition hover:text-[var(--foreground)]"
            >
              {item.label}
            </a>
          ))}
        </nav>

        <div className="hidden items-center gap-2 lg:flex xl:gap-3">
          <ThemeToggle />
          {currentUser ? (
            <>
              <Button asChild variant="ghost" size="sm">
                <Link href="/analyses">History</Link>
              </Button>
              <div className="max-w-[8.5rem] truncate rounded-full border border-[var(--border-soft)] bg-[var(--surface-2)] px-3 py-2 text-sm text-[var(--muted-foreground)] xl:max-w-[10rem]">
                {displayName}
              </div>
              <Button variant="ghost" size="sm" onClick={handleLogout} className="hidden xl:inline-flex">
                Sign out
              </Button>
              <Button asChild size="sm">
                <Link href="/upload">Analyze resume</Link>
              </Button>
            </>
          ) : (
            <>
              <Button asChild variant="ghost" size="sm">
                <Link href="/auth">Sign in</Link>
              </Button>
              <Button asChild size="sm">
                <Link href="/auth">Create workspace</Link>
              </Button>
            </>
          )}
        </div>

        <div className="flex items-center gap-2 lg:hidden">
          <ThemeToggle />
          <Button
            variant="secondary"
            size="sm"
            aria-label="Open navigation"
            onClick={() => setIsMobileOpen((value) => !value)}
          >
            {isMobileOpen ? <X className="size-4" /> : <Menu className="size-4" />}
          </Button>
        </div>
      </div>

      {isMobileOpen ? (
        <div className="border-t border-[var(--border-soft)] bg-[var(--header-bg)] px-4 py-4 lg:hidden">
          <div className="mx-auto flex max-w-7xl flex-col gap-3">
            {navItems.map((item) => (
              <a
                key={item.href}
                href={item.resolvedHref}
                className="rounded-2xl border border-[var(--border-soft)] bg-[var(--surface-2)] px-4 py-3 text-sm font-medium text-[var(--foreground)]"
                onClick={() => setIsMobileOpen(false)}
              >
                {item.label}
              </a>
            ))}

            {currentUser ? (
              <>
                <div className="rounded-2xl border border-[var(--border-soft)] bg-[var(--surface-2)] px-4 py-3 text-sm text-[var(--muted-foreground)]">
                  Signed in as {displayName}
                </div>
                <Link
                  href="/analyses"
                  className="rounded-2xl border border-[var(--border-soft)] bg-[var(--surface-2)] px-4 py-3 text-sm font-medium text-[var(--foreground)]"
                  onClick={() => setIsMobileOpen(false)}
                >
                  History
                </Link>
                <Link
                  href="/upload"
                  className="rounded-2xl bg-[var(--color-brand-500)] px-4 py-3 text-sm font-semibold text-white"
                  onClick={() => setIsMobileOpen(false)}
                >
                  Analyze resume
                </Link>
                <Button variant="ghost" size="sm" onClick={handleLogout} className="justify-start px-4">
                  Sign out
                </Button>
              </>
            ) : (
              <>
                <Link
                  href="/auth"
                  className="rounded-2xl border border-[var(--border-soft)] bg-[var(--surface-2)] px-4 py-3 text-sm font-medium text-[var(--foreground)]"
                  onClick={() => setIsMobileOpen(false)}
                >
                  Sign in
                </Link>
                <Link
                  href="/auth"
                  className="rounded-2xl bg-[var(--color-brand-500)] px-4 py-3 text-sm font-semibold text-white"
                  onClick={() => setIsMobileOpen(false)}
                >
                  Create workspace
                </Link>
              </>
            )}
          </div>
        </div>
      ) : null}
    </header>
  );
}
