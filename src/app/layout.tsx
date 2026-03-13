import type { Metadata } from "next";

import { ThemeProvider } from "@/components/providers/theme-provider";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { getCurrentUser } from "@/features/auth/server/session";
import "@/app/globals.css";

export const metadata: Metadata = {
  title: "Resume Signal",
  description:
    "Upload a resume, compare it to a job description, and get a polished match report with practical suggestions."
};

const themeScript = `
(() => {
  try {
    const storedTheme = localStorage.getItem("resume-signal-theme");
    const prefersLight = window.matchMedia("(prefers-color-scheme: light)").matches;
    const theme = storedTheme === "light" || storedTheme === "dark" ? storedTheme : prefersLight ? "light" : "dark";
    document.documentElement.dataset.theme = theme;
  } catch (error) {}
})();
`;

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const currentUser = await getCurrentUser();

  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
        <ThemeProvider>
          <div className="relative flex min-h-screen flex-col">
            <SiteHeader currentUser={currentUser ? { name: currentUser.name } : null} />
            <main className="flex-1">{children}</main>
            <SiteFooter />
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
