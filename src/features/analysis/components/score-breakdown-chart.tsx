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
          <CartesianGrid stroke="rgba(255,255,255,0.08)" vertical={false} />
          <XAxis
            dataKey="label"
            tick={{ fill: "#9ca7bc", fontSize: 12 }}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            tick={{ fill: "#9ca7bc", fontSize: 12 }}
            tickLine={false}
            axisLine={false}
            allowDecimals={false}
          />
          <Tooltip
            cursor={{ fill: "rgba(255,255,255,0.04)" }}
            contentStyle={{
              background: "rgba(7,16,27,0.94)",
              border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: "18px",
              color: "#f7f8fb"
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
