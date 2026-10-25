import { describe, expect, it } from "vitest";
import { POST } from "@/app/api/agent/route";
import { LEKKI_EXAMPLE_INPUT } from "@/time-app/timeoe-engine/src/engine/agent";

const post = (body: unknown) => POST(new Request("http://x/api/agent", { method: "POST", body: typeof body === "string" ? body : JSON.stringify(body) }));

describe("POST /api/agent", () => {
  it("runs and replays", async () => {
    const res = await post({ mode: "run", agentId: "lekki-pricing", ...LEKKI_EXAMPLE_INPUT });
    expect(res.status).toBe(200);
    const { trace } = await res.json();
    const rep = await post({ mode: "replay", agentId: "lekki-pricing", trace });
    const body = await rep.json();
    expect(body.ok).toBe(true);
    expect(body.traceHash).toBe(trace.traceHash);
  });
  it("rejects invalid input with 400", async () => {
    expect((await post({ mode: "run", agentId: "lekki-pricing" })).status).toBe(400);
    expect((await post("not json")).status).toBe(400);
  });
  it("unknown agent 404, bad step 422", async () => {
    expect((await post({ mode: "run", ...LEKKI_EXAMPLE_INPUT, agentId: "nope" })).status).toBe(404);
    expect((await post({ mode: "whatIf", agentId: "lekki-pricing", ...LEKKI_EXAMPLE_INPUT, change: { step: 99, patch: {} } })).status).toBe(422);
  });
});
