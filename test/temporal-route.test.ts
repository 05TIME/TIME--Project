import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const generateText = vi.fn();
vi.mock("ai", () => ({ generateText: (...a: unknown[]) => generateText(...a) }));

import { POST } from "@/app/api/temporal/route";
import { isGatewayUnavailableError } from "@/lib/ai-gateway";

const req = (body: unknown) => new Request("http://localhost/api/temporal", { method: "POST", body: typeof body === "string" ? body : JSON.stringify(body) });
const ENV_KEYS = ["AI_GATEWAY_API_KEY", "VERCEL_OIDC_TOKEN", "VERCEL"] as const;
let saved: Record<string, string | undefined>;

beforeEach(() => {
  saved = Object.fromEntries(ENV_KEYS.map((k) => [k, process.env[k]]));
  ENV_KEYS.forEach((k) => delete process.env[k]);
  generateText.mockReset();
  vi.spyOn(console, "error").mockImplementation(() => {});
});
afterEach(() => {
  ENV_KEYS.forEach((k) => (saved[k] === undefined ? delete process.env[k] : (process.env[k] = saved[k])));
  vi.restoreAllMocks();
});

describe("/api/temporal graceful gateway handling", () => {
  it("503 without any gateway config, and never calls the model", async () => {
    const res = await POST(req({ prompt: "x" }));
    expect(res.status).toBe(503);
    expect(await res.json()).toEqual({ error: "AI features are not configured on this deployment" });
    expect(generateText).not.toHaveBeenCalled();
  });

  it("503 with a clean message when the gateway rejects (credit card 403), no internals leaked", async () => {
    process.env.VERCEL = "1";
    generateText.mockRejectedValue(Object.assign(new Error("AI Gateway requires a valid credit card on file to service requests"), { name: "GatewayAuthenticationError", statusCode: 403 }));
    const res = await POST(req({ prompt: "x" }));
    expect(res.status).toBe(503);
    const body = await res.json();
    expect(body).toEqual({ error: "AI features are not configured on this deployment" });
    expect(JSON.stringify(body)).not.toMatch(/credit card/);
  });

  it("200 with the model's JSON when the gateway works", async () => {
    process.env.AI_GATEWAY_API_KEY = "test-not-a-real-key";
    generateText.mockResolvedValue({ text: JSON.stringify({ causalityScore: 0.9, isCausal: true }) });
    const res = await POST(req({ prompt: "x", data: { a: [1, 2] } }));
    expect(res.status).toBe(200);
    expect(await res.json()).toMatchObject({ causalityScore: 0.9, isCausal: true, engine: "$TIMEOE + Grok" });
  });

  it("500 generic (no internals) on other failures; 400 on bad JSON", async () => {
    process.env.AI_GATEWAY_API_KEY = "test-not-a-real-key";
    generateText.mockResolvedValue({ text: "not json at /internal/path" });
    const res = await POST(req({ prompt: "x" }));
    expect(res.status).toBe(500);
    const body = await res.json();
    expect(body.error).toBe("Analysis failed");
    expect(JSON.stringify(body)).not.toMatch(/internal|Unexpected token/);
    expect((await POST(req("{bad"))).status).toBe(400);
  });

  it("isGatewayUnavailableError classification", () => {
    expect(isGatewayUnavailableError({ statusCode: 401 })).toBe(true);
    expect(isGatewayUnavailableError(new Error("wrapped", { cause: { status: 403 } }))).toBe(true);
    expect(isGatewayUnavailableError(new SyntaxError("Unexpected token"))).toBe(false);
    expect(isGatewayUnavailableError(null)).toBe(false);
  });
});
