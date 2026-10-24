/**
 * Build data/board-snapshot.json from raw read-only board output.
 *
 *   npm run board:snapshot -- <state.json> <analysis.json>
 *
 * <state.json> is the output of board_get_state; <analysis.json> is the output of board_analyze_past.
 * Get both from the time-corp-board MCP connector. Never use the write tools here.
 * Input may be wrapped in other text; the outermost {...} is parsed.
 */
import { readFileSync, writeFileSync } from "node:fs";
import { buildSnapshot } from "../lib/agent-board/redact";

const readJson = (p: string): unknown => {
  const t = readFileSync(p, "utf8");
  return JSON.parse(t.slice(t.indexOf("{"), t.lastIndexOf("}") + 1));
};

const [statePath, analysisPath, out = "data/board-snapshot.json"] = process.argv.slice(2);
if (!statePath || !analysisPath) {
  console.error("usage: npm run board:snapshot -- <state.json> <analysis.json> [out]");
  process.exit(1);
}
const snap = buildSnapshot(readJson(statePath) as never, readJson(analysisPath) as never);
writeFileSync(out, JSON.stringify(snap, null, 2) + "\n");
console.log(`wrote ${out} (${snap.state.task_history.length} tasks, generated ${snap.generated_at})`);
