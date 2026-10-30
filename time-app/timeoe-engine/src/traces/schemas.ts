import { z } from "zod";
import { ProposedActionSchema } from "../rules/schemas";

const json: z.ZodType<unknown> = z.unknown();

export const CheckResultSchema = z.object({
  verdict: z.enum(["pass", "warn", "block"]),
  firedRules: z.array(z.object({ id: z.string(), reason: z.string() })),
  rulePackVersion: z.string(),
  rulePackHash: z.string().regex(/^[0-9a-f]{64}$/),
});

/** Input to log_decision. */
export const DecisionInputSchema = z.object({
  bot: z.string().min(1).max(200),
  action: ProposedActionSchema,
  inputs: z.record(z.string(), json).default({}),
  outcome: z.string().min(1),
  reason: z.string().min(1),
  seed: z.number().int().min(0).max(4294967295).optional(),
  checkResult: CheckResultSchema.optional(),
});
export type DecisionInput = z.infer<typeof DecisionInputSchema>;

export const GENESIS_HASH = "0".repeat(64);

/** One stored, hash-chained trace entry. hash = sha256(canonical({bot, seq, prevHash, loggedAt, decision})). */
export interface TraceEntry {
  bot: string;
  seq: number;
  prevHash: string;
  loggedAt: string;
  decision: DecisionInput;
  hash: string;
}
