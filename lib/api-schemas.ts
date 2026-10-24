import { z } from "zod";

/** Input schemas for the app/api routes. Limits keep prompts and payloads bounded. */
const json = z.unknown();

export const CausalityInput = z.object({
  cause: json.refine((v) => v !== undefined, "cause is required"),
  effect: json.refine((v) => v !== undefined, "effect is required"),
  timestamps: z.array(z.union([z.string(), z.number()])).max(10_000).optional(),
});

export const TemporalInput = z.object({
  prompt: z.string().trim().min(1).max(4_000),
  data: json.optional(),
  analysisType: z.string().max(64).optional(),
});

export const CounterfactualInput = z.object({
  scenario: z.string().trim().min(1).max(4_000),
  baselineData: json.optional(),
  intervention: json.optional(),
  timeRange: z.string().max(64).optional(),
});

export const BotAnalyzeInput = z.object({
  query: z.string().trim().min(1).max(4_000),
  userId: z.union([z.string(), z.number()]).optional(),
  chatId: z.union([z.string(), z.number()]).optional(),
  mode: z.enum(["quick", "detailed"]).default("quick"),
});

export const BotUsageInput = z.object({
  userId: z.string().trim().min(1).max(128),
  action: z.enum(["increment", "get"]).optional(),
});

export const TelegramUpdate = z
  .object({
    update_id: z.number().optional(),
    message: z
      .object({
        chat: z.object({ id: z.union([z.number(), z.string()]) }).passthrough(),
        from: z.object({ id: z.union([z.number(), z.string()]) }).passthrough().optional(),
        text: z.string().optional(),
      })
      .passthrough()
      .optional(),
  })
  .passthrough();

export type ParseResult<T> = { ok: true; data: T } | { ok: false; response: Response };

/** Parse a JSON request body against a schema; on failure return a 400 response. */
export async function parseBody<T>(request: Request, schema: z.ZodType<T, z.ZodTypeDef, unknown>): Promise<ParseResult<T>> {
  let raw: unknown;
  try {
    raw = await request.json();
  } catch {
    return { ok: false, response: Response.json({ error: "Invalid JSON body" }, { status: 400 }) };
  }
  const r = schema.safeParse(raw);
  if (!r.success) {
    return { ok: false, response: Response.json({ error: "Invalid input", issues: r.error.issues.map((i) => ({ path: i.path.join("."), message: i.message })) }, { status: 400 }) };
  }
  return { ok: true, data: r.data };
}
