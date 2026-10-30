import { configFromEnv, createTimeoeMcpHandler } from "@/lib/timeoe-mcp";

export const runtime = "nodejs";

let handler: ((req: Request) => Promise<Response>) | null = null;
const getHandler = () => (handler ??= createTimeoeMcpHandler(configFromEnv()));

/** POST /api/mcp: TIMEŒ engine MCP server (check_action, log_decision, what_if). Per-bot bearer tokens. */
async function route(req: Request) { return getHandler()(req); }
export { route as GET, route as POST, route as DELETE };
