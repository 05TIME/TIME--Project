import type { BoardState, PastAnalysis } from "./types";
import { demoAnalysis, demoState } from "./demo-data";

/**
 * Read-only client used by the dashboard. Write tools (dispatch, complete,
 * telemetry, manipulate_time) are intentionally not part of this interface:
 * the board page never spends or mutates state.
 */
export interface BoardReadClient {
  readonly source: "demo" | "live";
  getState(): Promise<BoardState>;
  analyzePast(): Promise<PastAnalysis>;
}

/** Demo adapter: a snapshot of the real board (read via board_get_state / board_analyze_past). No credentials needed. */
export class DemoBoardClient implements BoardReadClient {
  readonly source = "demo" as const;
  async getState(): Promise<BoardState> { return structuredClone(demoState); }
  async analyzePast(): Promise<PastAnalysis> { return structuredClone(demoAnalysis); }
}

export function getBoardClient(): BoardReadClient {
  // A live MCP adapter can be added later behind an env flag; demo is the default.
  return new DemoBoardClient();
}
