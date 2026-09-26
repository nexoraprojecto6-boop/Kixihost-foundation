import type { PrismaClient } from "@kixihost/database";

export const ADMIN_ROLES = ["Support", "Operations", "Billing", "Security", "SuperAdmin"] as const;
export type AdminRoleName = (typeof ADMIN_ROLES)[number];

export type AdminPermission =
  | "dashboard.view"
  | "users.view"
  | "users.suspend"
  | "users.block"
  | "users.reactivate"
  | "users.change_plan"
  | "users.notify"
  | "users.grant_credit"
  | "billing.view"
  | "billing.manage"
  | "payments.view"
  | "infrastructure.view"
  | "infrastructure.manage"
  | "security.manage"
  | "support.manage"
  | "incidents.view"
  | "incidents.manage";

export interface RbacService {
  getRoles(userId: string): Promise<AdminRoleName[]>;
  hasPermission(userId: string, permission: AdminPermission): Promise<boolean>;
  assertPermission(userId: string, permission: AdminPermission): Promise<void>;
}

// RBAC real (regra 31) — nunca um simples isAdmin:boolean. Cada
// AdminRole tem permissões explícitas guardadas em JSON no schema.
export class PrismaRbacService implements RbacService {
  constructor(private readonly prisma: PrismaClient) {}

    async getRoles(userId: string): Promise<AdminRoleName[]> {
    const assignments = await this.prisma.adminRoleAssignment.findMany({
      where: { userId },
      include: { role: true },
    });
    return assignments.map((a: { role: { name: string } }) => a.role.name as AdminRoleName);
  }

  async hasPermission(userId: string, permission: AdminPermission): Promise<boolean> {
    const assignments = await this.prisma.adminRoleAssignment.findMany({
      where: { userId },
      include: { role: true },
    });
    return assignments.some((a: { role: { permissions: unknown } }) => {
      const permissions = (a.role.permissions as string[] | null) ?? [];
      return permissions.includes(permission);
    });
  }
  async assertPermission(userId: string, permission: AdminPermission): Promise<void> {
    const allowed = await this.hasPermission(userId, permission);
    if (!allowed) {
      throw new Error(`Utilizador ${userId} não tem a permissão "${permission}".`);
    }
  }
}
