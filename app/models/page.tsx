import { Header } from "@/components/header";
import { Sidebar } from "@/components/sidebar";
import { Brain, CheckCircle, Clock, Play } from "lucide-react";

const sampleModels = [
  { name: "VAR Model - Economic", status: "trained", accuracy: 94.2, lastRun: "1 hour ago" },
  { name: "Granger Causality Test", status: "trained", accuracy: 87.5, lastRun: "3 hours ago" },
  { name: "ARIMA Forecast", status: "training", accuracy: null, lastRun: "Running..." },
];

export default function ModelsPage() {
  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Header />
        <main className="flex-1 p-6 overflow-auto">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-foreground mb-2">Saved Models</h1>
            <p className="text-muted-foreground">
              View and manage your trained causal and forecasting models.
            </p>
          </div>

          <div className="space-y-4">
            {sampleModels.map((model, i) => (
              <div key={i} className="bg-card border border-border rounded-xl p-4 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Brain className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-medium text-foreground">{model.name}</h4>
                    <div className="flex items-center gap-3 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        {model.status === "trained" ? (
                          <CheckCircle className="h-3 w-3 text-green-500" />
                        ) : (
                          <Clock className="h-3 w-3 text-yellow-500 animate-spin" />
                        )}
                        {model.status}
                      </span>
                      {model.accuracy && <span>Accuracy: {model.accuracy}%</span>}
                      <span>{model.lastRun}</span>
                    </div>
                  </div>
                </div>
                <button className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground text-sm font-medium rounded-lg hover:bg-primary/90 transition-colors">
                  <Play className="h-4 w-4" />
                  Run
                </button>
              </div>
            ))}
          </div>
        </main>
      </div>
    </div>
  );
}
