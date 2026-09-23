// Definições estáticas de planos (fundação). Valores reais/definitivos
// serão confirmados na Fase 8 (Billing + Wallet).

export interface PlanDefinition {
  name: string;
  priceKz: number;
  trialDays: number;
  resourceLimits: {
    maxProjects: number;
    maxMemoryMb: number;
    maxBandwidthGb: number;
  };
}

export const DEFAULT_PLANS: PlanDefinition[] = [
  {
    name: "Starter",
    priceKz: 15_000,
    trialDays: 21,
    resourceLimits: { maxProjects: 3, maxMemoryMb: 512, maxBandwidthGb: 50 },
  },
  {
    name: "Pro",
    priceKz: 45_000,
    trialDays: 21,
    resourceLimits: { maxProjects: 15, maxMemoryMb: 2048, maxBandwidthGb: 250 },
  },
];
