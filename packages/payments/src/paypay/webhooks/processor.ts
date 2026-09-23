import type { PayPayWebhookPayload } from "../types";
import type { VerifyPaymentResult } from "../../interfaces/payment-provider";

// Processa um webhook PayPay já verificado (assinatura confirmada) e
// idempotente (ver IdempotencyKey / WebhookEvent no schema), convertendo-o
// no resultado normalizado usado pelo resto do sistema de billing.
//
// TODO(Fase 9): mapear tradeStatus da PayPay para PaymentVerificationStatus
// conforme os valores documentados oficialmente.
export function processPayPayWebhook(_payload: PayPayWebhookPayload): VerifyPaymentResult {
  throw new Error("processPayPayWebhook: not yet implemented (Fase 9)");
}
