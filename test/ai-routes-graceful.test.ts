import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const generateText = vi.fn();
vi.mock("ai", () => ({ generateText: (...a: unknown[]) => generateText(...a) }));

import { POST as causality } from "@/app/api/causality/route";
import { POST as counterfactual } from "@/app/api/counterfactual/route";
import { POST as botAnalyze } from "@/app/api/bot/analyze/route";

const ENV_KEYS = ["AI_GATEWAY_API_KEY", "VERCEL_OIDC_TOKEN", "VERCEL", "TIMEOE_BOT_API_KEY"] as const;
let saved: Record<string, string | undefined>;
const NOT_CONFIGURED = { error: "AI features are not configured on this deployment" };
const gatewayCardError = () => Object.assign(new Error("AI Gateway requires a valid credit card on file to service requests"), { name: "GatewayAuthenticationError", statusCode: 403 });

const routes = [
  { name: "/api/causality", POST: causality, body: { cause: "a", effect: "b", timestamps: [] }, ok: { causalStrength: 0.5 } },
  { name: "/api/counterfactual", POST: counterfactual, body: { scenario: "s", baselineData: {}, intervention: {}, timeRange: "1d" }, ok: { narrative: "n" } },
  { name: "/api/bot/analyze", POST: botAnalyze, body: { query: "does x cause y", userId: "u", chatId: "c" }, ok: null },
];
const req = (body: unknown) => new Request("http://localhost/x", { method: "POST", body: JSON.stringify(body) });

beforeEach(() => {
  saved = Object.fromEntries(ENV_KEYS.map((k) => [k, process.env[k]]));
  ENV_KEYS.forEach((k) => delete process.env[k]);
  generateText.mockReset();
  vi.spyOn(console, "error").mockImplementation(() => {});
  vi.spyOn(console, "log").mockImplementation(() => {});
});
afterEach(() => {
  ENV_KEYS.forEach((k) => (saved[k] === undefined ? delete process.env[k] : (process.env[k] = saved[k])));
  vi.restoreAllMocks();
});

describe.each(routes)("$name graceful gateway handling", ({ POST, body, ok }) => {
  it("503 without gateway config, model never called", async () => {
    const res = await POST(req(body));
    expect(res.status).toBe(503);
    expect(await res.json()).toEqual(NOT_CONFIGURED);
    expect(generateText).not.toHaveBeenCalled();
  });

  it("503 with clean message when the gateway rejects (credit card 403)", async () => {
    process.env.VERCEL = "1";
    generateText.mockRejectedValue(gatewayCardError());
    const res = await POST(req(body));
    expect(res.status).toBe(503);
    const json = await res.json();
    expect(json).toEqual(NOT_CONFIGURED);
    expect(JSON.stringify(json)).not.toMatch(/credit card/);
  });

  it("200 when the gateway works", async () => {
    process.env.AI_GATEWAY_API_KEY = "test-not-a-real-key";
    generateText.mockResolvedValue({ text: ok ? JSON.stringify(ok) : "📊 Analysis Result", usage: {} });
    const res = await POST(req(body));
    expect(res.status).toBe(200);
  });

  it("500 without internals on other failures", async () => {
    process.env.AI_GATEWAY_API_KEY = "test-not-a-real-key";
    generateText.mockRejectedValue(new Error("boom at /internal/secret/path"));
    const res = await POST(req(body));
    expect(res.status).toBe(500);
    expect(JSON.stringify(await res.json())).not.toMatch(/internal\/secret/);
  });
});

it("/api/bot/analyze still enforces its bot API key before the gateway check", async () => {
  process.env.TIMEOE_BOT_API_KEY = "test-bot-key";
  const res = await botAnalyze(req({ query: "q" }));
  expect(res.status).toBe(401);
});
