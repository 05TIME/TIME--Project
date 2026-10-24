import type { BoardState, PastAnalysis } from "./types";
import type { BoardSnapshot } from "./redact";
import { demoAnalysis, demoState } from "./demo-data";
import bundled from "@/data/board-snapshot.json";

/**
 * Read-only client used by the dashboard. Write tools (dispatch, complete,
 * telemetry, manipulate_time) are intentionally not part of this interface.
 */
export interface BoardReadClient {
  readonly source: "demo" | "snapshot" | "remote-snapshot";
  readonly generatedAt: string | null;
  getState(): Promise<BoardState>;
  analyzePast(): Promise<PastAnalysis>;
}

/** Demo adapter: fixed sample data for tests and offline use. */
export class DemoBoardClient implements BoardReadClient {
  readonly source = "demo" as const;
  readonly generatedAt = null;
  async getState(): Promise<BoardState> { return structuredClone(demoState); }
  async analyzePast(): Promise<PastAnalysis> { return structuredClone(demoAnalysis); }
}

/** Snapshot adapter: a redacted JSON snapshot produced by scripts/refresh-board-snapshot.ts. */
export class SnapshotBoardClient implements BoardReadClient {
  constructor(private readonly snap: BoardSnapshot, readonly source: "snapshot" | "remote-snapshot" = "snapshot") {}
  get generatedAt(): string { return this.snap.generated_at; }
  async getState(): Promise<BoardState> { return structuredClone(this.snap.state); }
  async analyzePast(): Promise<PastAnalysis> { return structuredClone(this.snap.analysis); }
}

export function isSnapshot(x: unknown): x is BoardSnapshot {
  const s = x as BoardSnapshot | null;
  return !!s && typeof s.generated_at === "string" && !!s.state && Array.isArray(s.state.task_history) && !!s.analysis;
}

/**
 * Order: BOARD_SNAPSHOT_URL (a public JSON snapshot, refreshed every 5 minutes)
 * → the bundled data/board-snapshot.json → demo data.
 */
export async function getBoardClient(): Promise<BoardReadClient> {
  const url = process.env.BOARD_SNAPSHOT_URL;
  if (url) {
    try {
      const res = await fetch(url, { next: { revalidate: 300 } });
      const json: unknown = await res.json();
      if (res.ok && isSnapshot(json)) return new SnapshotBoardClient(json, "remote-snapshot");
    } catch { /* fall back */ }
  }
  if (isSnapshot(bundled)) return new SnapshotBoardClient(bundled as BoardSnapshot);
  return new DemoBoardClient();
}
