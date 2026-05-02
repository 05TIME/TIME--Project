"use client";

import { Search, Bell, ChevronDown, Calendar } from "lucide-react";
import { useState } from "react";

export function Header() {
  const [timeRange, setTimeRange] = useState("Last 12 hours");

  return (
    <header className="flex items-center justify-between px-6 py-4 border-b border-border bg-card">
      <div className="flex items-center gap-4">
        <h1 className="text-xl font-semibold text-foreground">Temporal Analysis</h1>
        <span className="px-2 py-1 text-xs font-medium rounded bg-primary/10 text-primary">
          Production
        </span>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search..."
            className="w-64 pl-10 pr-4 py-2 text-sm bg-input border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring text-foreground placeholder:text-muted-foreground"
          />
        </div>

        <button className="flex items-center gap-2 px-3 py-2 text-sm bg-secondary rounded-lg hover:bg-secondary/80 transition-colors">
          <Calendar className="h-4 w-4" />
          <span>{timeRange}</span>
          <ChevronDown className="h-4 w-4" />
        </button>

        <button className="relative p-2 rounded-lg hover:bg-secondary transition-colors">
          <Bell className="h-5 w-5 text-muted-foreground" />
          <span className="absolute top-1 right-1 h-2 w-2 bg-accent rounded-full" />
        </button>

        <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-medium text-sm">
          RI
        </div>
      </div>
    </header>
  );
}
