import { describe, expect, it } from "vitest";
import { buildSnapshot, redactText, truncateAddress } from "../lib/agent-board/redact";
import { getBoardClient, isSnapshot } from "../lib/agent-board/client";
import { demoAnalysis, demoState } from "../lib/agent-board/demo-data";

const ADDR = "G6MHaPZqC5Mes4Yr84pAbc6GcsFAJ8M7NZptUyPcAfuD";

describe("snapshot redaction", () => {
  it("truncates wallet addresses and strips local URLs, paths and token-like strings", () => {
    const r = redactText(`pay_to=${ADDR} health=http://127.0.0.1:1402/health file=/workspace/x/receipt.txt key sk-abcdefghijklmnop1234`)!;
    expect(r).not.toContain(ADDR);
    expect(r).toContain(truncateAddress(ADDR));
    expect(r).not.toMatch(/127\.0\.0\.1|\/workspace|sk-abcdef/);
  });

  it("caps long text", () => {
    expect(redactText("a".repeat(500))!.length).toBe(220);
  });

  it("builds a valid snapshot with no full address and allow-listed telemetry", () => {
    const s = { ...structuredClone(demoState), telemetry: [{ source: "board", metrics: { event: "x", channel_id: "secret-id" }, timestamp: 1 }] };
    const snap = buildSnapshot(s, structuredClone(demoAnalysis), new Date("2026-10-24T00:00:00Z"));
    expect(isSnapshot(snap)).toBe(true);
    const json = JSON.stringify(snap);
    expect(json).not.toContain(ADDR);
    expect(json).not.toContain("secret-id");
    expect(snap.generated_at).toBe("2026-10-24T00:00:00.000Z");
  });
});

describe("client selection", () => {
  it("uses the bundled snapshot when no URL is set", async () => {
    delete process.env.BOARD_SNAPSHOT_URL;
    const c = await getBoardClient();
    expect(c.source).toBe("snapshot");
    expect(JSON.stringify(await c.getState())).not.toContain(ADDR);
  });
});
