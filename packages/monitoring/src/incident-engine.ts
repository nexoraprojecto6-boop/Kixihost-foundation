import type { PrismaClient } from "@kixihost/database";

export type IncidentSeverity = "low" | "medium" | "high" | "critical";
export type IncidentStatus = "investigating" | "identified" | "monitoring" | "resolved";

export interface IncidentEngine {
  detectAndOpen(
    title: string,
    description: string,
    severity: IncidentSeverity,
  ): Promise<string>;
  removeUnhealthyServerFromPool(serverId: string): Promise<void>;
  resolve(incidentId: string): Promise<void>;
}

// Implementação real. Segue o fluxo da regra 34: detectar → criar
// Incident → remover servidor não saudável do pool → (tentativa de
// recuperação e provisionamento de substituto ficam para uma
// iteração futura — não fingimos automação total onde ainda não
// existe) → resolver quando confirmado.
export class PrismaIncidentEngine implements IncidentEngine {
  constructor(private readonly prisma: PrismaClient) {}

  async detectAndOpen(title: string, description: string, severity: IncidentSeverity): Promise<string> {
    // Evita duplicar incidentes abertos para o mesmo título ainda não resolvido.
    const existing = await this.prisma.incident.findFirst({
      where: { title, status: { not: "resolved" } },
    });
    if (existing) return existing.id;

    const incident = await this.prisma.incident.create({
      data: { title, description, severity, status: "investigating" },
    });
    return incident.id;
  }

  async removeUnhealthyServerFromPool(serverId: string): Promise<void> {
    await this.prisma.server.update({ where: { id: serverId }, data: { status: "unhealthy" } });
  }

  async resolve(incidentId: string): Promise<void> {
    await this.prisma.incident.update({
      where: { id: incidentId },
      data: { status: "resolved", resolvedAt: new Date() },
    });
  }
}
