import { createMcpHandler, withMcpAuth } from "mcp-handler";
import { z } from "zod4";
import { checkAction, starterRulePack, CheckModeSchema, type CheckMode } from "@/time-app/timeoe-engine/src/rules";
import { InMemoryTraceStore, logDecision, type TraceStore } from "@/time-app/timeoe-engine/src/traces";
import { SupabaseTraceStore } from "@/time-app/timeoe-engine/src/traces/supabase-store";
import { botForToken, parseBotTokens } from "@/time-app/timeoe-engine/src/mcp/auth";
import { runWhatIfTool } from "@/time-app/timeoe-engine/src/mcp/what-if";

export interface TimeoeMcpConfig {
  tokens: Map<string, Buffer>;
  store: TraceStore;
  storage: string;
  checkMode: CheckMode;
  now?: () => string;
}

let memoryStore: InMemoryTraceStore | null = null;

/** Build config from env. Supabase only when both env vars are set; otherwise a process-local memory store. */
export function configFromEnv(env: Record<string, string | undefined> = process.env): TimeoeMcpConfig {
  const useSupabase = !!(env.SUPABASE_URL && env.SUPABASE_SERVICE_ROLE_KEY);
  return {
    tokens: parseBotTokens(env.MCP_BOT_TOKENS),
    store: useSupabase ? new SupabaseTraceStore() : (memoryStore ??= new InMemoryTraceStore()),
    storage: useSupabase ? "supabase" : "memory (not persisted)",
    checkMode: CheckModeSchema.catch("warn").parse(env.CHECK_MODE ?? "warn"),
  };
}

const actionV4 = z.object({ bot: z.string(), kind: z.enum(["post", "spend", "send", "edit"]), target: z.string(), details: z.record(z.string(), z.unknown()).optional() });

export function createTimeoeMcpHandler(cfg: TimeoeMcpConfig): (req: Request) => Promise<Response> {
  const ok = (body: object) => ({ content: [{ type: "text" as const, text: JSON.stringify({ ...body, storage: cfg.storage }) }] });
  const fail = (msg: string) => ({ isError: true, content: [{ type: "text" as const, text: JSON.stringify({ error: msg, storage: cfg.storage }) }] });
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const botOf = (ctx: any): string | null => ctx?.http?.authInfo?.clientId ?? null;
  const wrap = async (fn: () => Promise<object>) => { try { return ok(await fn()); } catch (e) { return fail(e instanceof Error ? e.message : String(e)); } };

  const handler = createMcpHandler((server) => {
    server.registerTool("timeoe_check_action", {
      title: "Check action",
      description: "Check a proposed post/spend/send/edit against the deterministic TIMEŒ rule pack. Returns pass, warn or block with fired rules and the rule pack hash.",
      inputSchema: z.object({ action: actionV4 }),
    }, async ({ action }, ctx) => wrap(async () => {
      const bot = botOf(ctx);
      if (action.bot !== bot) throw new Error(`action.bot "${action.bot}" does not match authenticated bot "${bot}"`);
      return { mode: cfg.checkMode, ...checkAction(action, starterRulePack, { mode: cfg.checkMode }) };
    }));

    server.registerTool("timeoe_log_decision", {
      title: "Log decision",
      description: "Log a decision as a hash-chained, replayable trace entry for the authenticated bot. Put an engine trace in inputs.engineTrace to make it what-if-able as <bot>:<seq>.",
      inputSchema: z.object({
        bot: z.string().optional(), action: actionV4, inputs: z.record(z.string(), z.unknown()).optional(),
        outcome: z.string(), reason: z.string(), seed: z.number().int().optional(), checkResult: z.unknown().optional(),
      }),
    }, async (args, ctx) => wrap(async () => {
      const bot = botOf(ctx);
      if (args.bot !== undefined && args.bot !== bot) throw new Error(`bot "${args.bot}" does not match authenticated bot "${bot}"`);
      if (args.action.bot !== bot) throw new Error(`action.bot "${args.action.bot}" does not match authenticated bot "${bot}"`);
      const entry = await logDecision({ ...args, bot }, cfg.store, cfg.now ? { now: cfg.now } : {});
      return { traceId: `${entry.bot}:${entry.seq}`, entry };
    }));

    server.registerTool("timeoe_what_if", {
      title: "What-if replay",
      description: "Replay a past engine trace (by traceId <bot>:<seq> or inline trace), confirm it still matches its hash, then re-run with a changed observation and return a side-by-side decision diff. Never modifies stored traces.",
      inputSchema: z.object({
        traceId: z.string().optional(), trace: z.unknown().optional(),
        change: z.object({ step: z.number().int().min(0), patch: z.record(z.string(), z.unknown()) }),
      }),
    }, async (args) => wrap(() => runWhatIfTool(args, cfg.store) as Promise<object>));
  }, { serverInfo: { name: "timeoe-engine", version: "0.1.0" } });

  return withMcpAuth(handler, (_req, token) => {
    const bot = botForToken(token, cfg.tokens);
    return bot ? { token: token!, clientId: bot, scopes: [] } : undefined;
  }, { required: true });
}
