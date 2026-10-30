import { z } from "zod";

export const ActionKindSchema = z.enum(["post", "spend", "send", "edit"]);

/** A proposed action a bot wants to take, checked before it posts, spends, sends or edits. */
export const ProposedActionSchema = z.object({
  bot: z.string().min(1),
  kind: ActionKindSchema,
  target: z.string().min(1),
  details: z.record(z.string(), z.unknown()).default({}),
});
export type ProposedAction = z.infer<typeof ProposedActionSchema>;

const base = { id: z.string().min(1), description: z.string().min(1) };

export const RuleSchema = z.discriminatedUnion("type", [
  z.object({ ...base, type: z.literal("activePromoCodes"), kinds: z.array(ActionKindSchema).min(1), activeCodes: z.array(z.string().min(1)).min(1), codePattern: z.string().min(1) }),
  z.object({ ...base, type: z.literal("forbidEditTarget"), targets: z.array(z.string().min(1)).min(1) }),
  z.object({ ...base, type: z.literal("spendCap"), maxAmount: z.number().nonnegative(), currency: z.string().min(1) }),
  z.object({ ...base, type: z.literal("requireApproval"), kinds: z.array(ActionKindSchema).min(1) }),
]);
export type Rule = z.infer<typeof RuleSchema>;

export const RulePackSchema = z.object({
  name: z.string().min(1),
  version: z.string().regex(/^\d+\.\d+\.\d+$/),
  rules: z.array(RuleSchema).min(1),
}).superRefine((p, ctx) => {
  const seen = new Set<string>();
  for (const r of p.rules) {
    if (seen.has(r.id)) ctx.addIssue({ code: "custom", message: `duplicate rule id ${r.id}` });
    seen.add(r.id);
  }
});
export type RulePack = z.infer<typeof RulePackSchema>;

export const CheckModeSchema = z.enum(["warn", "block"]);
export type CheckMode = z.infer<typeof CheckModeSchema>;

export interface FiredRule { id: string; reason: string }
export interface CheckResult {
  verdict: "pass" | "warn" | "block";
  firedRules: FiredRule[];
  rulePackVersion: string;
  rulePackHash: string;
}
