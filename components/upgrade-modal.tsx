"use client";

import { X, Crown, Check, Zap } from "lucide-react";
import { useEffect } from "react";

interface UpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const proFeatures = [
  "Unlimited simulations",
  "Advanced counterfactuals",
  "Full causal graph exports",
  "Priority queue access",
  "API access (100 calls/day)",
  "Simulation history",
];

export function UpgradeModal({ isOpen, onClose }: UpgradeModalProps) {
  // Close on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-background/80 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative bg-card border border-border rounded-xl shadow-xl max-w-md w-full mx-4 overflow-hidden">
        {/* Header */}
        <div className="relative p-6 pb-4 bg-gradient-to-br from-primary/10 to-accent/10">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1 text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
          
          <div className="flex items-center gap-3 mb-3">
            <div className="h-12 w-12 rounded-xl bg-primary flex items-center justify-center">
              <Crown className="h-6 w-6 text-primary-foreground" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-foreground">Upgrade to Pro</h2>
              <p className="text-sm text-muted-foreground">Unlock unlimited power</p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="flex items-baseline gap-1 mb-4">
            <span className="text-4xl font-bold text-foreground">$19</span>
            <span className="text-muted-foreground">/month</span>
          </div>

          <ul className="space-y-3 mb-6">
            {proFeatures.map((feature) => (
              <li key={feature} className="flex items-center gap-3">
                <div className="h-5 w-5 rounded-full bg-primary/10 flex items-center justify-center">
                  <Check className="h-3 w-3 text-primary" />
                </div>
                <span className="text-sm text-foreground">{feature}</span>
              </li>
            ))}
          </ul>

          <button className="w-full py-3 px-4 bg-primary text-primary-foreground font-medium rounded-lg hover:bg-primary/90 transition-colors flex items-center justify-center gap-2">
            <Zap className="h-4 w-4" />
            Upgrade Now
          </button>

          <p className="text-center text-xs text-muted-foreground mt-4">
            Cancel anytime. No questions asked.
          </p>
        </div>

        {/* $TIME Token Option */}
        <div className="px-6 pb-6">
          <div className="p-4 bg-secondary/50 rounded-lg">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-lg bg-accent/20 flex items-center justify-center">
                <span className="text-sm font-bold text-accent">$T</span>
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-foreground">Pay with $TIME</p>
                <p className="text-xs text-muted-foreground">Use tokens for per-simulation access</p>
              </div>
              <button className="text-xs text-primary hover:underline">
                Learn more
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
