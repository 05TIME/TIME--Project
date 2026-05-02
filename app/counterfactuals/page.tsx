import { Header } from "@/components/header";
import { Sidebar } from "@/components/sidebar";
import { AIQueryPanel } from "@/components/ai-query-panel";

export default function CounterfactualsPage() {
  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Header />
        <main className="flex-1 p-6 overflow-auto">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-foreground mb-2">Counterfactual Simulation</h1>
            <p className="text-muted-foreground">
              Explore what-if scenarios by simulating alternative timelines and estimating treatment effects.
            </p>
          </div>
          <AIQueryPanel />
        </main>
      </div>
    </div>
  );
}
