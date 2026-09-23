import type { AdminPermission } from "@kixihost/auth";

// Helper usado por cada página/rota do Admin para garantir que o
// utilizador tem a permissão exigida antes de renderizar/agir.
// Acções sensíveis devem também exigir confirmação explícita + AuditLog
// (ver regra 31).
//
// TODO(Fase 11): implementar integração real com RbacService.
export interface RequirePermissionOptions {
  permission: AdminPermission;
  requireConfirmation?: boolean;
}
