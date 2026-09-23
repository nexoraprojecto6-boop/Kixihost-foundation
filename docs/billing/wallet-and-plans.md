# Wallet e Planos

Modelo pré-pago em Kwanzas (Kz). O sistema desconta automaticamente o
valor do plano do saldo disponível. Período de teste: 21 dias, a
começar preferencialmente no primeiro deployment concluído com sucesso.

Distinção obrigatória:

- `DEPOSIT` — originado por um `Payment` com status `VERIFIED`.
- `PROMOTIONAL_CREDIT` — concedido manualmente por um admin, sempre
  associado a `grantedByAdminId` e `reason`. Nunca confundido com um
  depósito de cliente.
