"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

interface ComparisonPickerProps {
  sessions: Array<{
    id: string;
    title: string;
    overallScore: number | null;
  }>;
  initialLeftId?: string | null;
  initialRightId?: string | null;
}

export function ComparisonPicker({ sessions, initialLeftId, initialRightId }: ComparisonPickerProps) {
  const router = useRouter();
  const [leftId, setLeftId] = useState(initialLeftId ?? sessions[0]?.id ?? "");
  const [rightId, setRightId] = useState(initialRightId ?? sessions[1]?.id ?? sessions[0]?.id ?? "");

  const canCompare = leftId.length > 0 && rightId.length > 0 && leftId !== rightId;

  return (
    <Card>
      <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[var(--color-brand-300)]">Compare resumes</p>
      <h2 className="mt-4 text-2xl font-semibold text-[var(--foreground)]">Open two saved analyses side by side</h2>
      <p className="mt-3 text-sm leading-7 text-[var(--muted-foreground)]">
        Choose any two analyses from your private history to compare score, keyword coverage, readability, and
        suggestions.
      </p>

      <div className="mt-6 grid gap-4 lg:grid-cols-[1fr_1fr_auto] lg:items-end">
        <label className="block">
          <span className="mb-2 block text-sm font-medium text-[var(--foreground)]">Left analysis</span>
          <select
            value={leftId}
            onChange={(event) => setLeftId(event.target.value)}
            className="h-12 w-full rounded-2xl border border-[var(--border-soft)] bg-[var(--surface-2)] px-4 text-sm text-[var(--foreground)] outline-none"
          >
            {sessions.map((session) => (
              <option key={session.id} value={session.id}>
                {session.title} {session.overallScore !== null ? `· ${session.overallScore}` : ""}
              </option>
            ))}
          </select>
        </label>

        <label className="block">
          <span className="mb-2 block text-sm font-medium text-[var(--foreground)]">Right analysis</span>
          <select
            value={rightId}
            onChange={(event) => setRightId(event.target.value)}
            className="h-12 w-full rounded-2xl border border-[var(--border-soft)] bg-[var(--surface-2)] px-4 text-sm text-[var(--foreground)] outline-none"
          >
            {sessions.map((session) => (
              <option key={session.id} value={session.id}>
                {session.title} {session.overallScore !== null ? `· ${session.overallScore}` : ""}
              </option>
            ))}
          </select>
        </label>

        <Button
          type="button"
          size="lg"
          disabled={!canCompare}
          onClick={() => router.push(`/compare?left=${leftId}&right=${rightId}`)}
        >
          Compare
        </Button>
      </div>
    </Card>
  );
}
