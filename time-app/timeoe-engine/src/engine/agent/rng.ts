/** mulberry32: tiny, fast, fully deterministic 32-bit PRNG. Returns floats in [0, 1). */
export function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Fixed, injected clock: step i happens at startMs + i * stepMs. No Date.now(). */
export interface FixedClock { startIso: string; stepMs: number }

export function clockAt(clock: FixedClock, step: number): string {
  const start = Date.parse(clock.startIso);
  if (!Number.isFinite(start)) throw new Error(`Invalid clock.startIso: ${clock.startIso}`);
  return new Date(start + step * clock.stepMs).toISOString();
}
