// Tipos para a integração PayPay AO.
//
// IMPORTANTE: os campos exactos de request/response (nomes de parâmetros,
// formatos, códigos de retorno) DEVEM ser confirmados directamente na
// documentação oficial antes da implementação real:
// https://portal.paypayafrica.com/dist/guide/apidoc_pt.html
//
// Os tipos abaixo são placeholders estruturais para a Fase 9
// (Implementação PayPay) — não devem ser tratados como definitivos.

/** TODO(Fase 9): confirmar payload exacto de criação de ordem na doc oficial. */
export interface PayPayCreateOrderRequest {
  partnerId: string;
  saleProductCode: string;
  outTradeNo: string; // referência interna KixiHost
  totalAmount: number;
  currency: "AOA";
  // TODO: demais campos obrigatórios conforme documentação oficial
}

/** TODO(Fase 9): confirmar payload exacto de resposta de criação de ordem. */
export interface PayPayCreateOrderResponse {
  code: string;
  msg?: string;
  data?: {
    tradeToken?: string;
    redirectUrl?: string;
    // TODO: demais campos conforme documentação oficial
  };
}

/** TODO(Fase 9): confirmar payload exacto de notificação/webhook. */
export interface PayPayWebhookPayload {
  outTradeNo: string;
  tradeNo: string;
  tradeStatus: string;
  totalAmount: string;
  sign: string;
  // TODO: demais campos conforme documentação oficial
}
