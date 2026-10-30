import { hashOf } from "../engine/agent/canonical";
import {
  ProposedActionSchema, RulePackSchema,
  type CheckMode, type CheckResult, type FiredRule, type ProposedAction, type Rule, type RulePack,
} from "./schemas";
import starterPackJson from "./rule-pack.v1.json";

export const starterRulePack: RulePack = RulePackSchema.parse(starterPackJson);

/** sha256 of the canonical JSON of the pack (same canonicalisation as engine traces). */
export const rulePackHash = (pack: RulePack): string => hashOf(pack);

/** Collect every string inside details (and the target) so codes hidden in nested fields are found. */
function strings(v: unknown, out: string[] = []): string[] {
  if (typeof v === "string") out.push(v);
  else if (Array.isArray(v)) v.forEach((x) => strings(x, out));
  else if (v && typeof v === "object") Object.keys(v).sort().forEach((k) => strings((v as Record<string, unknown>)[k], out));
  return out;
}

function evalRule(rule: Rule, a: ProposedAction): string | null {
  switch (rule.type) {
    case "activePromoCodes": {
      if (!rule.kinds.includes(a.kind)) return null;
      const re = new RegExp(rule.codePattern, "g");
      const active = new Set(rule.activeCodes.map((c) => c.toUpperCase()));
      const found = new Set<string>();
      for (const s of strings(a.details)) for (const m of s.toUpperCase().match(re) ?? []) if (!active.has(m)) found.add(m);
      const codes = [...found].sort();
      return codes.length ? `inactive promo code(s): ${codes.join(", ")} (active: ${rule.activeCodes.join(", ")})` : null;
    }
    case "forbidEditTarget": {
      if (a.kind !== "edit") return null;
      const t = a.target.toLowerCase();
      const hit = rule.targets.find((x) => t === x || t.split(/[^a-z0-9]+/).includes(x));
      return hit ? `editing "${a.target}" is forbidden` : null;
    }
    case "spendCap": {
      if (a.kind !== "spend") return null;
      const amt = a.details.amount;
      if (typeof amt !== "number" || !Number.isFinite(amt)) return `spend has no numeric details.amount`;
      return amt > rule.maxAmount ? `spend ${amt} exceeds cap ${rule.maxAmount} ${rule.currency}` : null;
    }
    case "requireApproval":
      return rule.kinds.includes(a.kind) && a.details.approved !== true ? `${a.kind} requires details.approved === true` : null;
  }
}

/** Pure, deterministic pre-action check. No I/O, no LLM. mode 'warn' (default) downgrades block to warn. */
export function checkAction(action: unknown, pack: RulePack = starterRulePack, opts: { mode?: CheckMode } = {}): CheckResult {
  const a = ProposedActionSchema.parse(action);
  const p = RulePackSchema.parse(pack);
  const mode = opts.mode ?? "warn";
  const firedRules: FiredRule[] = [];
  for (const r of p.rules) {
    const reason = evalRule(r, a);
    if (reason) firedRules.push({ id: r.id, reason });
  }
  const verdict = firedRules.length === 0 ? "pass" : mode === "block" ? "block" : "warn";
  return { verdict, firedRules, rulePackVersion: p.version, rulePackHash: rulePackHash(p) };
}
