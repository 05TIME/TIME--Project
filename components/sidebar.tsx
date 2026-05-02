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
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const navigation = [
  { name: "Overview", href: "/", icon: LayoutDashboard },
  { name: "Temporal Analysis", href: "/temporal", icon: Clock, badge: "AI" },
  { name: "Causality", href: "/causality", icon: GitBranch },
  { name: "Counterfactuals", href: "/counterfactuals", icon: Sparkles },
];

const dataNav = [
  { name: "Agro Prices", href: "/prices", icon: TrendingUp },
  { name: "Remittances", href: "/remittances", icon: Database },
  { name: "Land Records", href: "/land", icon: FileText },
  { name: "Diaspora Users", href: "/users", icon: Users },
];

const bottomNav = [
  { name: "Settings", href: "/settings", icon: Settings },
  { name: "Help", href: "/help", icon: HelpCircle },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 border-r border-border bg-card flex flex-col">
      <div className="p-4 border-b border-border">
        <Link href="/" className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
            <Clock className="h-5 w-5 text-primary-foreground" />
          </div>
          <div>
            <span className="font-semibold text-foreground">TIMEOE</span>
            <span className="ml-1 px-1.5 py-0.5 text-[10px] font-medium rounded bg-accent/20 text-accent">
              Engine
            </span>
          </div>
        </Link>
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
            Data Sources
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
                className="flex items-center gap-3 px-3 py-2 text-sm rounded-lg text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors"
              >
                <item.icon className="h-4 w-4" />
                <span>{item.name}</span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </aside>
  );
}
