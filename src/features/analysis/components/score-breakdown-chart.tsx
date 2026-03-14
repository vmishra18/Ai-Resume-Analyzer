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
  "#5067f2",
  "#7f91ff",
  "#29b6a7",
  "#5f7a97",
  "#f0a12d",
  "#8b73d7"
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
            cursor={{ fill: "var(--surface-1)" }}
            contentStyle={{
              background: "var(--panel-strong)",
              border: "1px solid var(--border-soft)",
              borderRadius: "14px",
              color: "var(--foreground)"
            }}
          />
          <Bar dataKey="value" radius={[10, 10, 0, 0]}>
            {data.map((entry, index) => (
              <Cell key={entry.label} fill={barColors[index % barColors.length]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
