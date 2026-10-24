"use client";

import { useState } from "react";
import { Bar, BarChart, CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

export interface ProjectionSeries { taskId: string; label: string; approved: boolean; baseline: number[]; withSpend: number[]; method: string }
export interface EfficiencyPoint { agent: string; efficiency: number; completed: number }

export function TreasuryProjectionChart({ series }: { series: ProjectionSeries[] }) {
  const [id, setId] = useState<string>(series.find((s) => s.withSpend[0] !== s.baseline[0])?.taskId ?? series[0]?.taskId ?? "");
  const s = series.find((x) => x.taskId === id) ?? series[0];
  if (!s) return null;
  const data = s.baseline.map((b, i) => ({ step: `t+${i + 1}`, without: Number(b.toFixed(3)), with: Number(s.withSpend[i].toFixed(3)) }));
  return (
    <div className="rounded-lg border border-border p-4">
      <div className="flex flex-wrap items-center gap-2 mb-3">
        <label htmlFor="spend" className="text-sm text-muted-foreground">Proposed spend</label>
        <select id="spend" value={id} onChange={(e) => setId(e.target.value)} className="rounded border border-border bg-background px-2 py-1 text-sm max-w-full">
          {series.map((x) => <option key={x.taskId} value={x.taskId}>{x.label}</option>)}
        </select>
        <span className="text-xs text-muted-foreground">{s.approved ? "APPROVED" : "REJECTED: never spent"} · {s.method}</span>
      </div>
      <ResponsiveContainer width="100%" height={260}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
          <XAxis dataKey="step" />
          <YAxis unit=" SOL" width={70} />
          <Tooltip />
          <Legend />
          <Line type="monotone" dataKey="without" name="Without spend" stroke="#6b7280" strokeDasharray="5 5" dot={false} />
          <Line type="monotone" dataKey="with" name="With spend" stroke="#2563eb" dot />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

export function AgentEfficiencyChart({ points }: { points: EfficiencyPoint[] }) {
  return (
    <div className="rounded-lg border border-border p-4">
      <ResponsiveContainer width="100%" height={260}>
        <BarChart data={points}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
          <XAxis dataKey="agent" />
          <YAxis domain={[0, "auto"]} />
          <Tooltip />
          <Legend />
          <Bar dataKey="efficiency" name="Efficiency" fill="#2563eb" />
          <Bar dataKey="completed" name="Tasks completed" fill="#eab308" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
