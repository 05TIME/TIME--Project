import { z } from "zod";

export const JsonSchema: z.ZodType<unknown> = z.lazy(() =>
  z.union([z.null(), z.boolean(), z.number().finite(), z.string(), z.array(JsonSchema), z.record(JsonSchema)]),
);

export const ClockSchema = z.object({ startIso: z.string().datetime(), stepMs: z.number().int().positive() });

const base = {
  agentId: z.string().min(1),
  seed: z.number().int().min(0).max(0xffffffff),
  clock: ClockSchema,
  observations: z.array(z.record(JsonSchema)).min(1).max(10_000),
  initialState: z.record(JsonSchema).optional(),
};

export const AgentRequestSchema = z.discriminatedUnion("mode", [
  z.object({ mode: z.literal("run"), ...base }),
  z.object({ mode: z.literal("whatIf"), ...base, change: z.object({ step: z.number().int().min(0), patch: z.record(JsonSchema) }) }),
  z.object({ mode: z.literal("replay"), agentId: z.string().min(1), trace: z.object({ traceHash: z.string() }).passthrough() }),
]);
export type AgentRequest = z.infer<typeof AgentRequestSchema>;

const ActionSchema = z.object({ type: z.string(), payload: JsonSchema });
export const TraceSchema = z.object({
  agentId: z.string(), agentVersion: z.string(), seed: z.number(), clock: ClockSchema,
  initialState: JsonSchema, observations: z.array(JsonSchema), finalState: JsonSchema,
  traceHash: z.string().regex(/^[0-9a-f]{64}$/),
  steps: z.array(z.object({
    step: z.number(), now: z.string(), random: z.number(), observation: JsonSchema, stateBefore: JsonSchema,
    evaluated: z.array(z.object({ ruleId: z.string(), passed: z.boolean() })),
    ruleFired: z.string().nullable(), reason: z.string(), action: ActionSchema, stateAfter: JsonSchema,
    stepHash: z.string().regex(/^[0-9a-f]{64}$/),
  })),
});

export const AgentResponseSchema = z.discriminatedUnion("mode", [
  z.object({ mode: z.literal("run"), trace: TraceSchema, explanation: z.array(z.string()) }),
  z.object({ mode: z.literal("whatIf"), traceHashBefore: z.string(), traceHashAfter: z.string(), diffs: z.array(z.object({ step: z.number(), before: JsonSchema, after: JsonSchema })), finalStateBefore: JsonSchema, finalStateAfter: JsonSchema }),
  z.object({ mode: z.literal("replay"), ok: z.boolean(), traceHash: z.string(), expectedHash: z.string(), firstMismatchStep: z.number().nullable() }),
]);
export type AgentResponse = z.infer<typeof AgentResponseSchema>;
