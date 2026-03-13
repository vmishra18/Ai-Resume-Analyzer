"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { LoaderCircle, LockKeyhole, Mail, UserRound } from "lucide-react";
import type { Route } from "next";
import { startTransition, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { loginSchema, registerSchema, type LoginInput, type RegisterInput } from "@/features/auth/lib/schemas";
import type { AuthErrorResponse, AuthSuccessResponse } from "@/features/auth/lib/types";

type Mode = "login" | "register";

async function submitAuthRequest<T>(path: string, values: T) {
  const response = await fetch(path, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(values)
  });
  const responseText = await response.text();
  const payload = responseText
    ? (JSON.parse(responseText) as AuthSuccessResponse | AuthErrorResponse)
    : ({
        message: "Something went wrong. Please try again."
      } as AuthErrorResponse);

  return { response, payload };
}

export function AuthPanel() {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>("register");
  const [loginError, setLoginError] = useState<string | null>(null);
  const [registerError, setRegisterError] = useState<string | null>(null);

  const loginForm = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: ""
    }
  });

  const registerForm = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: ""
    }
  });

  async function handleLogin(values: LoginInput) {
    setLoginError(null);
    const { response, payload } = await submitAuthRequest("/api/auth/login", values);

    if (!response.ok) {
      setLoginError((payload as AuthErrorResponse).message);
      return;
    }

    startTransition(() => {
      router.push((payload as AuthSuccessResponse).redirectTo as Route);
      router.refresh();
    });
  }

  async function handleRegister(values: RegisterInput) {
    setRegisterError(null);
    const { response, payload } = await submitAuthRequest("/api/auth/register", values);

    if (!response.ok) {
      setRegisterError((payload as AuthErrorResponse).message);
      return;
    }

    startTransition(() => {
      router.push((payload as AuthSuccessResponse).redirectTo as Route);
      router.refresh();
    });
  }

  return (
    <section className="px-6 py-16 lg:px-8 lg:py-20">
      <div className="mx-auto grid max-w-7xl gap-6 lg:grid-cols-[0.95fr_1.05fr]">
        <Card className="relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(245,106,72,0.18),transparent_32%),radial-gradient(circle_at_bottom_right,rgba(52,211,153,0.15),transparent_30%)]" />
          <div className="relative">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[var(--color-brand-300)]">
              Private workspace
            </p>
            <h1 className="mt-4 font-heading text-4xl text-[var(--foreground)] sm:text-5xl">
              Save your resume history, compare versions, and keep your job search private.
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-8 text-[var(--muted-foreground)]">
              Create an account once and every analysis stays attached to your own workspace. Come back to compare
              versions, revisit high-scoring resumes, and continue improving over time.
            </p>

            <div className="mt-8 grid gap-3">
              {[
                "Private analysis history tied to your account",
                "Side-by-side resume comparison for the same role",
                "Theme preference saved in your browser",
                "Faster repeat analysis for familiar job descriptions"
              ].map((item) => (
                <div key={item} className="rounded-2xl border border-[var(--border-soft)] bg-[var(--surface-2)] px-4 py-3">
                  <p className="text-sm leading-7 text-[var(--muted-foreground)]">{item}</p>
                </div>
              ))}
            </div>
          </div>
        </Card>

        <Card className="p-3 sm:p-4">
          <div className="grid grid-cols-2 gap-2 rounded-[24px] border border-[var(--border-soft)] bg-[var(--surface-2)] p-2">
            {[
              { value: "register", label: "Create account" },
              { value: "login", label: "Sign in" }
            ].map((item) => (
              <button
                key={item.value}
                type="button"
                onClick={() => setMode(item.value as Mode)}
                className={`rounded-[18px] px-4 py-3 text-sm font-semibold transition ${
                  mode === item.value
                    ? "bg-[var(--color-brand-500)] text-white shadow-[0_16px_30px_rgba(245,106,72,0.2)]"
                    : "text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>

          {mode === "register" ? (
            <form className="mt-6 space-y-4" onSubmit={registerForm.handleSubmit(handleRegister)}>
              <div>
                <label className="mb-2 block text-sm font-medium text-[var(--foreground)]" htmlFor="register-name">
                  Full name
                </label>
                <div className="relative">
                  <UserRound className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-[var(--muted-foreground)]" />
                  <Input id="register-name" className="pl-11" {...registerForm.register("name")} />
                </div>
                {registerForm.formState.errors.name ? (
                  <p className="mt-2 text-sm text-rose-300">{registerForm.formState.errors.name.message}</p>
                ) : null}
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-[var(--foreground)]" htmlFor="register-email">
                  Email
                </label>
                <div className="relative">
                  <Mail className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-[var(--muted-foreground)]" />
                  <Input id="register-email" type="email" className="pl-11" {...registerForm.register("email")} />
                </div>
                {registerForm.formState.errors.email ? (
                  <p className="mt-2 text-sm text-rose-300">{registerForm.formState.errors.email.message}</p>
                ) : null}
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-[var(--foreground)]" htmlFor="register-password">
                  Password
                </label>
                <div className="relative">
                  <LockKeyhole className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-[var(--muted-foreground)]" />
                  <Input id="register-password" type="password" className="pl-11" {...registerForm.register("password")} />
                </div>
                {registerForm.formState.errors.password ? (
                  <p className="mt-2 text-sm text-rose-300">{registerForm.formState.errors.password.message}</p>
                ) : null}
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-[var(--foreground)]" htmlFor="register-confirm-password">
                  Confirm password
                </label>
                <div className="relative">
                  <LockKeyhole className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-[var(--muted-foreground)]" />
                  <Input
                    id="register-confirm-password"
                    type="password"
                    className="pl-11"
                    {...registerForm.register("confirmPassword")}
                  />
                </div>
                {registerForm.formState.errors.confirmPassword ? (
                  <p className="mt-2 text-sm text-rose-300">{registerForm.formState.errors.confirmPassword.message}</p>
                ) : null}
              </div>

              {registerError ? (
                <div className="rounded-2xl border border-rose-400/20 bg-rose-400/10 px-4 py-3 text-sm text-rose-100">
                  {registerError}
                </div>
              ) : null}

              <Button type="submit" size="lg" disabled={registerForm.formState.isSubmitting} className="w-full">
                {registerForm.formState.isSubmitting ? (
                  <>
                    <LoaderCircle className="size-4 animate-spin" />
                    Creating account
                  </>
                ) : (
                  "Create workspace"
                )}
              </Button>
            </form>
          ) : (
            <form className="mt-6 space-y-4" onSubmit={loginForm.handleSubmit(handleLogin)}>
              <div>
                <label className="mb-2 block text-sm font-medium text-[var(--foreground)]" htmlFor="login-email">
                  Email
                </label>
                <div className="relative">
                  <Mail className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-[var(--muted-foreground)]" />
                  <Input id="login-email" type="email" className="pl-11" {...loginForm.register("email")} />
                </div>
                {loginForm.formState.errors.email ? (
                  <p className="mt-2 text-sm text-rose-300">{loginForm.formState.errors.email.message}</p>
                ) : null}
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-[var(--foreground)]" htmlFor="login-password">
                  Password
                </label>
                <div className="relative">
                  <LockKeyhole className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-[var(--muted-foreground)]" />
                  <Input id="login-password" type="password" className="pl-11" {...loginForm.register("password")} />
                </div>
                {loginForm.formState.errors.password ? (
                  <p className="mt-2 text-sm text-rose-300">{loginForm.formState.errors.password.message}</p>
                ) : null}
              </div>

              {loginError ? (
                <div className="rounded-2xl border border-rose-400/20 bg-rose-400/10 px-4 py-3 text-sm text-rose-100">
                  {loginError}
                </div>
              ) : null}

              <Button type="submit" size="lg" disabled={loginForm.formState.isSubmitting} className="w-full">
                {loginForm.formState.isSubmitting ? (
                  <>
                    <LoaderCircle className="size-4 animate-spin" />
                    Signing in
                  </>
                ) : (
                  "Sign in"
                )}
              </Button>
            </form>
          )}
        </Card>
      </div>
    </section>
  );
}
