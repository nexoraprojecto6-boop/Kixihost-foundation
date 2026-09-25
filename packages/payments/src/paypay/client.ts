import { randomBytes } from "node:crypto";
import type { PayPayConfig } from "./config";
import { encryptBizContent } from "./crypto/rsa";
import { buildSignOriText, signText } from "./crypto/sign";
import type {
  PayPayApiResponse,
  PayPayInstantTradeBizContent,
  PayPayInstantTradeResponseBizContent,
  PayPayTradeQueryBizContent,
} from "./types";

// Formata a hora no fuso de Angola (GMT+1), como a documentação exige.
function formatTimestamp(date: Date): string {
  const offsetMs = 60 * 60 * 1000; // GMT+1
  const angolaTime = new Date(date.getTime() + offsetMs);
  return angolaTime.toISOString().slice(0, 19).replace("T", " ");
}

export class PayPayClient {
  constructor(private readonly config: PayPayConfig) {}

  private async sendRequest<TBizContent>(
    service: "instant_trade" | "trade_refund" | "trade_close" | "trade_query",
    bizContent: object,
  ): Promise<PayPayApiResponse<TBizContent>> {
    const bizContentJson = JSON.stringify(bizContent);
    const encryptedBizContent = encryptBizContent(bizContentJson, this.config.privateKey);

    const envelope: Record<string, string> = {
      charset: "UTF-8",
      biz_content: encryptedBizContent,
      partner_id: this.config.partnerId,
      service,
      request_no: randomBytes(16).toString("hex"),
      format: "JSON",
      language: "pt",
      sign_type: "RSA",
      version: "1.0",
      timestamp: formatTimestamp(new Date()),
    };

    const signOriText = buildSignOriText(envelope);
    envelope.sign = signText(signOriText, this.config.privateKey);

    // Documentação exige urlencode em todos os valores antes de enviar.
    const encodedEnvelope: Record<string, string> = {};
    for (const [key, value] of Object.entries(envelope)) {
      encodedEnvelope[key] = encodeURIComponent(value);
    }

    const response = await fetch(this.config.apiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(encodedEnvelope),
    });

    if (!response.ok) {
      throw new Error(`PayPay API respondeu com HTTP ${response.status}`);
    }

    return (await response.json()) as PayPayApiResponse<TBizContent>;
  }

  async createInstantTrade(params: {
    payerIp: string;
    outTradeNo: string;
    priceKz: number;
    subject: string;
    returnUrl?: string;
  }): Promise<PayPayApiResponse<PayPayInstantTradeResponseBizContent>> {
    const bizContent: PayPayInstantTradeBizContent = {
      cashier_type: "SDK",
      payer_ip: params.payerIp,
      sale_product_code: this.config.saleProductCode,
      timeout_express: "2h",
      trade_info: {
        currency: "AOA",
        out_trade_no: params.outTradeNo,
        payee_identity: this.config.partnerId,
        payee_identity_type: "1",
        price: params.priceKz.toFixed(2),
        quantity: "1",
        subject: params.subject,
        total_amount: params.priceKz.toFixed(2),
      },
      return_url: params.returnUrl,
    };

    return this.sendRequest("instant_trade", bizContent);
  }

  async queryTrade(outTradeNo: string): Promise<PayPayApiResponse<PayPayTradeQueryBizContent>> {
    return this.sendRequest("trade_query", { out_trade_no: outTradeNo });
  }
}
