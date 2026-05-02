import { Header } from "@/components/header";
import { Sidebar } from "@/components/sidebar";
import { Check, Zap, Crown, Building2 } from "lucide-react";

const tiers = [
  {
    name: "Free",
    price: "$0",
    period: "forever",
    description: "Get started with basic causal simulations",
    icon: Zap,
    features: [
      "5 simulations per day",
      "Basic what-if queries",
      "Standard response time",
      "Community support",
    ],
    cta: "Current Plan",
    highlighted: false,
    ctaDisabled: true,
  },
  {
    name: "Pro",
    price: "$19",
    period: "per month",
    description: "For power users who need more insights",
    icon: Crown,
    features: [
      "Unlimited simulations",
      "Advanced counterfactuals",
      "Priority queue access",
      "Full causal graph exports",
      "Simulation history",
      "API access (100 calls/day)",
      "Email support",
    ],
    cta: "Upgrade to Pro",
    highlighted: true,
    ctaDisabled: false,
  },
  {
    name: "Alpha",
    price: "$99",
    period: "per month",
    description: "Maximum power for serious analysts",
    icon: Building2,
    features: [
      "Everything in Pro",
      "Custom event modeling",
      "Multi-variable deep timelines",
      "Prediction market scanner",
      "Real-time causal alerts",
      "API access (unlimited)",
      "Voice mode",
      "Priority support",
      "White-label options",
    ],
    cta: "Go Alpha",
    highlighted: false,
    ctaDisabled: false,
  },
];

export default function PricingPage() {
  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 p-6 overflow-auto">
          <div className="max-w-5xl mx-auto">
            {/* Header */}
            <div className="text-center mb-12">
              <h1 className="text-3xl font-bold text-foreground mb-3">
                Unlock the Full Power of $TIMEOE
              </h1>
              <p className="text-muted-foreground max-w-xl mx-auto">
                Choose the plan that fits your causal analysis needs. 
                Upgrade anytime to access advanced simulations and priority features.
              </p>
            </div>

            {/* Pricing Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
              {tiers.map((tier) => (
                <div
                  key={tier.name}
                  className={`relative rounded-xl border p-6 flex flex-col ${
                    tier.highlighted
                      ? "border-primary bg-primary/5 shadow-lg shadow-primary/10"
                      : "border-border bg-card"
                  }`}
                >
                  {tier.highlighted && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-primary text-primary-foreground text-xs font-medium rounded-full">
                      Most Popular
                    </div>
                  )}
                  
                  <div className="flex items-center gap-3 mb-4">
                    <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${
                      tier.highlighted ? "bg-primary" : "bg-secondary"
                    }`}>
                      <tier.icon className={`h-5 w-5 ${
                        tier.highlighted ? "text-primary-foreground" : "text-foreground"
                      }`} />
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground">{tier.name}</h3>
                    </div>
                  </div>

                  <div className="mb-4">
                    <span className="text-4xl font-bold text-foreground">{tier.price}</span>
                    <span className="text-muted-foreground ml-1">/{tier.period}</span>
                  </div>

                  <p className="text-sm text-muted-foreground mb-6">
                    {tier.description}
                  </p>

                  <ul className="space-y-3 mb-8 flex-1">
                    {tier.features.map((feature) => (
                      <li key={feature} className="flex items-start gap-2">
                        <Check className={`h-4 w-4 mt-0.5 flex-shrink-0 ${
                          tier.highlighted ? "text-primary" : "text-muted-foreground"
                        }`} />
                        <span className="text-sm text-foreground">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <button
                    disabled={tier.ctaDisabled}
                    className={`w-full py-2.5 px-4 rounded-lg font-medium text-sm transition-colors ${
                      tier.highlighted
                        ? "bg-primary text-primary-foreground hover:bg-primary/90"
                        : tier.ctaDisabled
                        ? "bg-secondary text-muted-foreground cursor-not-allowed"
                        : "bg-secondary text-foreground hover:bg-secondary/80"
                    }`}
                  >
                    {tier.cta}
                  </button>
                </div>
              ))}
            </div>

            {/* $TIME Token Section */}
            <div className="rounded-xl border border-border bg-card p-6">
              <div className="flex items-start gap-4">
                <div className="h-12 w-12 rounded-lg bg-accent/20 flex items-center justify-center flex-shrink-0">
                  <span className="text-xl font-bold text-accent">$T</span>
                </div>
                <div>
                  <h3 className="font-semibold text-foreground mb-1">
                    Pay with $TIME Tokens
                  </h3>
                  <p className="text-sm text-muted-foreground mb-3">
                    Use $TIME tokens for pay-per-simulation runs. Stake tokens for higher limits, 
                    priority queue access, and revenue sharing. Available on TON and Solana.
                  </p>
                  <div className="flex flex-wrap gap-3">
                    <div className="px-3 py-1.5 bg-secondary rounded-lg text-xs text-foreground">
                      10-100 $TIME per deep simulation
                    </div>
                    <div className="px-3 py-1.5 bg-secondary rounded-lg text-xs text-foreground">
                      Stake for priority access
                    </div>
                    <div className="px-3 py-1.5 bg-secondary rounded-lg text-xs text-foreground">
                      Burn mechanism on premium runs
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Enterprise CTA */}
            <div className="mt-8 text-center">
              <p className="text-muted-foreground text-sm mb-2">
                Need custom solutions for your team or trading desk?
              </p>
              <a 
                href="mailto:enterprise@timeoe.ai" 
                className="text-primary hover:underline text-sm font-medium"
              >
                Contact us for Enterprise pricing ($500-5k/month)
              </a>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
