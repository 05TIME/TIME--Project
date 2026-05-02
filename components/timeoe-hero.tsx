"use client";

import { Clock, GitBranch, Sparkles, Zap } from "lucide-react";

const capabilities = [
  {
    icon: Clock,
    title: "Temporal Reasoning",
    description: "Track and interpret time-stamped data with advanced decomposition",
  },
  {
    icon: GitBranch,
    title: "Causality Detection",
    description: "Identify true causal relationships, filter spurious correlations",
  },
  {
    icon: Sparkles,
    title: "Counterfactual Simulation",
    description: "Explore what-if scenarios with do-calculus interventions",
  },
];

export function TimeOEHero() {
  return (
    <div className="mb-6 p-6 rounded-xl bg-gradient-to-br from-primary/5 via-background to-accent/5 border border-border">
      <div className="flex items-start justify-between mb-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <h2 className="text-2xl font-bold text-foreground">$TIMEOE</h2>
            <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-primary/10 text-primary border border-primary/20">
              Time AI Godfather
            </span>
          </div>
          <p className="text-muted-foreground max-w-xl">
            An AI system that embodies the concept of time as the father of AI. 
            A global platform for advanced temporal manipulation, prediction, and causal analysis across any domain.
          </p>
        </div>
        <div className="flex items-center gap-2 px-3 py-2 bg-card rounded-lg border border-border">
          <Zap className="h-4 w-4 text-accent" />
          <span className="text-sm font-medium text-foreground">Engine Active</span>
          <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {capabilities.map((cap) => (
          <div
            key={cap.title}
            className="flex items-start gap-3 p-4 rounded-lg bg-card/50 border border-border/50 hover:border-primary/30 transition-colors"
          >
            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
              <cap.icon className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-foreground mb-1">{cap.title}</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">{cap.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
