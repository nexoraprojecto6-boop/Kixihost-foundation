# Política de Controlo de Acesso

- Princípio do menor privilégio em todas as integrações (GitHub App,
  providers de infraestrutura, providers de pagamento).
- Acesso administrativo exige MFA obrigatório e é regido por RBAC
  (Support, Operations, Billing, Security, SuperAdmin) — nunca um
  simples `isAdmin: boolean`.
- Toda acção administrativa sensível exige Permission + Confirmation +
  AuditLog.
- Código de clientes nunca corre no Control Plane.
