import { checkAction, starterRulePack } from "./check-action";
import { CheckModeSchema, type CheckResult } from "./schemas";

/** MCP-style tool (same shape as deterministicAgentTool in engine/agent/adapters.ts). */
export const checkActionTool = {
  name: "timeoe_check_action",
  description:
    "Check a bot's proposed action (post/spend/send/edit) against the deterministic TIMEŒ rule pack before acting. Returns pass, warn or block, the fired rules with reasons, and the rule pack version + sha256 hash.",
  inputSchema: {
    type: "object",
    required: ["action"],
    properties: {
      action: {
        type: "object",
        required: ["bot", "kind", "target"],
        properties: {
          bot: { type: "string" },
          kind: { type: "string", enum: ["post", "spend", "send", "edit"] },
          target: { type: "string" },
          details: { type: "object" },
        },
      },
      mode: { type: "string", enum: ["warn", "block"], default: "warn" },
    },
  } as Record<string, unknown>,
  invoke: async (input: unknown): Promise<CheckResult> => {
    const i = (input ?? {}) as { action?: unknown; mode?: unknown };
    const mode = CheckModeSchema.optional().parse(i.mode);
    return checkAction(i.action, starterRulePack, { mode });
  },
};
