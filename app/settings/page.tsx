import { Header } from "@/components/header";
import { Sidebar } from "@/components/sidebar";
import { Key, Bell, Shield, Palette } from "lucide-react";

export default function SettingsPage() {
  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Header />
        <main className="flex-1 p-6 overflow-auto">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-foreground mb-2">Settings</h1>
            <p className="text-muted-foreground">
              Configure your $TIMEOE experience.
            </p>
          </div>

          <div className="space-y-6 max-w-2xl">
            <div className="bg-card border border-border rounded-xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Key className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-medium text-foreground">API Keys</h3>
                  <p className="text-sm text-muted-foreground">Manage your API access</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <input
                  type="password"
                  value="sk-xxxxxxxxxxxxxxxx"
                  readOnly
                  className="flex-1 px-3 py-2 text-sm bg-input border border-border rounded-lg"
                />
                <button className="px-4 py-2 text-sm font-medium text-primary hover:bg-primary/10 rounded-lg transition-colors">
                  Regenerate
                </button>
              </div>
            </div>

            <div className="bg-card border border-border rounded-xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="h-10 w-10 rounded-lg bg-accent/10 flex items-center justify-center">
                  <Bell className="h-5 w-5 text-accent" />
                </div>
                <div>
                  <h3 className="font-medium text-foreground">Notifications</h3>
                  <p className="text-sm text-muted-foreground">Email and in-app alerts</p>
                </div>
              </div>
              <div className="space-y-3">
                <label className="flex items-center justify-between">
                  <span className="text-sm text-foreground">Analysis complete</span>
                  <input type="checkbox" defaultChecked className="h-4 w-4 rounded border-border" />
                </label>
                <label className="flex items-center justify-between">
                  <span className="text-sm text-foreground">Weekly reports</span>
                  <input type="checkbox" className="h-4 w-4 rounded border-border" />
                </label>
              </div>
            </div>

            <div className="bg-card border border-border rounded-xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="h-10 w-10 rounded-lg bg-green-500/10 flex items-center justify-center">
                  <Shield className="h-5 w-5 text-green-500" />
                </div>
                <div>
                  <h3 className="font-medium text-foreground">Security</h3>
                  <p className="text-sm text-muted-foreground">Account protection</p>
                </div>
              </div>
              <button className="px-4 py-2 text-sm font-medium bg-secondary text-foreground rounded-lg hover:bg-secondary/80 transition-colors">
                Enable Two-Factor Authentication
              </button>
            </div>

            <div className="bg-card border border-border rounded-xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="h-10 w-10 rounded-lg bg-purple-500/10 flex items-center justify-center">
                  <Palette className="h-5 w-5 text-purple-500" />
                </div>
                <div>
                  <h3 className="font-medium text-foreground">Appearance</h3>
                  <p className="text-sm text-muted-foreground">Theme preferences</p>
                </div>
              </div>
              <div className="flex gap-3">
                <button className="px-4 py-2 text-sm font-medium bg-primary text-primary-foreground rounded-lg">
                  Dark
                </button>
                <button className="px-4 py-2 text-sm font-medium bg-secondary text-foreground rounded-lg hover:bg-secondary/80 transition-colors">
                  Light
                </button>
                <button className="px-4 py-2 text-sm font-medium bg-secondary text-foreground rounded-lg hover:bg-secondary/80 transition-colors">
                  System
                </button>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
