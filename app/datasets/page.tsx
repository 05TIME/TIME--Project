import { Header } from "@/components/header";
import { Sidebar } from "@/components/sidebar";
import { Database, MoreVertical, TrendingUp, Calendar } from "lucide-react";

const sampleDatasets = [
  { name: "Sample Economic Data", rows: 1250, variables: 8, updated: "2 hours ago" },
  { name: "Climate Indicators", rows: 3600, variables: 12, updated: "1 day ago" },
  { name: "Stock Prices", rows: 5000, variables: 6, updated: "3 days ago" },
];

export default function DatasetsPage() {
  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Header />
        <main className="flex-1 p-6 overflow-auto">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-foreground mb-2">Datasets</h1>
            <p className="text-muted-foreground">
              Manage your uploaded time series datasets.
            </p>
          </div>

          <div className="bg-card border border-border rounded-xl overflow-hidden">
            <div className="p-4 border-b border-border flex items-center justify-between">
              <h3 className="font-medium text-foreground">Your Datasets</h3>
              <span className="text-sm text-muted-foreground">{sampleDatasets.length} datasets</span>
            </div>
            <div className="divide-y divide-border">
              {sampleDatasets.map((dataset, i) => (
                <div key={i} className="p-4 flex items-center justify-between hover:bg-secondary/50 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Database className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h4 className="font-medium text-foreground">{dataset.name}</h4>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <TrendingUp className="h-3 w-3" />
                          {dataset.rows.toLocaleString()} rows
                        </span>
                        <span>{dataset.variables} variables</span>
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {dataset.updated}
                        </span>
                      </div>
                    </div>
                  </div>
                  <button className="p-2 hover:bg-secondary rounded-lg transition-colors">
                    <MoreVertical className="h-4 w-4 text-muted-foreground" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
