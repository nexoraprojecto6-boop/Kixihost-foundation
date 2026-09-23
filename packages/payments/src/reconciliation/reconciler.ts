import type { PaymentProvider, VerifyPaymentResult } from "../interfaces/payment-provider";

// Reconciliação periódica: compara pagamentos com status PENDING na
// base de dados contra o estado real reportado pelo provider, para
// apanhar casos em que um webhook não chegou (rede, outage, etc.).
//
// Nunca credita saldo directamente — apenas invoca `verifyPayment` do
// adapter correspondente e delega o crédito ao mesmo caminho usado
// pelos webhooks (idempotente).
export interface PendingPaymentRecord {
  providerRef: string;
  provider: PaymentProvider["name"];
}

export interface PaymentReconciler {
  reconcilePending(records: PendingPaymentRecord[]): Promise<VerifyPaymentResult[]>;
}
