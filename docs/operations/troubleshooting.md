# Troubleshooting (Fundação)

A expandir nas fases seguintes com problemas reais encontrados em
produção. Estrutura sugerida por sintoma:

- Deployment falha no build → ver Build logs no dashboard.
- Deployment falha no arranque (memória) → ver
  `packages/logging/src/deployment-log-formatter.ts` para o formato de
  mensagem esperado.
- Domínio não verifica → conferir `DomainVerification` e instruções DNS.
- Pagamento não credita saldo → conferir `WebhookEvent` e reconciliação
  (`packages/payments/src/reconciliation`).
