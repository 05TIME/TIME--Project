"use client";

import { useState } from "react";
import { Send, Sparkles, Clock, GitBranch, Lightbulb } from "lucide-react";

const exampleQueries = [
  {
    icon: Clock,
    text: "Analyze yam price trends for the last 6 months",
  },
  {
    icon: GitBranch,
    text: "What if remittances doubled last quarter?",
  },
  {
    icon: Lightbulb,
    text: "Find causal links between diaspora funding and agro prices",
  },
];

export function AIQueryPanel() {
  const [query, setQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [response, setResponse] = useState<null | {
    causalityScore: number;
    isCausal: boolean;
    counterfactualDelta: number;
    summary: string;
  }>(null);

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
      <div className="flex items-center gap-2 mb-4">
        <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
          <Sparkles className="h-4 w-4 text-primary" />
        </div>
        <div>
          <h3 className="text-sm font-medium text-foreground">
            AI Temporal Analysis
          </h3>
          <p className="text-xs text-muted-foreground">
            Ask questions about your data using natural language
          </p>
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
          <div className="grid grid-cols-3 gap-4 mb-4">
            <div>
              <p className="text-xs text-muted-foreground mb-1">Causality Score</p>
              <p className="text-lg font-semibold text-primary">
                {response.causalityScore}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">Is Causal</p>
              <p className="text-lg font-semibold text-accent">
                {response.isCausal ? "Yes" : "No"}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">
                Counterfactual Delta
              </p>
              <p className="text-lg font-semibold text-foreground">
                {response.counterfactualDelta}
              </p>
            </div>
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed">
            {response.summary}
          </p>
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
