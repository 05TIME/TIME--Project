"use client";

import {
  LayoutDashboard,
  Clock,
  GitBranch,
  Database,
  Settings,
  HelpCircle,
  Sparkles,
  TrendingUp,
  FileText,
  Users,
  Crown,
  Bot,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const navigation = [
  { name: "Overview", href: "/", icon: LayoutDashboard },
  { name: "Temporal Analysis", href: "/temporal", icon: Clock, badge: "AI" },
  { name: "Causality", href: "/causality", icon: GitBranch },
  { name: "Counterfactuals", href: "/counterfactuals", icon: Sparkles },
  { name: "Telegram Bot", href: "/bot", icon: Bot, badge: "NEW" },
];

const dataNav = [
  { name: "Upload Data", href: "/upload", icon: TrendingUp },
  { name: "Datasets", href: "/datasets", icon: Database },
  { name: "Variables", href: "/variables", icon: FileText },
  { name: "Saved Models", href: "/models", icon: Users },
];

const bottomNav = [
  { name: "Upgrade", href: "/pricing", icon: Crown, highlight: true },
  { name: "Settings", href: "/settings", icon: Settings },
  { name: "Help", href: "/help", icon: HelpCircle },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 border-r border-border bg-card flex flex-col">
      <div className="p-4 border-b border-border">
        <Link href="/" className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
            <Clock className="h-6 w-6 text-primary-foreground" />
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-foreground tracking-tight">$TIMEOE</span>
            <span className="text-[10px] text-muted-foreground">Time AI Godfather</span>
          </div>
        </Link>
        <div className="mt-3 flex items-center gap-2">
          <div className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse" />
          <span className="text-[10px] text-muted-foreground">Powered by Grok</span>
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-6 overflow-y-auto">
        <div>
          <p className="px-3 text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">
            Analysis
          </p>
          <ul className="space-y-1">
            {navigation.map((item) => {
              const isActive = pathname === item.href;
              return (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2 text-sm rounded-lg transition-colors",
                      isActive
                        ? "bg-primary/10 text-primary"
                        : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                    )}
                  >
                    <item.icon className="h-4 w-4" />
                    <span>{item.name}</span>
                    {item.badge && (
                      <span className="ml-auto px-1.5 py-0.5 text-[10px] font-medium rounded bg-accent/20 text-accent">
                        {item.badge}
                      </span>
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>

        <div>
          <p className="px-3 text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">
            Your Data
          </p>
          <ul className="space-y-1">
            {dataNav.map((item) => {
              const isActive = pathname === item.href;
              return (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2 text-sm rounded-lg transition-colors",
                      isActive
                        ? "bg-primary/10 text-primary"
                        : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                    )}
                  >
                    <item.icon className="h-4 w-4" />
                    <span>{item.name}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      </nav>

      <div className="p-4 border-t border-border">
        <ul className="space-y-1">
          {bottomNav.map((item) => (
            <li key={item.name}>
              <Link
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2 text-sm rounded-lg transition-colors",
                  "highlight" in item && item.highlight
                    ? "bg-primary/10 text-primary hover:bg-primary/20"
                    : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                )}
              >
                <item.icon className="h-4 w-4" />
                <span>{item.name}</span>
                {"highlight" in item && item.highlight && (
                  <span className="ml-auto px-1.5 py-0.5 text-[10px] font-medium rounded bg-primary text-primary-foreground">
                    PRO
                  </span>
                )}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </aside>
  );
}
