import { Header } from "@/components/header";
import { Sidebar } from "@/components/sidebar";
import { Hash, ArrowRight } from "lucide-react";

const sampleVariables = [
  { name: "variable_a", type: "numeric", stats: { mean: 45.2, std: 12.3 } },
  { name: "variable_b", type: "numeric", stats: { mean: 128.7, std: 34.5 } },
  { name: "variable_c", type: "categorical", stats: { unique: 5 } },
  { name: "timestamp", type: "datetime", stats: { range: "2020-2024" } },
];

export default function VariablesPage() {
  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Header />
        <main className="flex-1 p-6 overflow-auto">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-foreground mb-2">Variables</h1>
            <p className="text-muted-foreground">
              Explore and configure variables from your datasets for causal analysis.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {sampleVariables.map((variable, i) => (
              <div key={i} className="bg-card border border-border rounded-xl p-4 hover:border-primary/50 transition-colors cursor-pointer">
                <div className="flex items-center gap-3 mb-3">
                  <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Hash className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-medium text-foreground text-sm">{variable.name}</h4>
                    <p className="text-xs text-muted-foreground">{variable.type}</p>
                  </div>
                </div>
                <div className="text-xs text-muted-foreground">
                  {variable.type === "numeric" && (
                    <p>Mean: {variable.stats.mean} | Std: {variable.stats.std}</p>
                  )}
                  {variable.type === "categorical" && (
                    <p>{variable.stats.unique} unique values</p>
                  )}
                  {variable.type === "datetime" && (
                    <p>Range: {variable.stats.range}</p>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8 bg-card border border-border rounded-xl p-6">
            <h3 className="font-medium text-foreground mb-4">Causal Relationships</h3>
            <div className="flex items-center gap-4 flex-wrap">
              <div className="flex items-center gap-2 px-3 py-2 bg-secondary rounded-lg">
                <span className="text-sm text-foreground">variable_a</span>
                <ArrowRight className="h-4 w-4 text-primary" />
                <span className="text-sm text-foreground">variable_b</span>
                <span className="text-xs text-muted-foreground ml-2">p=0.02</span>
              </div>
              <div className="flex items-center gap-2 px-3 py-2 bg-secondary rounded-lg">
                <span className="text-sm text-foreground">variable_b</span>
                <ArrowRight className="h-4 w-4 text-primary" />
                <span className="text-sm text-foreground">variable_c</span>
                <span className="text-xs text-muted-foreground ml-2">p=0.05</span>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
