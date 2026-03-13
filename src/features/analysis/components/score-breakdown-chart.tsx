"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";

const barColors = [
  "#f56a48",
  "#ff936f",
  "#34d399",
  "#38bdf8",
  "#fbbf24",
  "#a78bfa"
];

interface ScoreBreakdownChartProps {
  data: Array<{
    label: string;
    value: number;
  }>;
}

export function ScoreBreakdownChart({ data }: ScoreBreakdownChartProps) {
  return (
    <div className="h-[260px] min-h-[260px] min-w-0 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 10, right: 8, left: -24, bottom: 0 }}>
          <CartesianGrid stroke="var(--grid-line)" vertical={false} />
          <XAxis
            dataKey="label"
            tick={{ fill: "var(--muted-foreground)", fontSize: 12 }}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            tick={{ fill: "var(--muted-foreground)", fontSize: 12 }}
            tickLine={false}
            axisLine={false}
            allowDecimals={false}
          />
          <Tooltip
            cursor={{ fill: "var(--surface-2)" }}
            contentStyle={{
              background: "var(--background)",
              border: "1px solid var(--border-soft)",
              borderRadius: "18px",
              color: "var(--foreground)"
            }}
          />
          <Bar dataKey="value" radius={[12, 12, 6, 6]}>
            {data.map((entry, index) => (
              <Cell key={entry.label} fill={barColors[index % barColors.length]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
