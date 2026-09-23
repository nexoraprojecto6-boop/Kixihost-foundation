import type { PayPayConfig } from "../config";
import type { PayPayWebhookPayload } from "../types";
import { verifyPayPaySignature } from "../crypto/verify";

// Verifica a assinatura de um webhook PayPay antes de qualquer
// processamento — nenhum webhook não verificado pode creditar saldo.
export function verifyPayPayWebhook(
  payload: PayPayWebhookPayload,
  config: PayPayConfig,
): boolean {
  return verifyPayPaySignature(payload as unknown as Record<string, unknown>, payload.sign, config.publicKey);
}
