import { buildEntry } from "./chain";
import { DecisionInputSchema, type TraceEntry } from "./schemas";
import type { TraceStore } from "./store";

/** Validate, canonicalize, chain to the bot's previous entry and append. loggedAt is injectable for determinism. */
export async function logDecision(raw: unknown, store: TraceStore, opts: { now?: () => string } = {}): Promise<TraceEntry> {
  const decision = DecisionInputSchema.parse(raw);
  const prev = await store.head(decision.bot);
  const entry = buildEntry(decision, prev, (opts.now ?? (() => new Date().toISOString()))());
  await store.append(entry);
  return entry;
}
