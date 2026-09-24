// Contrato do pipeline de deployment (ver regra 12 do prompt mestre):
//
// GitHub Push → Webhook → API → Criar Deployment → Queue → Worker →
// Obter código → Instalar dependências → Build → Testes → Criar versão →
// Container → Health Check → Traffic Switch → Monitorização

import type { DeploymentStatus } from "./deployment-state-machine";

export const DEPLOYMENT_QUEUE_NAME = "deployments";

export interface DeploymentContext {
  deploymentId: string;
  projectId: string;
  repositoryFullName: string;
  commitSha: string;
  branch: string;
}

export interface DeploymentStageResult {
  status: DeploymentStatus;
  logs: string[];
}

export interface DeploymentPipelineStage {
  name: string;
  run(context: DeploymentContext): Promise<DeploymentStageResult>;
}

// TODO(Fase 5C2/C3): implementar estágios concretos —
// FetchSourceStage, InstallDependenciesStage, BuildStage, TestStage,
// ContainerizeStage, HealthCheckStage, TrafficSwitchStage.
