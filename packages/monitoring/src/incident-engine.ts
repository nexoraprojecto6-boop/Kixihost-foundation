// Motor de incidentes (ver regra 34).
//
// Fluxo: Detectar → Criar Incident → Identificar impacto → Remover
// servidor não saudável do pool → Tentar recuperação → Provisionar
// replacement quando possível → Restaurar aplicação → Health Check →
// Traffic → Resolver Incident.
//
// Nem todos os problemas podem ser resolvidos automaticamente — falhas
// graves do provider podem exigir intervenção manual (não assumir
// recuperação total automática).

export type IncidentSeverity = "low" | "medium" | "high" | "critical";
export type IncidentStatus = "investigating" | "identified" | "monitoring" | "resolved";

export interface IncidentEngine {
  detectAndOpen(source: string, details: Record<string, unknown>): Promise<string>; // devolve incidentId
  removeUnhealthyServerFromPool(serverId: string): Promise<void>;
  attemptRecovery(incidentId: string): Promise<{ recovered: boolean }>;
  resolve(incidentId: string): Promise<void>;
}
