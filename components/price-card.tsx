import { TrendingUp, TrendingDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface PriceCardProps {
  title: string;
  value: string;
  unit: string;
  trend: "up" | "down";
}

export function PriceCard({ title, value, unit, trend }: PriceCardProps) {
  return (
    <div className="bg-card border border-border rounded-xl p-4">
      <p className="text-xs text-muted-foreground mb-2">{title}</p>
      <div className="flex items-center gap-2">
        <span className="text-2xl font-semibold text-foreground">{value}</span>
        <div
          className={cn(
            "p-1 rounded",
            trend === "up" ? "bg-accent/10" : "bg-destructive/10"
          )}
        >
          {trend === "up" ? (
            <TrendingUp className="h-4 w-4 text-accent" />
          ) : (
            <TrendingDown className="h-4 w-4 text-destructive" />
          )}
        </div>
      </div>
      <p className="text-xs text-muted-foreground mt-1">{unit}</p>
    </div>
  );
}
