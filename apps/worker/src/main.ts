// Ponto de entrada do Worker (Data Plane orchestration + jobs de
// billing). Corre em produção como um processo cloud — nunca depende
// do computador local (regra 3/52).

import { Worker, Queue } from "bullmq";
import { DEPLOYMENT_QUEUE_NAME } from "@kixihost/deployments";
import { Logger } from "@kixihost/logging";
import { processDeploymentJob } from "./processors/deployment.processor";
import { BILLING_DEBIT_QUEUE_NAME } from "./jobs/billing-debit-job";
import { processBillingDebitJob } from "./processors/billing-debit.processor";

const logger = new Logger("worker");
const connection = { url: process.env.REDIS_URL ?? "redis://localhost:6379" };

// --- Deployments -----------------------------------------------------------

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

// --- Billing (job diário de activação de trial + débito de subscrição) -----

const billingQueue = new Queue(BILLING_DEBIT_QUEUE_NAME, { connection });

const billingWorker = new Worker(
  BILLING_DEBIT_QUEUE_NAME,
  async () => {
    await processBillingDebitJob();
  },
  { connection, concurrency: 1 },
);

billingWorker.on("completed", () => logger.info("Job de billing concluído"));
billingWorker.on("failed", (job, error) => logger.error("Job de billing falhou", { error: error.message }));

async function scheduleBillingJob() {
  await billingQueue.add(
    "billing-debit-cycle",
    {},
    { repeat: { pattern: "0 3 * * *" }, removeOnComplete: true, removeOnFail: false }, // todos os dias às 03:00
  );
}

scheduleBillingJob().catch((error) => logger.error("Falha ao agendar job de billing", { error: error.message }));

logger.info("KixiHost Worker a correr", {
  queues: [DEPLOYMENT_QUEUE_NAME, BILLING_DEBIT_QUEUE_NAME],
});

process.on("SIGTERM", async () => {
  await deploymentWorker.close();
  await billingWorker.close();
  process.exit(0);
});
