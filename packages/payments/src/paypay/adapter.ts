import type {
  InitiatePaymentParams,
  InitiatePaymentResult,
  PaymentProvider,
  PaymentVerificationStatus,
  VerifyPaymentParams,
  VerifyPaymentResult,
} from "../interfaces/payment-provider";
import type { PayPayConfig } from "./config";
import { PayPayClient } from "./client";
import { mapPayPayError } from "./errors";
import type { PayPayOrderStatus } from "./types";

// Estado final recomendado pela documentação oficial (secção 3.6.3):
// TRADE_FINISHED = fundos já liquidados na conta do merchant.
function mapOrderStatus(status: PayPayOrderStatus): PaymentVerificationStatus {
  if (status === "TRADE_FINISHED") return "VERIFIED";
  if (status === "TRADE_CLOSED" || status === "REFUND_SUCCESS") return "FAILED";
  return "PENDING";
}

export class PayPayAdapter implements PaymentProvider {
  readonly name = "paypay" as const;
  private readonly client: PayPayClient;

  constructor(private readonly config: PayPayConfig) {
    this.client = new PayPayClient(config);
  }

  async initiatePayment(params: InitiatePaymentParams): Promise<InitiatePaymentResult> {
    const response = await this.client.createInstantTrade({
      payerIp: "0.0.0.0", // TODO: propagar o IP real do utilizador a partir do controller da API
      outTradeNo: params.kixihostReference,
      priceKz: params.amountKz,
      subject: "Adicionar saldo KixiHost",
    });

    if (response.code !== "S0001" || !response.biz_content) {
      throw mapPayPayError(response.msg || response.sub_msg, undefined);
    }

    return {
      providerRef: response.biz_content.trade_no,
      redirectUrl: response.biz_content.dynamic_link,
      raw: response.biz_content,
    };
  }

  async verifyPayment(params: VerifyPaymentParams): Promise<VerifyPaymentResult> {
    // A consulta usa out_trade_no (a nossa referência), não o providerRef
    // do PayPay — ver 3.6.1 da documentação oficial.
    const response = await this.client.queryTrade(params.providerRef);

    if (response.code !== "S0001" || !response.biz_content) {
      throw mapPayPayError(response.msg || response.sub_msg, undefined);
    }

    return {
      status: mapOrderStatus(response.biz_content.status),
      amountKz: Number(response.biz_content.amount),
      currency: "AOA",
      providerRef: response.biz_content.trade_no,
      kixihostReference: response.biz_content.out_trade_no,
      verifiedAt: new Date(response.biz_content.modify_time),
    };
  }

  verifyWebhookSignature(): boolean {
    // A verificação real acontece em webhooks/verifier.ts, que precisa
    // do payload já parseado (campos individuais), não do corpo bruto —
    // ver nota em processor.ts. Este método existe apenas para cumprir
    // o contrato PaymentProvider; o fluxo real de webhook não passa por
    // aqui (ver DomainsController-style dedicated webhook controller na Fase 9 API).
    throw new Error(
      "PayPayAdapter.verifyWebhookSignature não se aplica — use verifyPayPayWebhook em webhooks/verifier.ts",
    );
  }
}
