import { Header } from "@/components/header";
import { Sidebar } from "@/components/sidebar";
import { BotDashboard } from "@/components/bot-dashboard";

export default function BotPage() {
  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 p-6 overflow-auto">
          <BotDashboard />
        </main>
      </div>
    </div>
  );
}
