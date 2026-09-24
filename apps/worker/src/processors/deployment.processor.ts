import type { Job } from "bullmq";
import { prisma } from "../lib/prisma";
import { transitionDeployment, writeDeploymentLog } from "../lib/deployment-transitions";
import {
  runBuildStage,
  runContainerizeStage,
  runFetchSourceStage,
  runHealthCheckStage,
  runInstallDependenciesStage,
  runTrafficSwitchStage,
} from "../pipeline/stub-stages";

export interface DeploymentJobData {
  deploymentId: string;
}

// Processor principal do pipeline de deployment. Regra crítica: se
// falhar em qualquer estágio, transiciona para FAILED e propaga o
// erro — mas NUNCA mexe na DeploymentVersion anterior já ACTIVE de
// outro deployment do mesmo projecto. Isso é garantido por desenho:
// só criamos/activamos uma nova versão no fim do pipeline (Fase 5C3).
export async function processDeploymentJob(job: Job<DeploymentJobData>): Promise<void> {
  const { deploymentId } = job.data;

  const deployment = await prisma.deployment.findUniqueOrThrow({ where: { id: deploymentId } });

  try {
    await transitionDeployment(deploymentId, "BUILDING", "worker started processing");
    await runFetchSourceStage(deploymentId, deployment.commitSha);
    await runInstallDependenciesStage(deploymentId);
    await runBuildStage(deploymentId);

    await transitionDeployment(deploymentId, "BUILT", "build stage completed");

    await transitionDeployment(deploymentId, "DEPLOYING", "starting deploy stage");
    await runContainerizeStage(deploymentId);

    await transitionDeployment(deploymentId, "HEALTH_CHECK", "container created, running health check");
    await runHealthCheckStage(deploymentId);
    await runTrafficSwitchStage(deploymentId);

    await transitionDeployment(deploymentId, "ACTIVE", "health check passed, traffic switched");
    await writeDeploymentLog(deploymentId, "deploy", "Deployment concluído com sucesso.");
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erro desconhecido no pipeline";
    await writeDeploymentLog(deploymentId, "deploy", `Deployment falhou: ${message}`, "error");

    // Só transiciona para FAILED se o estado actual permitir — evita
    // erro em cascata caso já tenha transicionado antes de falhar.
    const current = await prisma.deployment.findUniqueOrThrow({ where: { id: deploymentId } });
    if (current.status !== "FAILED") {
      await transitionDeployment(deploymentId, "FAILED", message).catch(() => undefined);
    }

    throw error; // propaga para o BullMQ marcar o job como failed
  }
}
