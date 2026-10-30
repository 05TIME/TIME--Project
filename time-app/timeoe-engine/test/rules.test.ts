import { describe, expect, it } from "vitest";
import { checkAction, checkActionTool, rulePackHash, starterRulePack, RulePackSchema } from "../src/rules";

const pass = (a: object, mode?: "warn" | "block") => checkAction(a, starterRulePack, { mode });

describe("checkAction rule pack", () => {
  it("golden rulePackHash for starter pack v1.0.0", () => {
    expect(starterRulePack.version).toBe("1.0.0");
    expect(rulePackHash(starterRulePack)).toBe("1a707553d11d635c622071a41dda7211a7703081ed9f5fff5165f135bb18f68c");
  });

  it("hash is independent of key order", () => {
    const reordered = JSON.parse(JSON.stringify(starterRulePack, Object.keys(starterRulePack).reverse()));
    expect(rulePackHash(RulePackSchema.parse({ ...reordered, rules: starterRulePack.rules }))).toBe(rulePackHash(starterRulePack));
  });

  it("passes a post with the active code", () => {
    const r = pass({ bot: "sales", kind: "post", target: "x", details: { text: "Use 0147TIME today" } });
    expect(r).toMatchObject({ verdict: "pass", firedRules: [], rulePackVersion: "1.0.0" });
  });

  it("fires on any other promo code (warn by default, block in block mode)", () => {
    const a = { bot: "sales", kind: "post", target: "x", details: { text: "Use SAVE20 or 0147TIME" } };
    const w = pass(a);
    expect(w.verdict).toBe("warn");
    expect(w.firedRules.map((f) => f.id)).toEqual(["promo.only-active-codes"]);
    expect(w.firedRules[0].reason).toContain("SAVE20");
    expect(pass(a, "block").verdict).toBe("block");
  });

  it("fires on price edits", () => {
    const r = pass({ bot: "shop", kind: "edit", target: "product.price", details: { value: 10 } }, "block");
    expect(r.verdict).toBe("block");
    expect(r.firedRules[0].id).toBe("store.no-price-edits");
    expect(pass({ bot: "shop", kind: "edit", target: "product.title" }).verdict).toBe("pass");
  });

  it("spend cap is configurable", () => {
    expect(pass({ bot: "b", kind: "spend", target: "ads", details: { amount: 50 } }).verdict).toBe("pass");
    expect(pass({ bot: "b", kind: "spend", target: "ads", details: { amount: 51 } }, "block").firedRules[0].id).toBe("spend.cap");
    const pack = { ...starterRulePack, rules: starterRulePack.rules.map((r) => (r.type === "spendCap" ? { ...r, maxAmount: 100 } : r)) };
    expect(checkAction({ bot: "b", kind: "spend", target: "ads", details: { amount: 51 } }, pack).verdict).toBe("pass");
    expect(rulePackHash(pack)).not.toBe(rulePackHash(starterRulePack));
  });

  it("send without approved:true fires; can fire multiple rules", () => {
    const r = pass({ bot: "b", kind: "send", target: "email", details: { body: "code FREE50" } }, "block");
    expect(r.verdict).toBe("block");
    expect(r.firedRules.map((f) => f.id)).toEqual(["promo.only-active-codes", "send.requires-approval"]);
    expect(pass({ bot: "b", kind: "send", target: "email", details: { approved: true, body: "hi" } }).verdict).toBe("pass");
  });

  it("is deterministic and rejects invalid actions", () => {
    const a = { bot: "b", kind: "send", target: "t", details: {} };
    expect(pass(a)).toEqual(pass(a));
    expect(() => pass({ bot: "b", kind: "delete", target: "t" })).toThrow();
  });

  it("tool adapter invokes checkAction", async () => {
    const r = await checkActionTool.invoke({ action: { bot: "b", kind: "edit", target: "price" }, mode: "block" });
    expect(r.verdict).toBe("block");
    expect((await checkActionTool.invoke({ action: { bot: "b", kind: "edit", target: "price" } })).verdict).toBe("warn");
  });
});
