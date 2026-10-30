import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { TraceEntry } from "./schemas";
import type { TraceStore } from "./store";

interface Row { bot: string; seq: number; prev_hash: string; logged_at: string; decision: TraceEntry["decision"]; hash: string }
const toEntry = (r: Row): TraceEntry => ({ bot: r.bot, seq: r.seq, prevHash: r.prev_hash, loggedAt: r.logged_at, decision: r.decision, hash: r.hash });

/** Server-side only. Reads SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY from the environment. */
export class SupabaseTraceStore implements TraceStore {
  private client: SupabaseClient;
  constructor(client?: SupabaseClient, private table = "decision_traces") {
    if (client) { this.client = client; return; }
    const url = process.env.SUPABASE_URL, key = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!url || !key) throw new Error("SupabaseTraceStore: SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set");
    this.client = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
  }
  async head(bot: string) {
    const { data, error } = await this.client.from(this.table).select("*").eq("bot", bot).order("seq", { ascending: false }).limit(1);
    if (error) throw new Error(`SupabaseTraceStore.head: ${error.message}`);
    return data && data.length ? toEntry(data[0] as Row) : null;
  }
  async append(e: TraceEntry) {
    const row: Row = { bot: e.bot, seq: e.seq, prev_hash: e.prevHash, logged_at: e.loggedAt, decision: e.decision, hash: e.hash };
    const { error } = await this.client.from(this.table).insert(row);
    if (error) throw new Error(`SupabaseTraceStore.append: ${error.message}`);
  }
  async list(bot: string) {
    const { data, error } = await this.client.from(this.table).select("*").eq("bot", bot).order("seq", { ascending: true });
    if (error) throw new Error(`SupabaseTraceStore.list: ${error.message}`);
    return (data as Row[]).map(toEntry);
  }
}
