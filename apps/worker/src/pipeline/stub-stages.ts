import { writeDeploymentLog } from "../lib/deployment-transitions";

// Estágios do pipeline, ainda como stubs (C1). Cada estágio real
// (obter código, instalar dependências, build, testes,
// containerização, health check, traffic switch) será implementado
// nas Partes C2/C3 — aqui garantimos apenas que o fluxo de estados e
// de logs funciona de ponta a ponta.

async function simulateWork(ms: number): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, ms));
}

export async function runFetchSourceStage(deploymentId: string, commitSha: string): Promise<void> {
  await writeDeploymentLog(deploymentId, "build", `A obter código do commit ${commitSha} (stub — Fase 5C2)`);
  await simulateWork(200);
}

export async function runInstallDependenciesStage(deploymentId: string): Promise<void> {
  await writeDeploymentLog(deploymentId, "build", "A instalar dependências (stub — Fase 5C2)");
  await simulateWork(200);
}

export async function runBuildStage(deploymentId: string): Promise<void> {
  await writeDeploymentLog(deploymentId, "build", "A construir a aplicação (stub — Fase 5C2)");
  await simulateWork(200);
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
