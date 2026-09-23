# Verificação de Pagamentos — Regra Crítica

O KixiHost NÃO aceita comprovativos enviados por mensagem (screenshots,
SMS, WhatsApp, texto ao suporte, códigos digitados manualmente) como
confirmação de pagamento.

Fluxo obrigatório:

```
Cliente → KixiHost Checkout → PayPay/Multicaixa/outro provider →
Pagamento → Webhook/API oficial → Verificação → Payment VERIFIED →
WalletTransaction → Saldo creditado
```

Campos verificados: provider, transaction ID, amount, currency,
referência KixiHost, merchant/recipient, utilizador, status da
transacção, assinatura, duplicação, idempotência.

O mesmo pagamento nunca pode ser creditado duas vezes — garantido por
`WebhookEvent` + `IdempotencyKey` (ver `packages/database/prisma/schema.prisma`).
