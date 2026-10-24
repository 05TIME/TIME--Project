import type { BoardState, BoardTask, PastAnalysis, Simulation } from "./types";

/**
 * Demo snapshot shaped from the real time-corp-board (read-only board_get_state
 * and board_analyze_past, 24 Oct 2026). Long instructions are shortened.
 */
const sim = (s: Partial<Simulation> & Pick<Simulation, "approval_status" | "budget_sol" | "treasury_sol" | "rationale" | "proposed_strategy">): Simulation => ({
  risk_factor: 0.15, projected_roi: 0, counterfactual_success_probability: 0.85, allocation: null, ...s,
});

const tasks: BoardTask[] = [
  {
    task_id: "TASK_1787234054_1", target_agent: "dev_agent", instruction: "Ship TIME-CORP v1 board engine",
    budget_sol: 0.5, status: "in_progress", timestamp: 1787234054, deadline: 1787320454, deadline_hours: 24,
    output_schema: null, result: null, success: null,
    simulation: sim({ approval_status: "APPROVED", projected_roi: 1.02, budget_sol: 0.5, treasury_sol: 5.0,
      rationale: "Budget 0.5000 SOL is under 50% of treasury 5.0000 SOL. Simulated success is high; APPROVED.",
      proposed_strategy: "dispatch:dev:Ship TIME-CORP v1 board engine" }),
  },
  {
    task_id: "TASK_1787234054_2", target_agent: "growth_agent", instruction: "Draft growth loop for TIME-CORP",
    budget_sol: 0.2, status: "in_progress", timestamp: 1787234054, deadline: 1787320454, deadline_hours: 24,
    output_schema: null, result: null, success: null,
    simulation: sim({ approval_status: "APPROVED", projected_roi: 0.408, budget_sol: 0.2, treasury_sol: 4.5,
      rationale: "Budget 0.2000 SOL is under 50% of treasury 4.5000 SOL. Simulated success is high; APPROVED.",
      proposed_strategy: "dispatch:growth:Draft growth loop for TIME-CORP" }),
  },
  {
    task_id: "TASK_1787234054_3", target_agent: "ops_agent", instruction: "Oversized treasury drain",
    budget_sol: 10.0, status: "rejected", timestamp: 1787234054, deadline: 1787234054,
    output_schema: null, result: null, success: false,
    simulation: sim({ approval_status: "REJECTED", risk_factor: 1.0, counterfactual_success_probability: 0, budget_sol: 10.0, treasury_sol: 4.3,
      rationale: "Budget 10.0000 SOL exceeds treasury 4.3000 SOL. Counterfactual spend REJECTED; no funds deducted.",
      proposed_strategy: "dispatch:ops:Oversized treasury drain" }),
  },
  {
    task_id: "TASK_1787234627_4", target_agent: "growth_agent", instruction: "Ship first priced SKU: TIMEPHANTOM Causal Brief (48h turnaround); hold posting until Randy confirms",
    budget_sol: 0, status: "in_progress", timestamp: 1787234627, deadline: 1787407427, deadline_hours: 48,
    output_schema: null, result: null, success: null,
    simulation: sim({ approval_status: "APPROVED", risk_factor: 0.1, counterfactual_success_probability: 0.9, budget_sol: 0, treasury_sol: 4.3,
      rationale: "Zero-budget dispatch is allowed at residual risk 0.1. No treasury draw; counterfactual still APPROVED.",
      proposed_strategy: "dispatch:growth_agent:Ship first priced SKU" }),
  },
  {
    task_id: "TASK_1787234886_5", target_agent: "dev_agent", instruction: "Ship manipulate_time as an x402-gated HTTPS API (sandbox first)",
    budget_sol: 0, status: "completed", timestamp: 1787234886, deadline: 1787407686, deadline_hours: 48,
    output_schema: null, success: true, completed_at: 1787235478,
    result: "Sandbox shipped on localhost; no public URL yet. Blockers: no public HTTPS without cloud login. No treasury spend.",
    simulation: sim({ approval_status: "APPROVED", risk_factor: 0.1, counterfactual_success_probability: 0.9, budget_sol: 0, treasury_sol: 4.3,
      rationale: "Zero-budget dispatch is allowed at residual risk 0.1. No treasury draw; counterfactual still APPROVED.",
      proposed_strategy: "dispatch:dev_agent:Ship manipulate_time as an x402-gated API" }),
  },
];

export const demoState: BoardState = {
  treasury_sol: 4.3,
  treasury_address: "G6MHaPZqC5Mes4Yr84pAbc6GcsFAJ8M7NZptUyPcAfuD",
  agents: {
    dev_agent: { status: "idle", efficiency: 1.05, last_task_id: "TASK_1787234886_5" },
    growth_agent: { status: "busy", efficiency: 1.0, last_task_id: "TASK_1787234627_4" },
    finance_agent: { status: "idle", efficiency: 1.0, last_task_id: null },
    ops_agent: { status: "idle", efficiency: 1.0, last_task_id: null },
  },
  task_history: tasks,
  telemetry: [
    { source: "board", metrics: { event: "roster_seated", agents: ["TIME Engineer", "TIME Growth", "TIME Finance", "TIME Ops"] }, timestamp: 1787234222 },
    { source: "dev_agent", metrics: { event: "engineer_online", picked_up: "TASK_1787234886_5", blockers: ["github_not_connected", "gcloud_missing", "docker_missing"] }, timestamp: 1787234949 },
  ],
  task_seq: 5,
  created_at: 1787234054,
  updated_at: 1787235478,
  metadata: { engine: "TIME-CORP v1", note: "treasury_address is read-only metadata; no signing/spend-from-wallet" },
};

export const demoAnalysis: PastAnalysis = {
  total_tasks: 5, completed_tasks: 1, failed_tasks: 0, in_progress_tasks: 3, treasury_remaining_sol: 4.3,
  agent_velocity: {
    dev_agent: { completed_count: 1, efficiency: 1.05 },
    growth_agent: { completed_count: 0, efficiency: 1.0 },
    finance_agent: { completed_count: 0, efficiency: 1.0 },
    ops_agent: { completed_count: 0, efficiency: 1.0 },
  },
  recent_failures: [tasks[2]],
};
