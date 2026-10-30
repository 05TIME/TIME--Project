import { describe, expect, it } from "vitest";
import { createHash } from "node:crypto";
import { createTimeoeMcpHandler, configFromEnv } from "@/lib/timeoe-mcp";
import { InMemoryTraceStore } from "@/time-app/timeoe-engine/src/traces";
import { runAgent, lekkiPricingAgent, LEKKI_EXAMPLE_INPUT } from "@/time-app/timeoe-engine/src/engine/agent";
import { runWhatIfTool } from "@/time-app/timeoe-engine/src/mcp/what-if";

const h = (s: string) => createHash("sha256").update(s).digest("hex");
const TOKENS = JSON.stringify({ sales: h("test-token-sales"), shop: h("test-token-shop") });

function setup(checkMode: "warn" | "block" = "warn") {
  const store = new InMemoryTraceStore();
  const cfg = { ...configFromEnv({ MCP_BOT_TOKENS: TOKENS }), store, checkMode, now: () => "2026-10-30T12:00:00.000Z" };
  return { store, handler: createTimeoeMcpHandler(cfg) };
}

let id = 0;
async function rpc(handler: (r: Request) => Promise<Response>, method: string, params: object, token?: string) {
  const res = await handler(new Request("http://localhost/api/mcp", {
    method: "POST",
    headers: { "content-type": "application/json", accept: "application/json, text/event-stream", ...(token ? { authorization: `Bearer ${token}` } : {}) },
    body: JSON.stringify({ jsonrpc: "2.0", id: ++id, method, params }),
  }));
  const text = await res.text();
  let body: any = null;
  try { body = JSON.parse(text); } catch {
    const line = text.split("\n").find((l) => l.startsWith("data:"));
    body = line ? JSON.parse(line.slice(5)) : text;
  }
  return { status: res.status, body };
}
const call = async (handler: any, name: string, args: object, token = "test-token-sales") => {
  const r = await rpc(handler, "tools/call", { name, arguments: args }, token);
  const result = r.body?.result;
  return { status: r.status, isError: !!result?.isError, data: result ? JSON.parse(result.content[0].text) : r.body };
};

describe("/api/mcp auth", () => {
  it("401 without token or with a bad token", async () => {
    const { handler } = setup();
    expect((await rpc(handler, "tools/list", {})).status).toBe(401);
    expect((await rpc(handler, "tools/list", {}, "wrong")).status).toBe(401);
  });
  it("lists the three tools with a good token", async () => {
    const { handler } = setup();
    const r = await rpc(handler, "tools/list", {}, "test-token-sales");
    expect(r.status).toBe(200);
    expect(r.body.result.tools.map((t: any) => t.name).sort()).toEqual(["timeoe_check_action", "timeoe_log_decision", "timeoe_what_if"]);
  });
});

describe("/api/mcp tools", () => {
  it("check_action respects CHECK_MODE and reports storage", async () => {
    const action = { bot: "sales", kind: "post", target: "x", details: { text: "use code SUMMER" } };
    const w = await call(setup("warn").handler, "timeoe_check_action", { action });
    expect(w.data).toMatchObject({ verdict: "warn", mode: "warn", storage: "memory (not persisted)" });
    expect((await call(setup("block").handler, "timeoe_check_action", { action })).data.verdict).toBe("block");
  });

  it("check_action rejects a bot name that differs from the token's bot", async () => {
    const r = await call(setup().handler, "timeoe_check_action", { action: { bot: "shop", kind: "post", target: "x" } });
    expect(r.isError).toBe(true);
    expect(r.data.error).toMatch(/does not match/);
  });

  it("log_decision logs under the token's bot and chains", async () => {
    const { handler, store } = setup();
    const d = { action: { bot: "sales", kind: "post", target: "x" }, outcome: "posted", reason: "ok" };
    const a = await call(handler, "timeoe_log_decision", d);
    const b = await call(handler, "timeoe_log_decision", d);
    expect(a.data.traceId).toBe("sales:0");
    expect(b.data.entry.prevHash).toBe(a.data.entry.hash);
    expect((await store.list("sales")).length).toBe(2);
    expect((await call(handler, "timeoe_log_decision", { ...d, bot: "shop" })).isError).toBe(true);
    expect(await store.list("shop")).toEqual([]);
  });

  it("what_if by traceId: replays, diffs side by side, never modifies the store", async () => {
    const { handler, store } = setup();
    const engineTrace = runAgent(lekkiPricingAgent, LEKKI_EXAMPLE_INPUT);
    await call(handler, "timeoe_log_decision", { action: { bot: "sales", kind: "edit", target: "rate" }, inputs: { engineTrace }, outcome: "priced", reason: "lekki run" });
    const before = JSON.stringify(await store.list("sales"));
    const change = { step: 3, patch: { bookingRequest: { nights: 3, offeredRateNgn: 90000 } } };
    const r = await call(handler, "timeoe_what_if", { traceId: "sales:0", change });
    expect(r.isError).toBe(false);
    expect(r.data.replay).toMatchObject({ ok: true, entryHashOk: true, storedHash: engineTrace.traceHash });
    expect(r.data.ranWhatIf).toBe(true);
    const s3 = r.data.sideBySide[3];
    expect(s3).toMatchObject({ changed: true, before: { ruleFired: "counter-booking" }, after: { ruleFired: "accept-booking" } });
    expect(r.data.sideBySide).toHaveLength(engineTrace.steps.length);
    expect(JSON.stringify(await store.list("sales"))).toBe(before);
  });

  it("what_if with an inline trace detects a hash mismatch and refuses", async () => {
    const { handler } = setup();
    const t = runAgent(lekkiPricingAgent, LEKKI_EXAMPLE_INPUT);
    const tampered = structuredClone(t);
    (tampered.steps[2].action as any).type = "forged";
    const r = await call(handler, "timeoe_what_if", { trace: tampered, change: { step: 0, patch: {} } });
    expect(r.data).toMatchObject({ ranWhatIf: false, replay: { ok: false, firstMismatchStep: 2 } });
    const ok = await call(handler, "timeoe_what_if", { trace: t, change: { step: 0, patch: {} } });
    expect(ok.data.ranWhatIf).toBe(true);
    expect(ok.data.sideBySide.every((s: any) => !s.changed)).toBe(true);
  });

  it("what_if by traceId detects a tampered stored entry", async () => {
    const store = new InMemoryTraceStore();
    const { logDecision } = await import("@/time-app/timeoe-engine/src/traces");
    await logDecision({ bot: "sales", action: { bot: "sales", kind: "edit", target: "rate" }, inputs: { engineTrace: runAgent(lekkiPricingAgent, LEKKI_EXAMPLE_INPUT) }, outcome: "o", reason: "r" }, store);
    store._raw("sales")[0].decision.reason = "edited later";
    const r = await runWhatIfTool({ traceId: "sales:0", change: { step: 0, patch: {} } }, store);
    expect(r).toMatchObject({ ranWhatIf: false, replay: { ok: false, entryHashOk: false } });
  });
});

describe("configFromEnv", () => {
  it("uses memory without Supabase env and defaults CHECK_MODE to warn", () => {
    const c = configFromEnv({ MCP_BOT_TOKENS: TOKENS });
    expect(c.storage).toBe("memory (not persisted)");
    expect(c.checkMode).toBe("warn");
    expect(configFromEnv({ CHECK_MODE: "block" }).checkMode).toBe("block");
    expect(() => configFromEnv({ MCP_BOT_TOKENS: JSON.stringify({ x: "nothex" }) })).toThrow();
  });
});
