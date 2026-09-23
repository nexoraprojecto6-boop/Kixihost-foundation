// Job periódico de reconciliação de pagamentos pendentes (ver
// @kixihost/payments reconciliation). Nunca credita saldo directamente
// — delega ao mesmo caminho idempotente usado pelos webhooks.
// TODO(Fase 9): implementar processor real com BullMQ.
export const PAYMENT_RECONCILIATION_QUEUE_NAME = "payment-reconciliation";
