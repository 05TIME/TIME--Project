"use client";

import { createContext, useContext, useState, ReactNode } from "react";

export type SubscriptionTier = "free" | "pro" | "alpha";

interface UserContextType {
  tier: SubscriptionTier;
  simulationsToday: number;
  maxSimulations: number;
  incrementSimulations: () => boolean; // returns false if limit reached
  canRunSimulation: boolean;
  resetSimulations: () => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

const TIER_LIMITS: Record<SubscriptionTier, number> = {
  free: 5,
  pro: Infinity,
  alpha: Infinity,
};

export function UserProvider({ children }: { children: ReactNode }) {
  // In production, this would come from auth/database
  const [tier] = useState<SubscriptionTier>("free");
  const [simulationsToday, setSimulationsToday] = useState(0);

  const maxSimulations = TIER_LIMITS[tier];
  const canRunSimulation = simulationsToday < maxSimulations;

  const incrementSimulations = () => {
    if (!canRunSimulation) return false;
    setSimulationsToday((prev) => prev + 1);
    return true;
  };

  const resetSimulations = () => {
    setSimulationsToday(0);
  };

  return (
    <UserContext.Provider
      value={{
        tier,
        simulationsToday,
        maxSimulations,
        incrementSimulations,
        canRunSimulation,
        resetSimulations,
      }}
    >
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
}
