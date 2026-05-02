"use client";

import {
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { ChevronRight } from "lucide-react";

interface TemporalChartProps {
  title: string;
  subtitle: string;
  data: Record<string, string | number>[];
  variant?: "line" | "area";
}

const COLORS = {
  primary: "oklch(0.72 0.18 200)",
  accent: "oklch(0.65 0.22 160)",
  warning: "oklch(0.78 0.18 85)",
  muted: "oklch(0.65 0.02 260)",
};

export function TemporalChart({
  title,
  subtitle,
  data,
  variant = "line",
}: TemporalChartProps) {
  const keys = Object.keys(data[0] || {}).filter((k) => k !== "time");

  const colorMap: Record<string, string> = {};
  keys.forEach((key, index) => {
    const colorKeys = Object.values(COLORS);
    colorMap[key] = colorKeys[index % colorKeys.length];
  });

  return (
    <div className="bg-card border border-border rounded-xl p-5">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-medium text-foreground">{title}</h3>
          <p className="text-xs text-muted-foreground mt-0.5">{subtitle}</p>
        </div>
        <button className="p-1 hover:bg-secondary rounded transition-colors">
          <ChevronRight className="h-4 w-4 text-muted-foreground" />
        </button>
      </div>

      <div className="flex items-center gap-4 mb-4">
        {keys.map((key) => (
          <div key={key} className="flex items-center gap-2">
            <div
              className="h-2 w-2 rounded-full"
              style={{ backgroundColor: colorMap[key] }}
            />
            <span className="text-xs text-muted-foreground capitalize">{key}</span>
          </div>
        ))}
      </div>

      <div className="h-48">
        <ResponsiveContainer width="100%" height="100%">
          {variant === "area" ? (
            <AreaChart data={data} margin={{ top: 5, right: 5, bottom: 5, left: 0 }}>
              <defs>
                {keys.map((key) => (
                  <linearGradient key={key} id={`gradient-${key}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={colorMap[key]} stopOpacity={0.3} />
                    <stop offset="95%" stopColor={colorMap[key]} stopOpacity={0} />
                  </linearGradient>
                ))}
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.28 0.02 260)" vertical={false} />
              <XAxis
                dataKey="time"
                axisLine={false}
                tickLine={false}
                tick={{ fill: "oklch(0.65 0.02 260)", fontSize: 11 }}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fill: "oklch(0.65 0.02 260)", fontSize: 11 }}
                tickFormatter={(value) => `${(value / 1000).toFixed(0)}K`}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "oklch(0.16 0.02 260)",
                  border: "1px solid oklch(0.28 0.02 260)",
                  borderRadius: "8px",
                  fontSize: "12px",
                }}
                labelStyle={{ color: "oklch(0.98 0.01 260)" }}
              />
              {keys.map((key) => (
                <Area
                  key={key}
                  type="monotone"
                  dataKey={key}
                  stroke={colorMap[key]}
                  fill={`url(#gradient-${key})`}
                  strokeWidth={2}
                />
              ))}
            </AreaChart>
          ) : (
            <LineChart data={data} margin={{ top: 5, right: 5, bottom: 5, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.28 0.02 260)" vertical={false} />
              <XAxis
                dataKey="time"
                axisLine={false}
                tickLine={false}
                tick={{ fill: "oklch(0.65 0.02 260)", fontSize: 11 }}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fill: "oklch(0.65 0.02 260)", fontSize: 11 }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "oklch(0.16 0.02 260)",
                  border: "1px solid oklch(0.28 0.02 260)",
                  borderRadius: "8px",
                  fontSize: "12px",
                }}
                labelStyle={{ color: "oklch(0.98 0.01 260)" }}
              />
              {keys.map((key) => (
                <Line
                  key={key}
                  type="monotone"
                  dataKey={key}
                  stroke={colorMap[key]}
                  strokeWidth={2}
                  dot={false}
                />
              ))}
            </LineChart>
          )}
        </ResponsiveContainer>
      </div>
    </div>
  );
}
