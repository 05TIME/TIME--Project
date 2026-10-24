/**
 * Types matching the time-corp-board MCP tool shapes
 * (board_get_state, board_analyze_past, board_manipulate_time,
 * board_dispatch_task, board_complete_task, board_ingest_telemetry).
 */

export type ApprovalStatus = "APPROVED" | "REJECTED";
export type TaskStatus = "in_progress" | "completed" | "failed" | "rejected";
export type AgentStatus = "idle" | "busy" | (string & {});

export interface Simulation {
  approval_status: ApprovalStatus;
  risk_factor: number;
  projected_roi: number;
  counterfactual_success_probability: number;
  rationale: string;
  proposed_strategy: string;
  budget_sol: number;
  allocation: Record<string, number> | null;
  treasury_sol: number;
}

export interface BoardTask {
  task_id: string;
  target_agent: string;
  instruction: string;
  budget_sol: number;
  status: TaskStatus;
  timestamp: number; // unix seconds
  deadline: number; // unix seconds
  deadline_hours?: number;
  output_schema: string | null;
  result: string | null;
  success: boolean | null;
  simulation: Simulation;
  completed_at?: number;
}

export interface BoardAgent {
  status: AgentStatus;
  efficiency: number;
  last_task_id: string | null;
}

export interface TelemetrySample {
  source: string;
  metrics: Record<string, unknown>;
  timestamp: number;
}

export interface BoardState {
  treasury_sol: number;
  treasury_address: string;
  agents: Record<string, BoardAgent>;
  task_history: BoardTask[];
  telemetry: TelemetrySample[];
  task_seq: number;
  created_at: number;
  updated_at: number;
  metadata: Record<string, unknown>;
}

export interface PastAnalysis {
  total_tasks: number;
  completed_tasks: number;
  failed_tasks: number;
  in_progress_tasks: number;
  treasury_remaining_sol: number;
  agent_velocity: Record<string, { completed_count: number; efficiency: number }>;
  recent_failures: BoardTask[];
}

// Tool inputs (write tools are typed but not used by the dashboard)
export interface ManipulateTimeInput { strategy: string; budget_sol: number; allocation_json?: string | null }
export interface DispatchTaskInput { target_agent: string; instruction: string; budget_sol?: number; deadline_hours?: number; output_schema_json?: string | null }
export interface CompleteTaskInput { task_id: string; result: string; success: boolean }
export interface IngestTelemetryInput { source: string; metrics_json: string }
