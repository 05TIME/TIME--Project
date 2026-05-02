import { Header } from "@/components/header";
import { Sidebar } from "@/components/sidebar";
import { Upload, FileSpreadsheet, Clock } from "lucide-react";

export default function UploadPage() {
  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Header />
        <main className="flex-1 p-6 overflow-auto">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-foreground mb-2">Upload Data</h1>
            <p className="text-muted-foreground">
              Upload your time series data in CSV, JSON, or Excel format for analysis.
            </p>
          </div>

          <div className="border-2 border-dashed border-border rounded-xl p-12 text-center bg-card hover:border-primary/50 transition-colors cursor-pointer">
            <div className="flex justify-center mb-4">
              <div className="h-16 w-16 rounded-xl bg-primary/10 flex items-center justify-center">
                <Upload className="h-8 w-8 text-primary" />
              </div>
            </div>
            <h3 className="text-lg font-medium text-foreground mb-2">
              Drag and drop your files here
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              or click to browse from your computer
            </p>
            <p className="text-xs text-muted-foreground">
              Supported formats: CSV, JSON, XLSX (max 50MB)
            </p>
          </div>

          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-card border border-border rounded-xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <FileSpreadsheet className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h4 className="font-medium text-foreground">Data Format</h4>
                  <p className="text-sm text-muted-foreground">Requirements</p>
                </div>
              </div>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>First column should be timestamps or dates</li>
                <li>Subsequent columns are your variables</li>
                <li>Headers required in first row</li>
                <li>No missing values in timestamp column</li>
              </ul>
            </div>

            <div className="bg-card border border-border rounded-xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="h-10 w-10 rounded-lg bg-accent/10 flex items-center justify-center">
                  <Clock className="h-5 w-5 text-accent" />
                </div>
                <div>
                  <h4 className="font-medium text-foreground">Time Formats</h4>
                  <p className="text-sm text-muted-foreground">Supported</p>
                </div>
              </div>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>ISO 8601 (2024-01-15T10:30:00Z)</li>
                <li>Unix timestamps (milliseconds)</li>
                <li>Date strings (Jan 15, 2024)</li>
                <li>Custom formats (auto-detected)</li>
              </ul>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
