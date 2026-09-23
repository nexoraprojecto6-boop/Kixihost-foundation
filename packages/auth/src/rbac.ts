// RBAC para o painel administrativo (ver regra 31).
//
// Nunca usar um simples `isAdmin: boolean`. Cada AdminRole tem um
// conjunto explícito de permissões, e acções sensíveis exigem
// Permission + Confirmation + AuditLog (regra 31).

export const ADMIN_ROLES = ["Support", "Operations", "Billing", "Security", "SuperAdmin"] as const;
export type AdminRoleName = (typeof ADMIN_ROLES)[number];

export type AdminPermission =
  | "users.view"
  | "users.suspend"
  | "users.grant_credit"
  | "billing.view"
  | "billing.manage"
  | "payments.view"
  | "infrastructure.view"
  | "infrastructure.manage"
  | "security.manage"
  | "support.manage";

export interface RbacService {
  hasPermission(userId: string, permission: AdminPermission): Promise<boolean>;
  /** Acções sensíveis: verifica permissão E exige registo em AuditLog pelo chamador. */
  assertPermission(userId: string, permission: AdminPermission): Promise<void>;
}
