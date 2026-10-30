import { hashOf } from "../engine/agent/canonical";
import { GENESIS_HASH, type DecisionInput, type TraceEntry } from "./schemas";

export function entryHash(e: Omit<TraceEntry, "hash">): string {
  return hashOf({ bot: e.bot, seq: e.seq, prevHash: e.prevHash, loggedAt: e.loggedAt, decision: e.decision });
}

export function buildEntry(decision: DecisionInput, prev: TraceEntry | null, loggedAt: string): TraceEntry {
  const body = { bot: decision.bot, seq: prev ? prev.seq + 1 : 0, prevHash: prev ? prev.hash : GENESIS_HASH, loggedAt, decision };
  return { ...body, hash: entryHash(body) };
}

export interface VerifyResult { ok: boolean; length: number; headHash: string; firstBadSeq: number | null; problem?: string }

/** Verify a single bot's chain (entries in seq order): seq continuity, prevHash links and recomputed hashes. */
export function verifyChain(entries: TraceEntry[]): VerifyResult {
  let prevHash = GENESIS_HASH;
  for (let i = 0; i < entries.length; i++) {
    const e = entries[i];
    const bad = (problem: string): VerifyResult => ({ ok: false, length: entries.length, headHash: prevHash, firstBadSeq: e.seq ?? i, problem });
    if (e.seq !== i) return bad(`expected seq ${i}, got ${e.seq}`);
    if (i > 0 && e.bot !== entries[0].bot) return bad("mixed bots in one chain");
    if (e.decision?.bot !== e.bot) return bad("decision.bot does not match entry bot");
    if (e.prevHash !== prevHash) return bad("prevHash does not link to previous entry");
    if (entryHash(e) !== e.hash) return bad("hash does not match contents");
    prevHash = e.hash;
  }
  return { ok: true, length: entries.length, headHash: prevHash, firstBadSeq: null };
}
