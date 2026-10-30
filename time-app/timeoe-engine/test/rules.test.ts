import { describe, expect, it } from "vitest";
import { checkAction, checkActionTool, rulePackHash, starterRulePack, RulePackSchema } from "../src/rules";

const pass = (a: object, mode?: "warn" | "block") => checkAction(a, starterRulePack, { mode });

describe("checkAction rule pack", () => {
  it("golden rulePackHash for starter pack v1.1.0", () => {
    expect(starterRulePack.version).toBe("1.1.0");
    expect(rulePackHash(starterRulePack)).toBe("b6f6055e4700429c33b171a7379e2a5e1713799b4dbfd266a6b153da1ccd4fa5");
  });

  it("hash is independent of key order", () => {
    const reordered = JSON.parse(JSON.stringify(starterRulePack, Object.keys(starterRulePack).reverse()));
    expect(rulePackHash(RulePackSchema.parse({ ...reordered, rules: starterRulePack.rules }))).toBe(rulePackHash(starterRulePack));
  });

  it("passes a post with the active code", () => {
    const r = pass({ bot: "sales", kind: "post", target: "x", details: { text: "Use 0147TIME today" } });
    expect(r).toMatchObject({ verdict: "pass", firedRules: [], rulePackVersion: "1.1.0" });
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
    expect(pass({ bot: "b", kind: "spend", target: "ads", details: { amount: 50000, currency: "NGN" } }).verdict).toBe("pass");
    expect(pass({ bot: "b", kind: "spend", target: "ads", details: { amount: 51000, currency: "NGN" } }, "block").firedRules[0].id).toBe("spend.cap");
    const pack = { ...starterRulePack, rules: starterRulePack.rules.map((r) => (r.type === "spendCap" ? { ...r, maxAmount: 100000 } : r)) };
    expect(checkAction({ bot: "b", kind: "spend", target: "ads", details: { amount: 51000, currency: "NGN" } }, pack).verdict).toBe("pass");
    expect(rulePackHash(pack)).not.toBe(rulePackHash(starterRulePack));
  });

  it("send without approved:true fires; can fire multiple rules", () => {
    const r = pass({ bot: "b", kind: "send", target: "email", details: { body: "code FREE50" } }, "block");
    expect(r.verdict).toBe("block");
    expect(r.firedRules.map((f) => f.id)).toEqual(["promo.only-active-codes", "send.requires-approval"]);
    expect(pass({ bot: "b", kind: "send", target: "email", details: { approved: true, body: "hi" } }).verdict).toBe("pass");
  });

  it("catches all-letter codes near code words but not ordinary caps", () => {
    const fire = (text: string) => pass({ bot: "s", kind: "post", target: "x", details: { text } }).firedRules.map((f) => f.reason);
    expect(fire("Promo: WELCOME gets 10% off")[0]).toContain("WELCOME");
    expect(fire("use code SUMMER")[0]).toContain("SUMMER");
    expect(fire("use code summer")[0]).toContain("SUMMER");
    expect(fire("BIG NEWS TODAY: OUR STORE IS OPEN")).toEqual([]);
    expect(fire("Use promo code 0147TIME")).toEqual([]);
  });

  it("spend in another currency or without amount fires", () => {
    expect(pass({ bot: "b", kind: "spend", target: "ads", details: { amount: 10, currency: "USD" } }).firedRules[0].reason).toContain("cannot compare");
    expect(pass({ bot: "b", kind: "spend", target: "ads", details: { currency: "NGN" } }).firedRules[0].id).toBe("spend.cap");
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
