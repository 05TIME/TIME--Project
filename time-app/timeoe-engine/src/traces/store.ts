import type { TraceEntry } from "./schemas";

/** Append-only per-bot trace storage. append must fail if (bot, seq) already exists. */
export interface TraceStore {
  head(bot: string): Promise<TraceEntry | null>;
  append(entry: TraceEntry): Promise<void>;
  list(bot: string): Promise<TraceEntry[]>;
}

export class InMemoryTraceStore implements TraceStore {
  private chains = new Map<string, TraceEntry[]>();
  async head(bot: string) { const c = this.chains.get(bot); return c && c.length ? structuredClone(c[c.length - 1]) : null; }
  async append(entry: TraceEntry) {
    const c = this.chains.get(entry.bot) ?? [];
    if (entry.seq !== c.length) throw new Error(`seq conflict for ${entry.bot}: expected ${c.length}, got ${entry.seq}`);
    c.push(structuredClone(entry));
    this.chains.set(entry.bot, c);
  }
  async list(bot: string) { return structuredClone(this.chains.get(bot) ?? []); }
  /** Test helper only: direct mutable access to simulate tampering. */
  _raw(bot: string): TraceEntry[] { return this.chains.get(bot) ?? []; }
}
