import { Header } from "@/components/header";
import { Sidebar } from "@/components/sidebar";
import { getBoardClient } from "@/lib/agent-board/client";
import { buildAuditLog, projectSpend, round } from "@/lib/agent-board/model";
import { AgentEfficiencyChart, TreasuryProjectionChart } from "@/components/agent-board-charts";

export const revalidate = 300;

const fmt = (ts: number): string => new Date(ts * 1000).toISOString().replace("T", " ").slice(0, 16) + " UTC";

export default async function AgentBoardPage() {
  const client = await getBoardClient();
  const [state, past] = await Promise.all([client.getState(), client.analyzePast()]);
  const audit = buildAuditLog(state);
  const spends = state.task_history.map((t) => ({ task: t, proj: projectSpend(state, t) }));

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Header />
        <main className="flex-1 p-6 overflow-auto space-y-8">
          <div>
            <h1 className="text-2xl font-bold text-foreground mb-2">Agent Board</h1>
            <p className="text-muted-foreground">
              Simulate before spend: every proposed task is checked by a counterfactual before any treasury draw.
              {client.source === "demo" ? " Showing demo data." : ` Read-only snapshot of the live board, generated ${client.generatedAt ?? "unknown"}. Wallet addresses are truncated.`} Nothing on this page can spend.
            </p>
          </div>

          <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              ["Treasury", `${state.treasury_sol} SOL`],
              ["Tasks", String(past.total_tasks)],
              ["In progress", String(past.in_progress_tasks)],
              ["Rejected / failed", String(past.recent_failures.length)],
            ].map(([k, v]) => (
              <div key={k} className="rounded-lg border border-border p-4">
                <div className="text-sm text-muted-foreground">{k}</div>
                <div className="text-xl font-semibold text-foreground">{v}</div>
              </div>
            ))}
          </section>

          <section className="grid gap-4 lg:grid-cols-2">
            <div>
              <h2 className="text-lg font-semibold text-foreground mb-3">Treasury what-if (AR(1), illustrative)</h2>
              <TreasuryProjectionChart series={spends.map(({ task: t, proj }) => ({ taskId: t.task_id, label: `${t.target_agent}: ${t.instruction.slice(0, 50)} (${t.budget_sol} SOL)`, approved: proj.approved, baseline: proj.baseline, withSpend: proj.withSpend, method: proj.method === "ar1" ? "AR(1) fit" : "flat fallback" }))} />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-foreground mb-3">Agent efficiency</h2>
              <AgentEfficiencyChart points={Object.entries(state.agents).map(([agent, a]) => ({ agent, efficiency: a.efficiency, completed: past.agent_velocity[agent]?.completed_count ?? 0 }))} />
            </div>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">Agents</h2>
            <table className="w-full text-sm">
              <thead><tr className="text-left text-muted-foreground"><th>Agent</th><th>Status</th><th>Efficiency</th><th>Completed</th><th>Last task</th></tr></thead>
              <tbody>
                {Object.entries(state.agents).map(([name, a]) => (
                  <tr key={name} className="border-t border-border">
                    <td className="py-2">{name}</td><td>{a.status}</td><td>{a.efficiency}</td>
                    <td>{past.agent_velocity[name]?.completed_count ?? 0}</td><td className="font-mono text-xs">{a.last_task_id ?? "none"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">Proposed spends and simulations</h2>
            <table className="w-full text-sm">
              <thead><tr className="text-left text-muted-foreground"><th>Task</th><th>Agent</th><th>Budget</th><th>Decision</th><th>Risk</th><th>Success p</th><th>What-if treasury (6 steps)</th><th>Status</th></tr></thead>
              <tbody>
                {spends.map(({ task: t, proj }) => (
                  <tr key={t.task_id} className="border-t border-border align-top">
                    <td className="py-2 max-w-xs">{t.instruction}</td>
                    <td>{t.target_agent}</td>
                    <td>{t.budget_sol} SOL</td>
                    <td className={t.simulation.approval_status === "APPROVED" ? "text-green-600" : "text-red-600"}>{t.simulation.approval_status}</td>
                    <td>{t.simulation.risk_factor}</td>
                    <td>{t.simulation.counterfactual_success_probability}</td>
                    <td className="font-mono text-xs">
                      <div>base {proj.baseline.map((v) => round(v, 2)).join(" → ")}</div>
                      <div>spend {proj.withSpend.map((v) => round(v, 2)).join(" → ")}</div>
                      <div className="text-muted-foreground">{proj.method === "ar1" ? "AR(1) fit" : "flat fallback"}{proj.approved ? "" : " · blocked, never spent"}</div>
                    </td>
                    <td>{t.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">Audit log</h2>
            <ol className="text-sm space-y-1">
              {audit.map((e, i) => (
                <li key={i} className="border-t border-border pt-1">
                  <span className="font-mono text-xs text-muted-foreground">{fmt(e.at)}</span>{" "}
                  <strong>{e.event}</strong> · {e.agent}{e.taskId && ` · ${e.taskId}`} · {e.detail}
                </li>
              ))}
            </ol>
          </section>
        </main>
      </div>
    </div>
  );
}
