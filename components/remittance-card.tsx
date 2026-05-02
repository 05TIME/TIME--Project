import { DollarSign } from "lucide-react";

interface RemittanceCardProps {
  title: string;
  value: string;
  subtitle: string;
}

export function RemittanceCard({ title, value, subtitle }: RemittanceCardProps) {
  return (
    <div className="bg-card border border-border rounded-xl p-4">
      <div className="flex items-center gap-2 mb-2">
        <div className="h-6 w-6 rounded bg-primary/10 flex items-center justify-center">
          <DollarSign className="h-3.5 w-3.5 text-primary" />
        </div>
        <p className="text-xs text-muted-foreground">{title}</p>
      </div>
      <span className="text-2xl font-semibold text-primary">{value}</span>
      <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>
    </div>
  );
}
