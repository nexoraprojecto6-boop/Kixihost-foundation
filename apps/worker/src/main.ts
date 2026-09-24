// Ponto de entrada do Worker (Data Plane orchestration).
//
// O Worker é o único componente que executa builds e faz o
// provisionamento de deployments na infraestrutura cloud. Corre em
// produção como um processo cloud (não depende do computador local —
// ver regra 3/52 do documento de fundação).

import { Worker } from "bullmq";
import { DEPLOYMENT_QUEUE_NAME } from "@kixihost/deployments";
import { Logger } from "@kixihost/logging";
import { processDeploymentJob } from "./processors/deployment.processor";

const logger = new Logger("worker");

const connection = { url: process.env.REDIS_URL ?? "redis://localhost:6379" };

const deploymentWorker = new Worker(DEPLOYMENT_QUEUE_NAME, processDeploymentJob, {
  connection,
  concurrency: 2,
});

deploymentWorker.on("completed", (job) => {
  logger.info("Deployment job concluído", { deploymentId: job.data.deploymentId, jobId: job.id });
});

deploymentWorker.on("failed", (job, error) => {
  logger.error("Deployment job falhou", {
    deploymentId: job?.data?.deploymentId,
    jobId: job?.id,
    error: error.message,
  });
});

logger.info("KixiHost Worker a correr", { queue: DEPLOYMENT_QUEUE_NAME });

process.on("SIGTERM", async () => {
  await deploymentWorker.close();
  process.exit(0);
});
