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
              title="Agro Product Prices"
              subtitle="New Benin Market"
              data={[
                { time: "Jan", yam: 2400, cassava: 1800, palmOil: 3200 },
                { time: "Feb", yam: 2600, cassava: 1900, palmOil: 3100 },
                { time: "Mar", yam: 2800, cassava: 2100, palmOil: 3400 },
                { time: "Apr", yam: 2500, cassava: 2000, palmOil: 3300 },
                { time: "May", yam: 2900, cassava: 2200, palmOil: 3600 },
                { time: "Jun", yam: 3100, cassava: 2400, palmOil: 3800 },
              ]}
            />
            <TemporalChart
              title="Remittance Flows"
              subtitle="Diaspora to Edo State"
              data={[
                { time: "Jan", outgoing: 496000, incoming: 381000 },
                { time: "Feb", outgoing: 520000, incoming: 390000 },
                { time: "Mar", outgoing: 480000, incoming: 375000 },
                { time: "Apr", outgoing: 510000, incoming: 400000 },
                { time: "May", outgoing: 540000, incoming: 420000 },
                { time: "Jun", outgoing: 580000, incoming: 450000 },
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
              title="Total Remittances"
              value="$2.1M"
              subtitle="Last 30 days"
            />
            <PriceCard
              title="Yam Price Index"
              value="3,100"
              unit="NGN/basket"
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
