# Runbook — Rollback de Deployment

1. Identificar a `DeploymentVersion` alvo (última versão `ACTIVE` antes
   da actual, ou outra à escolha do utilizador/admin).
2. Invocar `RollbackService.rollback` (ver `packages/deployments/src/rollback.ts`).
3. Confirmar `DeploymentEvent` registado com a transição para
   `ROLLED_BACK`.
4. Confirmar tráfego a apontar para a versão restaurada.
5. Notificar o utilizador (ver `@kixihost/notifications`).
