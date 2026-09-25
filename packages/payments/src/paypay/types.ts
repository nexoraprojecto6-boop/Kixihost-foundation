// Tipos alinhados com a documentação oficial PayPay AO:
// https://portal.paypayafrica.com/dist/guide/apidoc_pt.html

export interface PayPayRequestEnvelope {
  charset: "UTF-8";
  biz_content: string; // base64, encriptado (ver crypto/rsa.ts)
  partner_id: string;
  service: "instant_trade" | "trade_refund" | "trade_close" | "trade_query";
  request_no: string;
  format: "JSON";
  sign: string;
  language: "pt" | "en";
  sign_type: "RSA";
  version: "1.0";
  timestamp: string; // "YYYY-MM-DD HH:mm:ss", fuso GMT+1 (Angola)
}

// --- 3.1 Criar Pedido de Pagamento Instantâneo (service: instant_trade) ---

export interface PayPayInstantTradeBizContent {
  cashier_type: "SDK";
  payer_ip: string;
  sale_product_code: string;
  timeout_express?: string; // ex.: "2h" (padrão), faixa 40m–7d
  trade_info: {
    currency: "AOA";
    out_trade_no: string; // referência interna KixiHost — WalletTransaction/Payment.kixihostRef
    payee_identity: string; // = partner_id
    payee_identity_type: "1";
    price: string; // até 2 casas decimais
    quantity: string;
    subject: string;
    total_amount: string;
  };
  return_url?: string;
}

export interface PayPayInstantTradeResponseBizContent {
  out_trade_no: string;
  trade_no: string; // número do pedido PayPay — guardar como providerRef
  status: string; // não é o estado final — ver PayPayOrderStatus
  trade_token: string; // paypayao://trade/pay?action=pay&tradeToken=...
  dynamic_link: string; // usado para gerar QR code
}

export interface PayPayApiResponse<T> {
  code: string; // "S0001" = sucesso
  sub_code: string;
  msg: string;
  sub_msg: string;
  sign: string;
  charset: string;
  sign_type: string;
  biz_content?: T;
}

// --- 3.6 Consultar Pedido (service: trade_query) ---

export type PayPayOrderStatus =
  | "WAIT_BUYER_PAY"
  | "TRADE_CLOSED"
  | "TRADE_SUCCESS"
  | "TRADE_FINISHED"
  | "REFUND_REQUEST_SUCCESS"
  | "REFUND_SUCCESS"
  | "REFUND_FAIL";

export interface PayPayTradeQueryBizContent {
  amount: string;
  out_trade_no: string;
  partner_id: string;
  subject: string;
  modify_time: string;
  payee_name: string;
  seller_actual_amount: string;
  trade_no: string;
  payer_id: string;
  payee_id: string;
  status: PayPayOrderStatus;
}

// --- 4. Notificação Assíncrona (webhook) ---
// Chega como application/x-www-form-urlencoded, NÃO JSON.

export type PayPayNotificationStatus =
  | "TRADE_SUCCESS"
  | "TRADE_FINISHED"
  | "TRADE_CLOSED"
  | "REFUND_SUCCESS"
  | "REFUND_FAIL"
  | "TRANSFER_SUCCESS"
  | "TRANSFER_FAIL"
  | "RETURN_TICKET";

export interface PayPayWebhookPayload {
  notify_id: string;
  notify_type: string;
  notify_create: string;
  input_charset: string;
  sign: string;
  sign_type: string;
  version?: string;
  out_trade_no: string;
  inner_trade_no: string;
  orig_out_trade_no?: string;
  status: PayPayNotificationStatus;
  amount: string;
  role?: string;
  payerIdentity?: string;
  payeeIdentity?: string;
  gmt_create: string;
  gmt_payment?: string;
  gmt_close?: string;
  failReason?: string;
  failCode?: string;
}
