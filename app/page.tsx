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
              title="Global Economic Indicators"
              subtitle="World Bank Data"
              data={[
                { time: "Jan", gdp: 2.4, inflation: 3.1, unemployment: 5.2 },
                { time: "Feb", gdp: 2.6, inflation: 3.0, unemployment: 5.1 },
                { time: "Mar", gdp: 2.8, inflation: 2.9, unemployment: 4.9 },
                { time: "Apr", gdp: 2.5, inflation: 3.2, unemployment: 5.0 },
                { time: "May", gdp: 2.9, inflation: 3.4, unemployment: 4.8 },
                { time: "Jun", gdp: 3.1, inflation: 3.3, unemployment: 4.7 },
              ]}
            />
            <TemporalChart
              title="Cross-Border Capital Flows"
              subtitle="Global Markets"
              data={[
                { time: "Jan", inflows: 496000, outflows: 381000 },
                { time: "Feb", inflows: 520000, outflows: 390000 },
                { time: "Mar", inflows: 480000, outflows: 375000 },
                { time: "Apr", inflows: 510000, outflows: 400000 },
                { time: "May", inflows: 540000, outflows: 420000 },
                { time: "Jun", inflows: 580000, outflows: 450000 },
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
              title="Data Points Analyzed"
              value="2.1M"
              subtitle="Last 30 days"
            />
            <PriceCard
              title="Confidence Index"
              value="94.2"
              unit="% accuracy"
              trend="up"
            />
            <CausalityCard
              title="Counterfactual Delta"
              value="0.23"
              change="-5%"
              status="neutral"
            />
          </div>

          <AIQueryPanel />
        </main>
      </div>
    </div>
  );
}
