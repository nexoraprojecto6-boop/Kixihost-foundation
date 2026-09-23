import type { PayPayWebhookPayload } from "../types";

// TODO(Fase 9): implementar parsing do corpo real do webhook PayPay
// conforme a documentação oficial.
export function parsePayPayWebhook(_rawBody: string): PayPayWebhookPayload {
  throw new Error("parsePayPayWebhook: not yet implemented (Fase 9)");
}
