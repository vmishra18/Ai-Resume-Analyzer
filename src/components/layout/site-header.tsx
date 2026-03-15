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
    <header className="sticky top-0 z-30 border-b border-[var(--border-soft)] bg-[color-mix(in_srgb,var(--header-bg)_86%,transparent)] backdrop-blur-2xl">
      <div className="mx-auto max-w-7xl px-4 py-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-4">
          <Link href="/" className="flex min-w-0 items-center gap-3">
            <div className="flex size-11 shrink-0 items-center justify-center rounded-[14px] border border-[var(--border-soft)] bg-[color-mix(in_srgb,var(--panel-strong)_84%,transparent)] text-sm font-bold text-[var(--foreground)] shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]">
              RS
            </div>
            <div className="min-w-0">
              <p className="font-heading text-[14px] font-semibold tracking-[0.14em] text-[var(--foreground)] uppercase">
                {siteConfig.name}
              </p>
              <p className="max-w-[12rem] truncate text-[12px] tracking-[0.12em] text-[var(--muted-foreground)] sm:max-w-[18rem] lg:max-w-[15rem] xl:max-w-none">
                Clear resume feedback for every application
              </p>
            </div>
          </Link>

          <nav className="hidden items-center gap-1 rounded-full border border-[var(--border-soft)] bg-[color-mix(in_srgb,var(--surface-1)_74%,transparent)] p-1 lg:flex">
            {navItems.map((item) => (
              <a
                key={item.href}
                href={item.resolvedHref}
                className="rounded-full px-4 py-2 text-[12px] font-semibold tracking-[0.14em] text-[var(--muted-foreground)] transition hover:bg-[var(--surface-2)] hover:text-[var(--foreground)]"
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
                <div className="max-w-[9rem] truncate rounded-full border border-[var(--border-soft)] bg-[color-mix(in_srgb,var(--surface-1)_78%,transparent)] px-4 py-2 text-[12px] font-medium tracking-[0.08em] text-[var(--muted-foreground)] xl:max-w-[11rem]">
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
          <div className="mt-4 border-t border-[var(--border-soft)] pt-4 lg:hidden">
            <div className="mx-auto flex max-w-7xl flex-col gap-3">
              {navItems.map((item) => (
                <a
                  key={item.href}
                  href={item.resolvedHref}
                  className="rounded-[14px] bg-[color-mix(in_srgb,var(--surface-1)_78%,transparent)] px-4 py-3 text-sm font-medium text-[var(--foreground)]"
                  onClick={() => setIsMobileOpen(false)}
                >
                  {item.label}
                </a>
              ))}

              {currentUser ? (
                <>
                  <div className="pt-2 text-xs uppercase tracking-[0.14em] text-[var(--muted-foreground)]">
                    Signed in as {displayName}
                  </div>
                  <Link
                    href="/analyses"
                    className="text-sm font-medium text-[var(--foreground)]"
                    onClick={() => setIsMobileOpen(false)}
                  >
                    History
                  </Link>
                  <Link
                    href="/upload"
                    className="inline-flex w-fit rounded-[8px] bg-[var(--color-brand-500)] px-4 py-3 text-sm font-semibold text-white"
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
                    className="text-sm font-medium text-[var(--foreground)]"
                    onClick={() => setIsMobileOpen(false)}
                  >
                    Sign in
                  </Link>
                  <Link
                    href="/auth"
                    className="inline-flex w-fit rounded-[8px] bg-[var(--color-brand-500)] px-4 py-3 text-sm font-semibold text-white"
                    onClick={() => setIsMobileOpen(false)}
                  >
                    Create workspace
                  </Link>
                </>
              )}
            </div>
          </div>
        ) : null}
      </div>
    </header>
  );
}
