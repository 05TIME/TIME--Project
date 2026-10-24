import { afterEach, describe, expect, it, vi } from "vitest";

// The AI call must never run for invalid input; fail loudly if it does.
vi.mock("ai", () => ({ generateText: vi.fn(async () => { throw new Error("generateText should not be called"); }) }));

import { POST as causality } from "../app/api/causality/route";
import { POST as temporal } from "../app/api/temporal/route";
import { POST as counterfactual } from "../app/api/counterfactual/route";
import { POST as botAnalyze } from "../app/api/bot/analyze/route";
import { GET as usageGet, POST as usagePost } from "../app/api/bot/usage/route";
import { POST as webhook } from "../app/api/bot/webhook/route";
import { generateText } from "ai";
import { BotAnalyzeInput, CausalityInput, TemporalInput } from "../lib/api-schemas";

const req = (body: unknown, headers: Record<string, string> = {}): Request =>
  new Request("http://test/api", { method: "POST", headers: { "content-type": "application/json", ...headers }, body: typeof body === "string" ? body : JSON.stringify(body) });

afterEach(() => { vi.unstubAllEnvs(); vi.mocked(generateText).mockClear(); });

describe("schemas", () => {
  it("accept valid input", () => {
    expect(CausalityInput.safeParse({ cause: [1, 2], effect: [2, 3] }).success).toBe(true);
    expect(TemporalInput.safeParse({ prompt: "trend?" }).success).toBe(true);
    expect(BotAnalyzeInput.parse({ query: "x" }).mode).toBe("quick");
  });
  it("reject bad input", () => {
    expect(CausalityInput.safeParse({ effect: [1] }).success).toBe(false);
    expect(TemporalInput.safeParse({ prompt: "" }).success).toBe(false);
    expect(TemporalInput.safeParse({ prompt: "a".repeat(5000) }).success).toBe(false);
    expect(BotAnalyzeInput.safeParse({ query: "x", mode: "turbo" }).success).toBe(false);
  });
});

describe("routes return 400 on invalid input without calling the model", () => {
  it.each([
    ["causality", causality, { effect: [1] }],
    ["temporal", temporal, { prompt: "" }],
    ["counterfactual", counterfactual, { baselineData: [] }],
    ["bot/analyze", botAnalyze, { query: 42 }],
    ["bot/usage", usagePost, { action: "increment" }],
  ] as const)("%s", async (_name, handler, body) => {
    const res = await handler(req(body));
    expect(res.status).toBe(400);
    expect((await res.json()).error).toBe("Invalid input");
    expect(generateText).not.toHaveBeenCalled();
  });

  it("malformed JSON is a 400", async () => {
    const res = await temporal(req("{not json"));
    expect(res.status).toBe(400);
    expect((await res.json()).error).toBe("Invalid JSON body");
  });
});

describe("auth and usage", () => {
  it("bot/analyze checks the API key before the body", async () => {
    vi.stubEnv("TIMEOE_BOT_API_KEY", "k");
    const res = await botAnalyze(req({ query: "hi" }));
    expect(res.status).toBe(401);
  });

  it("webhook rejects a wrong secret and accepts a valid update", async () => {
    vi.stubEnv("TELEGRAM_WEBHOOK_SECRET", "s");
    expect((await webhook(req({ update_id: 1 }, { "x-telegram-bot-api-secret-token": "bad" }))).status).toBe(403);
    const ok = await webhook(req({ update_id: 1, message: { chat: { id: 1 }, from: { id: 2 }, text: "hello" } }, { "x-telegram-bot-api-secret-token": "s" }));
    expect(ok.status).toBe(200);
  });

  it("usage increments and reports", async () => {
    const r = await usagePost(req({ userId: "u1", action: "increment" }));
    expect((await r.json()).usage.queriesUsed).toBe(1);
    const g = await usageGet(new Request("http://test/api?userId=u1"));
    expect((await g.json()).queriesUsed).toBe(1);
  });
});
