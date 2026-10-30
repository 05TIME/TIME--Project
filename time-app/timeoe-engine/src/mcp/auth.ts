import { createHash, timingSafeEqual } from "node:crypto";

/** Parse MCP_BOT_TOKENS: JSON {botName: sha256hex(token)}. Invalid entries are rejected loudly. */
export function parseBotTokens(raw: string | undefined): Map<string, Buffer> {
  const out = new Map<string, Buffer>();
  if (!raw) return out;
  const obj = JSON.parse(raw) as Record<string, unknown>;
  for (const [bot, h] of Object.entries(obj)) {
    if (typeof h !== "string" || !/^[0-9a-f]{64}$/i.test(h)) throw new Error(`MCP_BOT_TOKENS: entry for ${bot} is not a sha256 hex digest`);
    out.set(bot, Buffer.from(h.toLowerCase(), "hex"));
  }
  return out;
}

export const sha256 = (s: string) => createHash("sha256").update(s, "utf8").digest();

/** Returns the bot name for a valid bearer token, else null. Checks every entry in constant time. */
export function botForToken(token: string | undefined, tokens: Map<string, Buffer>): string | null {
  if (!token) return null;
  const h = sha256(token);
  let match: string | null = null;
  for (const [bot, expected] of tokens) if (timingSafeEqual(h, expected) && match === null) match = bot;
  return match;
}
