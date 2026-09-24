import type { DeploymentStatus } from "@kixihost/deployments";
import { assertTransition } from "@kixihost/deployments";
import { prisma } from "./prisma";

// Ponte entre a máquina de estados (packages/deployments) e a base de
// dados. Toda transição de estado do Worker passa por aqui — nunca um
// `prisma.deployment.update` directo a mudar `status`, para garantir
// que a transição é válida e que gera sempre um DeploymentEvent.
export async function transitionDeployment(
  deploymentId: string,
  toStatus: DeploymentStatus,
  reason?: string,
): Promise<void> {
  const deployment = await prisma.deployment.findUniqueOrThrow({ where: { id: deploymentId } });

  assertTransition(deployment.status as DeploymentStatus, toStatus);

  await prisma.$transaction([
    prisma.deployment.update({
      where: { id: deploymentId },
      data: {
        status: toStatus,
        startedAt: toStatus === "BUILDING" ? new Date() : undefined,
        finishedAt: ["ACTIVE", "FAILED", "ROLLED_BACK", "CANCELLED"].includes(toStatus)
          ? new Date()
          : undefined,
      },
    }),
    prisma.deploymentEvent.create({
      data: { deploymentId, fromStatus: deployment.status, toStatus, reason },
    }),
  ]);
}

export async function writeDeploymentLog(
  deploymentId: string,
  stage: string,
  message: string,
  level: "info" | "warn" | "error" = "info",
): Promise<void> {
  await prisma.deploymentLog.create({
    data: { deploymentId, stage, message, level },
  });
}
