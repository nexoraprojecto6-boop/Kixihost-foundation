import { writeDeploymentLog } from "../lib/deployment-transitions";

// Estágios ainda por implementar de verdade (Fase 5C3): dependem do
// InfrastructureProvider (packages/providers) para provisionar
// containers reais na infraestrutura cloud.

async function simulateWork(ms: number): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, ms));
}

export async function runContainerizeStage(deploymentId: string): Promise<void> {
  await writeDeploymentLog(deploymentId, "deploy", "A criar container (stub — Fase 5C3)");
  await simulateWork(200);
}

export async function runHealthCheckStage(deploymentId: string): Promise<void> {
  await writeDeploymentLog(deploymentId, "health_check", "A correr health check (stub — Fase 5C3)");
  await simulateWork(200);
}

export async function runTrafficSwitchStage(deploymentId: string): Promise<void> {
  await writeDeploymentLog(deploymentId, "deploy", "A encaminhar tráfego para a nova versão (stub — Fase 5C3)");
  await simulateWork(200);
}
