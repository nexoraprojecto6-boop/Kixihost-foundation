import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "@kixihost/database";
import { Queue } from "bullmq";
import { assertTransition } from "@kixihost/deployments";

export const DEPLOYMENT_QUEUE_NAME = "deployments";

export interface CreateDeploymentFromPushInput {
  projectId: string;
  commitSha: string;
  commitMessage: string;
  branch: string;
  triggeredBy: string; // "webhook" ou userId
}

@Injectable()
export class DeploymentsService {
  private readonly queue: Queue;

  constructor(private readonly prisma: PrismaService) {
    this.queue = new Queue(DEPLOYMENT_QUEUE_NAME, {
      connection: { url: process.env.REDIS_URL ?? "redis://localhost:6379" },
    });
  }

  async createFromPush(input: CreateDeploymentFromPushInput) {
    const deployment = await this.prisma.deployment.create({
      data: {
        projectId: input.projectId,
        commitSha: input.commitSha,
        commitMessage: input.commitMessage,
        branch: input.branch,
        triggeredBy: input.triggeredBy,
        status: "QUEUED",
      },
    });

    await this.prisma.deploymentEvent.create({
      data: { deploymentId: deployment.id, toStatus: "QUEUED", reason: "created" },
    });

    // Publica o job na queue consumida pelo Worker (Fase 5 — Parte C).
    await this.queue.add(
      "process-deployment",
      { deploymentId: deployment.id },
      { attempts: 1, removeOnComplete: true, removeOnFail: false },
    );

    return deployment;
  }

  async listByProject(userId: string, projectId: string) {
    const project = await this.prisma.project.findUnique({ where: { id: projectId } });
    if (!project || project.userId !== userId) {
      throw new NotFoundException("Projecto não encontrado.");
    }

    return this.prisma.deployment.findMany({
      where: { projectId },
      orderBy: { createdAt: "desc" },
    });
  }

  async getWithLogs(userId: string, deploymentId: string) {
    const deployment = await this.prisma.deployment.findUnique({
      where: { id: deploymentId },
      include: {
        project: true,
        logs: { orderBy: { createdAt: "asc" } },
        events: { orderBy: { createdAt: "asc" } },
      },
    });

    if (!deployment || deployment.project.userId !== userId) {
      throw new NotFoundException("Deployment não encontrado.");
    }

    return deployment;
  }

  /** Usado pelo Worker (Fase 5 — Parte C) para transicionar o estado com segurança. */
  async transitionStatus(deploymentId: string, toStatus: Parameters<typeof assertTransition>[1], reason?: string) {
    const deployment = await this.prisma.deployment.findUniqueOrThrow({ where: { id: deploymentId } });
    assertTransition(deployment.status as never, toStatus as never);

    await this.prisma.$transaction([
      this.prisma.deployment.update({
        where: { id: deploymentId },
        data: {
          status: toStatus,
          startedAt: toStatus === "BUILDING" ? new Date() : undefined,
          finishedAt: ["ACTIVE", "FAILED", "ROLLED_BACK", "CANCELLED"].includes(toStatus)
            ? new Date()
            : undefined,
        },
      }),
      this.prisma.deploymentEvent.create({
        data: { deploymentId, fromStatus: deployment.status, toStatus, reason },
      }),
    ]);
  }
}
