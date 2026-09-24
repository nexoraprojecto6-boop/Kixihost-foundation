import type { Job } from "bullmq";
import { prisma } from "../lib/prisma";
import { transitionDeployment, writeDeploymentLog } from "../lib/deployment-transitions";
import { githubAppClient } from "../lib/github-app-client";
import { ensureProjectServer } from "../lib/server-provisioning";
import { syncWorkspaceToServer } from "../lib/rsync";
import { createWorkspaceDir, destroyWorkspaceDir, downloadAndExtractSource } from "../pipeline/workspace";
import {
  resolveWorkDir,
  runBuildStageReal,
  runFetchSourceStageReal,
  runInstallDependenciesStageReal,
} from "../pipeline/build-stages";
import { runContainerizeStage, runHealthCheckStage, runTrafficSwitchStage } from "../pipeline/container-stages";

export interface DeploymentJobData {
  deploymentId: string;
}

const REMOTE_APP_DIR = "/opt/kixihost/app";

export async function processDeploymentJob(job: Job<DeploymentJobData>): Promise<void> {
  const { deploymentId } = job.data;

  const deployment = await prisma.deployment.findUniqueOrThrow({
    where: { id: deploymentId },
    include: {
      project: {
        include: { repository: { include: { installation: true } } },
      },
    },
  });

  const { project } = deployment;
  const { repository } = project;
  let workspaceDir: string | null = null;

  try {
    await transitionDeployment(deploymentId, "BUILDING", "worker started processing");

    workspaceDir = await createWorkspaceDir(deploymentId);
    const installationToken = await githubAppClient.getInstallationAccessToken(
      Number(repository.installation.installationId),
    );

    await downloadAndExtractSource({
      installationToken,
      repoFullName: repository.fullName,
      commitSha: deployment.commitSha,
      targetDir: workspaceDir,
    });
    await runFetchSourceStageReal(deploymentId, deployment.commitSha);

    const workDir = resolveWorkDir(workspaceDir, project.rootDirectory);

    await runInstallDependenciesStageReal(deploymentId, workDir);
    await runBuildStageReal(deploymentId, workDir, project.buildCommand);

    await transitionDeployment(deploymentId, "BUILT", "build stage completed");

    await transitionDeployment(deploymentId, "DEPLOYING", "starting deploy stage");
    const { serverId, ssh } = await ensureProjectServer(project.id);

    await writeDeploymentLog(deploymentId, "deploy", "A sincronizar código para o servidor...");
    await syncWorkspaceToServer({ localDir: workDir, remoteDir: REMOTE_APP_DIR, ssh });

    const { newPort } = await runContainerizeStage(deploymentId, ssh, REMOTE_APP_DIR);

    await transitionDeployment(deploymentId, "HEALTH_CHECK", "container created, running health check");
    await runHealthCheckStage(deploymentId, ssh, newPort);
    await runTrafficSwitchStage(deploymentId, ssh, newPort);

    await prisma.deploymentVersion.updateMany({
      where: { deployment: { projectId: project.id }, isActive: true },
      data: { isActive: false },
    });
    await prisma.deploymentVersion.create({
      data: { deploymentId, isActive: true, activatedAt: new Date() },
    });
    await prisma.serverAllocation.updateMany({
      where: { projectId: project.id },
      data: { serverId },
    });

    await transitionDeployment(deploymentId, "ACTIVE", "health check passed, traffic switched");
    await writeDeploymentLog(deploymentId, "deploy", "Deployment concluído com sucesso.");
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erro desconhecido no pipeline";
    await writeDeploymentLog(deploymentId, "deploy", `Deployment falhou: ${message}`, "error");

    const current = await prisma.deployment.findUniqueOrThrow({ where: { id: deploymentId } });
    if (current.status !== "FAILED") {
      await transitionDeployment(deploymentId, "FAILED", message).catch(() => undefined);
    }

    throw error;
  } finally {
    if (workspaceDir) {
      await destroyWorkspaceDir(workspaceDir).catch(() => undefined);
    }
  }
}
