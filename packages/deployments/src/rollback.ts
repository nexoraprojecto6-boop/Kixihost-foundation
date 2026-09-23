import type { DeploymentStatus } from "./deployment-state-machine";

// Contrato de rollback: activa uma DeploymentVersion anterior como
// versão em produção, sem exigir um novo build.
export interface RollbackRequest {
  projectId: string;
  targetDeploymentVersionId: string;
  requestedByUserId: string;
}

export interface RollbackResult {
  status: DeploymentStatus;
  activatedVersionId: string;
}

export interface RollbackService {
  rollback(request: RollbackRequest): Promise<RollbackResult>;
}
