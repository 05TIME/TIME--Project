/** Shared helpers so AI routes fail gracefully when the Vercel AI Gateway isn't usable. */

export const AI_NOT_CONFIGURED = { error: "AI features are not configured on this deployment" } as const;

/**
 * True when there's no way to authenticate to the gateway. On Vercel the OIDC token can arrive
 * per request, so a deployment (VERCEL set) is treated as possibly configured; the call itself decides.
 */
export function gatewayLooksUnconfigured(env: Record<string, string | undefined> = process.env): boolean {
  return !env.AI_GATEWAY_API_KEY && !env.VERCEL_OIDC_TOKEN && !env.VERCEL;
}

/** Recognise gateway auth/billing/config failures (e.g. 403 "AI Gateway requires a valid credit card on file"). */
export function isGatewayUnavailableError(e: unknown): boolean {
  if (!e || typeof e !== "object") return false;
  const err = e as { name?: string; statusCode?: number; status?: number; message?: string; cause?: unknown };
  const status = err.statusCode ?? err.status;
  if (status === 401 || status === 402 || status === 403) return true;
  if (typeof err.name === "string" && /Gateway(Authentication|Authorization|Billing|Configuration)?Error/.test(err.name) && status !== 400) return true;
  if (typeof err.message === "string" && /credit card|AI Gateway|unauthori[sz]ed|authentication|api key/i.test(err.message)) return true;
  return err.cause ? isGatewayUnavailableError(err.cause) : false;
}
