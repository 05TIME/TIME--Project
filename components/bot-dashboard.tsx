"use client";

import { useState } from "react";
import { 
  Bot, 
  MessageSquare, 
  Users, 
  TrendingUp, 
  Copy, 
  Check,
  ExternalLink,
  Terminal,
  Zap,
  Clock
} from "lucide-react";

const stats = [
  { label: "Total Queries", value: "12,847", change: "+23%", icon: MessageSquare },
  { label: "Active Users", value: "1,234", change: "+12%", icon: Users },
  { label: "Avg Response Time", value: "1.2s", change: "-8%", icon: Clock },
  { label: "Success Rate", value: "99.2%", change: "+0.3%", icon: TrendingUp },
];

const recentQueries = [
  { user: "User_8472", query: "Does inflation cause unemployment?", time: "2m ago", mode: "quick" },
  { user: "User_3891", query: "What if Bitcoin reached $1M?", time: "5m ago", mode: "detailed" },
  { user: "User_7123", query: "Causal link between sleep and productivity", time: "8m ago", mode: "quick" },
  { user: "User_2945", query: "What patterns exist in stock crashes?", time: "12m ago", mode: "quick" },
  { user: "User_6281", query: "Does remote work cause burnout?",time: "15m ago", mode: "detailed" },
];

export function BotDashboard() {
  const [copied, setCopied] = useState<string | null>(null);

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(null), 2000);
  };

  const apiEndpoint = typeof window !== "undefined" 
    ? `${window.location.origin}/api/bot/analyze`
    : "https://your-app.vercel.app/api/bot/analyze";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center">
            <Bot className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">@TIMEOai_Bot</h1>
            <p className="text-sm text-muted-foreground">Telegram Bot Management</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-green-500/10 rounded-full">
            <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
            <span className="text-sm font-medium text-green-500">Online</span>
          </div>
          <a
            href="https://t.me/TIMEOai_bot"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground text-sm font-medium rounded-lg hover:bg-primary/90 transition-colors"
          >
            Open in Telegram
            <ExternalLink className="h-4 w-4" />
          </a>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <div key={stat.label} className="p-4 bg-card rounded-xl border border-border">
            <div className="flex items-center justify-between mb-3">
              <stat.icon className="h-5 w-5 text-muted-foreground" />
              <span className={`text-xs font-medium ${
                stat.change.startsWith("+") ? "text-green-500" : "text-red-500"
              }`}>
                {stat.change}
              </span>
            </div>
            <p className="text-2xl font-bold text-foreground">{stat.value}</p>
            <p className="text-sm text-muted-foreground">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* API Configuration */}
      <div className="p-6 bg-card rounded-xl border border-border">
        <div className="flex items-center gap-2 mb-4">
          <Terminal className="h-5 w-5 text-primary" />
          <h2 className="text-lg font-semibold text-foreground">API Configuration</h2>
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-sm text-muted-foreground mb-1 block">API Endpoint</label>
            <div className="flex items-center gap-2">
              <code className="flex-1 px-3 py-2 bg-secondary rounded-lg text-sm font-mono text-foreground overflow-x-auto">
                {apiEndpoint}
              </code>
              <button
                onClick={() => copyToClipboard(apiEndpoint, "endpoint")}
                className="p-2 hover:bg-secondary rounded-lg transition-colors"
              >
                {copied === "endpoint" ? (
                  <Check className="h-4 w-4 text-green-500" />
                ) : (
                  <Copy className="h-4 w-4 text-muted-foreground" />
                )}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-muted-foreground mb-1 block">Environment Variable</label>
              <div className="flex items-center gap-2">
                <code className="flex-1 px-3 py-2 bg-secondary rounded-lg text-sm font-mono text-foreground">
                  TIMEOE_BOT_API_KEY
                </code>
                <button
                  onClick={() => copyToClipboard("TIMEOE_BOT_API_KEY", "envvar")}
                  className="p-2 hover:bg-secondary rounded-lg transition-colors"
                >
                  {copied === "envvar" ? (
                    <Check className="h-4 w-4 text-green-500" />
                  ) : (
                    <Copy className="h-4 w-4 text-muted-foreground" />
                  )}
                </button>
              </div>
            </div>
            <div>
              <label className="text-sm text-muted-foreground mb-1 block">Bot Username</label>
              <div className="flex items-center gap-2">
                <code className="flex-1 px-3 py-2 bg-secondary rounded-lg text-sm font-mono text-foreground">
                  @TIMEOai_bot
                </code>
                <button
                  onClick={() => copyToClipboard("@TIMEOai_bot", "username")}
                  className="p-2 hover:bg-secondary rounded-lg transition-colors"
                >
                  {copied === "username" ? (
                    <Check className="h-4 w-4 text-green-500" />
                  ) : (
                    <Copy className="h-4 w-4 text-muted-foreground" />
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Queries */}
      <div className="p-6 bg-card rounded-xl border border-border">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-semibold text-foreground">Recent Queries</h2>
          </div>
          <span className="text-sm text-muted-foreground">Last 24 hours</span>
        </div>

        <div className="space-y-3">
          {recentQueries.map((item, index) => (
            <div 
              key={index}
              className="flex items-center justify-between p-3 bg-secondary/50 rounded-lg"
            >
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <MessageSquare className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">{item.query}</p>
                  <p className="text-xs text-muted-foreground">{item.user}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className={`px-2 py-0.5 text-xs font-medium rounded ${
                  item.mode === "detailed" 
                    ? "bg-primary/10 text-primary" 
                    : "bg-secondary text-muted-foreground"
                }`}>
                  {item.mode}
                </span>
                <span className="text-xs text-muted-foreground">{item.time}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Setup Guide */}
      <div className="p-6 bg-card rounded-xl border border-border">
        <h2 className="text-lg font-semibold text-foreground mb-4">Quick Setup</h2>
        <div className="space-y-3">
          <div className="flex items-start gap-3">
            <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
              <span className="text-xs font-bold text-primary">1</span>
            </div>
            <div>
              <p className="font-medium text-foreground">Install dependencies</p>
              <code className="text-sm text-muted-foreground">pip install aiogram aiohttp python-dotenv</code>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
              <span className="text-xs font-bold text-primary">2</span>
            </div>
            <div>
              <p className="font-medium text-foreground">Set environment variables</p>
              <code className="text-sm text-muted-foreground">TELEGRAM_BOT_TOKEN, TIMEOE_API_URL, TIMEOE_BOT_API_KEY</code>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
              <span className="text-xs font-bold text-primary">3</span>
            </div>
            <div>
              <p className="font-medium text-foreground">Run the bot</p>
              <code className="text-sm text-muted-foreground">python bot/timeoai_bot.py</code>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
