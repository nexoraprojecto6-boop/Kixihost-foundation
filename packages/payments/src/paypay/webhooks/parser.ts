import type { PayPayWebhookPayload } from "../types";

// A notificação assíncrona da PayPay chega como
// application/x-www-form-urlencoded (documentação, secção 4) — nunca
// JSON. O corpo já deve ter sido decodificado pelo body-parser do
// Express/NestJS (urlencoded()) antes de chegar aqui.
export function parsePayPayWebhook(rawBody: Record<string, string>): PayPayWebhookPayload {
  const required = [
    "notify_id",
    "notify_type",
    "notify_create",
    "input_charset",
    "sign",
    "sign_type",
    "out_trade_no",
    "inner_trade_no",
    "status",
    "amount",
    "gmt_create",
  ];

  for (const field of required) {
    if (!rawBody[field]) {
      throw new Error(`Payload de webhook PayPay inválido: campo obrigatório "${field}" em falta`);
    }
  }

  return rawBody as unknown as PayPayWebhookPayload;
}
