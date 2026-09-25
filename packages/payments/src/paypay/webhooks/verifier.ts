import type { PayPayConfig } from "../config";
import type { PayPayWebhookPayload } from "../types";
import { buildSignOriText } from "../crypto/sign";
import { verifySignature } from "../crypto/verify";

// Verifica a assinatura da notificação usando a chave PÚBLICA da
// PayPay (secção 3.8.1.3) — nunca a nossa própria chave.
export function verifyPayPayWebhook(payload: PayPayWebhookPayload, config: PayPayConfig): boolean {
  const orgText = buildSignOriText(payload as unknown as Record<string, string>);
  return verifySignature(orgText, payload.sign, config.publicKey);
}
