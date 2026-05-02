import { NextResponse } from "next/server";

// Telegram Webhook handler (optional - can handle updates directly in Next.js)
export async function POST(request: Request) {
  try {
    const update = await request.json();
    
    // Verify webhook secret
    const secret = request.headers.get("x-telegram-bot-api-secret-token");
    if (process.env.TELEGRAM_WEBHOOK_SECRET && secret !== process.env.TELEGRAM_WEBHOOK_SECRET) {
      return NextResponse.json({ error: "Invalid secret" }, { status: 403 });
    }

    // Log incoming update
    console.log("[TIMEOai_Bot] Webhook update:", JSON.stringify(update, null, 2));

    // Handle message
    if (update.message) {
      const chatId = update.message.chat.id;
      const text = update.message.text;
      const userId = update.message.from.id;

      // Process command or query
      if (text?.startsWith("/")) {
        // Handle commands - bot will process these
        return NextResponse.json({ ok: true, handled: false });
      }

      // For direct webhook processing (optional)
      // You can call the analyze endpoint here
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[TIMEOai_Bot] Webhook error:", error);
    return NextResponse.json({ error: "Webhook processing failed" }, { status: 500 });
  }
}

// Health check for webhook
export async function GET() {
  return NextResponse.json({
    status: "ok",
    bot: "@TIMEOai_Bot",
    engine: "$TIMEOE + Grok",
    endpoints: {
      analyze: "/api/bot/analyze",
      usage: "/api/bot/usage",
      webhook: "/api/bot/webhook",
    },
  });
}
