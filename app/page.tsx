import { Header } from "@/components/header";
import { Sidebar } from "@/components/sidebar";
import { TimeOEHero } from "@/components/timeoe-hero";
import { TemporalChart } from "@/components/temporal-chart";
import { CausalityCard } from "@/components/causality-card";
import { RemittanceCard } from "@/components/remittance-card";
import { PriceCard } from "@/components/price-card";
import { AIQueryPanel } from "@/components/ai-query-panel";

export default function Dashboard() {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Header />
        <main className="flex-1 p-6 overflow-auto">
          <TimeOEHero />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <TemporalChart
              title="Sample Time Series"
              subtitle="Your Data Here"
              data={[
                { time: "T1", seriesA: 24, seriesB: 31, seriesC: 52 },
                { time: "T2", seriesA: 26, seriesB: 30, seriesC: 51 },
                { time: "T3", seriesA: 28, seriesB: 29, seriesC: 49 },
                { time: "T4", seriesA: 25, seriesB: 32, seriesC: 50 },
                { time: "T5", seriesA: 29, seriesB: 34, seriesC: 48 },
                { time: "T6", seriesA: 31, seriesB: 33, seriesC: 47 },
              ]}
            />
            <TemporalChart
              title="Causal Flow Analysis"
              subtitle="Input vs Output Variables"
              data={[
                { time: "T1", input: 496, output: 381 },
                { time: "T2", input: 520, output: 390 },
                { time: "T3", input: 480, output: 375 },
                { time: "T4", input: 510, output: 400 },
                { time: "T5", input: 540, output: 420 },
                { time: "T6", input: 580, output: 450 },
              ]}
              variant="area"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <CausalityCard
              title="Causality Score"
              value="0.87"
              change="+12%"
              status="positive"
            />
            <RemittanceCard
              title="Variables Tracked"
              value="128"
              subtitle="Active time series"
            />
            <PriceCard
              title="Model Accuracy"
              value="94.2"
              unit="%"
              trend="up"
            />
            <CausalityCard
              title="Treatment Effect"
              value="0.23"
              change="+5%"
              status="neutral"
            />
          </div>

          <AIQueryPanel />
        </main>
      </div>
    </div>
  );
}
