import { cn } from "@/lib/utils";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

interface CausalityCardProps {
  title: string;
  value: string;
  change: string;
  status: "positive" | "negative" | "neutral";
}

export function CausalityCard({ title, value, change, status }: CausalityCardProps) {
  return (
    <div className="bg-card border border-border rounded-xl p-4">
      <p className="text-xs text-muted-foreground mb-2">{title}</p>
      <div className="flex items-end justify-between">
        <span className="text-2xl font-semibold text-foreground">{value}</span>
        <div
          className={cn(
            "flex items-center gap-1 text-xs font-medium",
            status === "positive" && "text-accent",
            status === "negative" && "text-destructive",
            status === "neutral" && "text-muted-foreground"
          )}
        >
          {status === "positive" && <TrendingUp className="h-3 w-3" />}
          {status === "negative" && <TrendingDown className="h-3 w-3" />}
          {status === "neutral" && <Minus className="h-3 w-3" />}
          <span>{change}</span>
        </div>
      </div>
    </div>
  );
}
