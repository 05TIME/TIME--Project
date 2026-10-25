/**
 * Worked example: pricing / booking decisions for the Lekki Phase 1 apartment.
 * ALL NUMBERS HERE ARE EXAMPLE DATA — illustrative only, not real prices, bookings or market figures.
 */
import { linearTrend } from "../../temporal_reasoning";
import { fitAR, forecast } from "../../counterfactual_simulation";
import type { AgentDefinition, StepContext } from "../types";

export interface LekkiState {
  [k: string]: number | number[];
  nightlyRateNgn: number;
  floorRateNgn: number;
  ceilingRateNgn: number;
  bookedNights: number;
  revenueNgn: number;
}

export interface LekkiObservation {
  [k: string]: number | boolean | null | { nights: number; offeredRateNgn: number };
  /** occupancy over the trailing 7 days, 0..1 */
  occupancy7d: number;
  /** median nightly rate of comparable listings (EXAMPLE DATA) */
  competitorRateNgn: number;
  inquiries: number;
  /** pending booking request, if any */
  bookingRequest: { nights: number; offeredRateNgn: number } | null;
}

type Ctx = StepContext<LekkiState, LekkiObservation>;
const occSeries = (c: Ctx) => [...c.history.map((h) => h.occupancy7d), c.observation.occupancy7d];
const occTrend = (c: Ctx) => (occSeries(c).length >= 3 ? linearTrend(occSeries(c)).slope : 0);
/** next-step occupancy forecast via the engine's AR(1) model (falls back to current value) */
function occForecast(c: Ctx): number {
  const s = occSeries(c);
  if (s.length < 5) return c.observation.occupancy7d;
  try { return forecast(s, fitAR(s, 1), 1)[0]; } catch { return c.observation.occupancy7d; }
}
const round = (n: number) => Math.round(n / 500) * 500;
const clamp = (s: LekkiState, r: number) => Math.min(s.ceilingRateNgn, Math.max(s.floorRateNgn, round(r)));

export const LEKKI_EXAMPLE_INITIAL_STATE: LekkiState = {
  nightlyRateNgn: 85000, floorRateNgn: 60000, ceilingRateNgn: 140000, bookedNights: 0, revenueNgn: 0,
};

export const lekkiPricingAgent: AgentDefinition<LekkiState, LekkiObservation> = {
  id: "lekki-pricing",
  version: "1.0.0",
  description: "EXAMPLE agent: nightly-rate and booking decisions for the Lekki Phase 1 apartment (example data only).",
  initialState: LEKKI_EXAMPLE_INITIAL_STATE,
  rules: [
    {
      id: "accept-booking",
      priority: 10,
      description: "Accept a booking request offering at least 95% of the current rate.",
      guard: (c) => !!c.observation.bookingRequest && c.observation.bookingRequest.offeredRateNgn >= 0.95 * c.state.nightlyRateNgn,
      action: (c) => ({ type: "accept_booking", payload: { ...c.observation.bookingRequest! } }),
      reason: (c) => `Offer ₦${c.observation.bookingRequest!.offeredRateNgn} ≥ 95% of current rate ₦${c.state.nightlyRateNgn}.`,
    },
    {
      id: "counter-booking",
      priority: 20,
      description: "Counter-offer a lowball request at the floor or 95% of rate, whichever is higher.",
      guard: (c) => !!c.observation.bookingRequest,
      action: (c) => ({ type: "counter_booking", payload: { nights: c.observation.bookingRequest!.nights, counterRateNgn: clamp(c.state, 0.95 * c.state.nightlyRateNgn) } }),
      reason: (c) => `Offer ₦${c.observation.bookingRequest!.offeredRateNgn} below 95% of ₦${c.state.nightlyRateNgn}; countering.`,
    },
    {
      id: "surge",
      priority: 30,
      description: "Raise 10% when occupancy ≥ 85% or forecast occupancy ≥ 90% with ≥ 5 inquiries.",
      guard: (c) => c.observation.occupancy7d >= 0.85 || (occForecast(c) >= 0.9 && c.observation.inquiries >= 5),
      action: (c) => ({ type: "set_rate", payload: { nightlyRateNgn: clamp(c.state, c.state.nightlyRateNgn * 1.1) } }),
      reason: (c) => `High demand: occupancy ${c.observation.occupancy7d.toFixed(2)}, AR(1) forecast ${occForecast(c).toFixed(2)}, ${c.observation.inquiries} inquiries.`,
    },
    {
      id: "undercut-response",
      priority: 40,
      description: "If we are >15% above competitors and occupancy < 60%, move to 5% above competitor median.",
      guard: (c) => c.state.nightlyRateNgn > 1.15 * c.observation.competitorRateNgn && c.observation.occupancy7d < 0.6,
      action: (c) => ({ type: "set_rate", payload: { nightlyRateNgn: clamp(c.state, c.observation.competitorRateNgn * 1.05) } }),
      reason: (c) => `Rate ₦${c.state.nightlyRateNgn} is >15% above competitor ₦${c.observation.competitorRateNgn} with occupancy ${c.observation.occupancy7d.toFixed(2)}.`,
    },
    {
      id: "falling-demand-discount",
      priority: 50,
      description: "Discount 5% when occupancy < 50% and the occupancy trend is falling.",
      guard: (c) => c.observation.occupancy7d < 0.5 && occTrend(c) < 0,
      action: (c) => ({ type: "set_rate", payload: { nightlyRateNgn: clamp(c.state, c.state.nightlyRateNgn * 0.95) } }),
      reason: (c) => `Occupancy ${c.observation.occupancy7d.toFixed(2)} with falling trend (slope ${occTrend(c).toFixed(3)}).`,
    },
    {
      id: "price-probe",
      priority: 60,
      description: "Seeded exploration: ~10% of steps probe +3% to learn demand elasticity (reproducible via seed).",
      guard: (c) => c.random < 0.1,
      action: (c) => ({ type: "set_rate", payload: { nightlyRateNgn: clamp(c.state, c.state.nightlyRateNgn * 1.03) } }),
      reason: (c) => `Seeded probe: random draw ${c.random.toFixed(4)} < 0.10.`,
    },
    {
      id: "hold",
      priority: 100,
      description: "Otherwise keep the current rate.",
      guard: () => true,
      action: (c) => ({ type: "hold", payload: { nightlyRateNgn: c.state.nightlyRateNgn } }),
      reason: () => "No pricing condition met; holding rate.",
    },
  ],
  reduce: (s, a) => {
    const p = a.payload as Record<string, number>;
    switch (a.type) {
      case "set_rate": return { ...s, nightlyRateNgn: p.nightlyRateNgn };
      case "accept_booking": return { ...s, bookedNights: s.bookedNights + p.nights, revenueNgn: s.revenueNgn + p.nights * p.offeredRateNgn };
      default: return { ...s };
    }
  },
};

/** EXAMPLE DATA: two illustrative weeks of observations. */
export const LEKKI_EXAMPLE_OBSERVATIONS: LekkiObservation[] = [
  { occupancy7d: 0.55, competitorRateNgn: 80000, inquiries: 3, bookingRequest: null },
  { occupancy7d: 0.5, competitorRateNgn: 78000, inquiries: 2, bookingRequest: null },
  { occupancy7d: 0.45, competitorRateNgn: 76000, inquiries: 2, bookingRequest: null },
  { occupancy7d: 0.42, competitorRateNgn: 70000, inquiries: 1, bookingRequest: { nights: 3, offeredRateNgn: 70000 } },
  { occupancy7d: 0.48, competitorRateNgn: 75000, inquiries: 4, bookingRequest: { nights: 2, offeredRateNgn: 80000 } },
  { occupancy7d: 0.6, competitorRateNgn: 82000, inquiries: 5, bookingRequest: null },
  { occupancy7d: 0.72, competitorRateNgn: 88000, inquiries: 7, bookingRequest: null },
  { occupancy7d: 0.86, competitorRateNgn: 92000, inquiries: 9, bookingRequest: null },
  { occupancy7d: 0.9, competitorRateNgn: 95000, inquiries: 8, bookingRequest: { nights: 4, offeredRateNgn: 98000 } },
  { occupancy7d: 0.8, competitorRateNgn: 93000, inquiries: 4, bookingRequest: null },
];

export const LEKKI_EXAMPLE_INPUT = {
  seed: 42,
  clock: { startIso: "2026-11-02T09:00:00.000Z", stepMs: 86_400_000 },
  observations: LEKKI_EXAMPLE_OBSERVATIONS,
};
