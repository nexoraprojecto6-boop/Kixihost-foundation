import type { PayPayWebhookPayload } from "../types";
import type { VerifyPaymentResult } from "../../interfaces/payment-provider";

// Mapeia a notificação já verificada (assinatura confirmada) para o
// resultado normalizado. Seguindo a recomendação oficial (secção
// 3.8.1.4): TRADE_SUCCESS deve ser ignorado silenciosamente (ainda não
// é o estado final); só TRADE_FINISHED confirma o pagamento.
export function processPayPayWebhook(payload: PayPayWebhookPayload): VerifyPaymentResult | null {
  if (payload.status === "TRADE_SUCCESS") {
    return null; // recomendação oficial: ignorar, aguardar TRADE_FINISHED
  }

  const status = payload.status === "TRADE_FINISHED" ? "VERIFIED" : "FAILED";

  return {
    status,
    amountKz: Number(payload.amount),
    currency: "AOA",
    providerRef: payload.inner_trade_no,
    kixihostReference: payload.out_trade_no,
    verifiedAt: payload.gmt_payment ? new Date(Number(payload.gmt_payment)) : new Date(),
  };
}
