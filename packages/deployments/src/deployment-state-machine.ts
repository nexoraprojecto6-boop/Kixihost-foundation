// Máquina de estados dos deployments (ver regra 13 do prompt mestre).
//
// Regra crítica: um deployment que falha NUNCA derruba automaticamente
// a versão anterior activa. A versão anterior permanece ACTIVE até que
// um novo deployment complete health checks com sucesso, ou até um
// rollback explícito.

export type DeploymentStatus =
  | "QUEUED"
  | "BUILDING"
  | "BUILT"
  | "DEPLOYING"
  | "HEALTH_CHECK"
  | "ACTIVE"
  | "FAILED"
  | "ROLLED_BACK"
  | "CANCELLED";

const ALLOWED_TRANSITIONS: Record<DeploymentStatus, DeploymentStatus[]> = {
  QUEUED: ["BUILDING", "CANCELLED"],
  BUILDING: ["BUILT", "FAILED", "CANCELLED"],
  BUILT: ["DEPLOYING", "FAILED", "CANCELLED"],
  DEPLOYING: ["HEALTH_CHECK", "FAILED"],
  HEALTH_CHECK: ["ACTIVE", "FAILED"],
  ACTIVE: ["ROLLED_BACK"],
  FAILED: [],
  ROLLED_BACK: [],
  CANCELLED: [],
};

export function canTransition(from: DeploymentStatus, to: DeploymentStatus): boolean {
  return ALLOWED_TRANSITIONS[from].includes(to);
}

export function assertTransition(from: DeploymentStatus, to: DeploymentStatus): void {
  if (!canTransition(from, to)) {
    throw new Error(`Transição de deployment inválida: ${from} → ${to}`);
  }
}
