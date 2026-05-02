"use client";

import { useState } from "react";
import { Send, Sparkles, Clock, GitBranch, Lightbulb, Zap } from "lucide-react";
import { TIMEOE_CONFIG } from "@/lib/timeoe-engine";

const exampleQueries = [
  {
    icon: Clock,
    text: "Analyze yam price trends for the last 6 months",
    type: "temporal",
  },
  {
    icon: GitBranch,
    text: "What if remittances doubled last quarter?",
    type: "counterfactual",
  },
  {
    icon: Lightbulb,
    text: "Find causal links between diaspora funding and agro prices",
    type: "causality",
  },
];

interface TimeOEResponse {
  causalityScore: number;
  isCausal: boolean;
  optimalLag?: number;
  direction?: string;
  counterfactualDelta: number;
  decomposition?: {
    trend: string;
    seasonality: string;
    anomalies: string[];
  };
  forecast?: {
    nextPeriod: number;
    confidence95: [number, number];
  };
  summary: string;
  methodology?: string;
  engine?: string;
  version?: string;
}

export function AIQueryPanel() {
  const [query, setQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [response, setResponse] = useState<TimeOEResponse | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setIsLoading(true);
    try {
      const res = await fetch("/api/temporal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: query,
          data: {
            context: "Edo State diaspora and agricultural data",
            timestamps: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
          },
        }),
      });
      const data = await res.json();
      setResponse(data);
    } catch {
      setResponse({
        causalityScore: 0,
        isCausal: false,
        counterfactualDelta: 0,
        summary: "Failed to analyze. Please try again.",
      });
    }
    setIsLoading(false);
  };

  return (
    <div className="bg-card border border-border rounded-xl p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
            <Sparkles className="h-4 w-4 text-primary" />
          </div>
          <div>
            <h3 className="text-sm font-medium text-foreground">
              $TIMEOE + Grok Analysis
            </h3>
            <p className="text-xs text-muted-foreground">
              Causal inference and counterfactual simulation
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1.5 px-2 py-1 bg-green-500/10 rounded-full">
          <div className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse" />
          <span className="text-xs font-medium text-green-500">Engine Active</span>
        </div>
      </div>

      {!response && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
          {exampleQueries.map((example, index) => (
            <button
              key={index}
              onClick={() => setQuery(example.text)}
              className="flex items-start gap-3 p-3 text-left bg-secondary/50 rounded-lg hover:bg-secondary transition-colors"
            >
              <example.icon className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
              <span className="text-xs text-muted-foreground leading-relaxed">
                {example.text}
              </span>
            </button>
          ))}
        </div>
      )}

      {response && (
        <div className="mb-4 p-4 bg-secondary/30 rounded-lg border border-border">
          {/* Engine Badge */}
          <div className="flex items-center gap-2 mb-3">
            <Zap className="h-3 w-3 text-primary" />
            <span className="text-xs font-medium text-primary">
              {response.engine || TIMEOE_CONFIG.engine}
            </span>
            <span className="text-xs text-muted-foreground">
              v{response.version || TIMEOE_CONFIG.version}
            </span>
          </div>

          {/* Main Metrics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
            <div>
              <p className="text-xs text-muted-foreground mb-1">Causality Score</p>
              <p className="text-lg font-semibold text-primary">
                {typeof response.causalityScore === 'number' 
                  ? `${(response.causalityScore * 100).toFixed(1)}%` 
                  : response.causalityScore}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">Causal Link</p>
              <p className={`text-lg font-semibold ${response.isCausal ? 'text-green-500' : 'text-muted-foreground'}`}>
                {response.isCausal ? "Confirmed" : "Not Found"}
              </p>
            </div>
            {response.direction && (
              <div>
                <p className="text-xs text-muted-foreground mb-1">Direction</p>
                <p className="text-lg font-semibold text-accent">
                  {response.direction}
                </p>
              </div>
            )}
            <div>
              <p className="text-xs text-muted-foreground mb-1">Treatment Effect</p>
              <p className={`text-lg font-semibold ${response.counterfactualDelta > 0 ? 'text-green-500' : response.counterfactualDelta < 0 ? 'text-red-500' : 'text-foreground'}`}>
                {response.counterfactualDelta > 0 ? '+' : ''}{typeof response.counterfactualDelta === 'number' ? `${(response.counterfactualDelta * 100).toFixed(2)}%` : response.counterfactualDelta}
              </p>
            </div>
          </div>

          {/* Decomposition */}
          {response.decomposition && (
            <div className="grid grid-cols-3 gap-3 mb-4 p-3 bg-background/50 rounded-lg">
              <div>
                <p className="text-xs text-muted-foreground mb-1">Trend</p>
                <p className="text-sm text-foreground">{response.decomposition.trend}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">Seasonality</p>
                <p className="text-sm text-foreground">{response.decomposition.seasonality}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">Anomalies</p>
                <p className="text-sm text-foreground">
                  {response.decomposition.anomalies?.length > 0 
                    ? response.decomposition.anomalies.join(", ") 
                    : "None"}
                </p>
              </div>
            </div>
          )}

          {/* Forecast */}
          {response.forecast && (
            <div className="flex items-center gap-4 mb-4 p-3 bg-primary/5 rounded-lg border border-primary/20">
              <div>
                <p className="text-xs text-muted-foreground mb-1">Next Period Forecast</p>
                <p className="text-lg font-semibold text-primary">
                  {response.forecast.nextPeriod?.toFixed(2)}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">95% Confidence</p>
                <p className="text-sm text-muted-foreground">
                  [{response.forecast.confidence95?.[0]?.toFixed(2)}, {response.forecast.confidence95?.[1]?.toFixed(2)}]
                </p>
              </div>
            </div>
          )}

          {/* Summary */}
          <p className="text-sm text-muted-foreground leading-relaxed mb-3">
            {response.summary}
          </p>

          {/* Methodology */}
          {response.methodology && (
            <p className="text-xs text-muted-foreground/70 italic">
              Methodology: {response.methodology}
            </p>
          )}
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex gap-3">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Ask about temporal patterns, causality, or run counterfactual simulations..."
          className="flex-1 px-4 py-3 text-sm bg-input border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring text-foreground placeholder:text-muted-foreground"
        />
        <button
          type="submit"
          disabled={isLoading || !query.trim()}
          className="px-4 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          {isLoading ? (
            <div className="h-4 w-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
          ) : (
            <Send className="h-4 w-4" />
          )}
          <span className="text-sm font-medium">Analyze</span>
        </button>
      </form>
    </div>
  );
}
