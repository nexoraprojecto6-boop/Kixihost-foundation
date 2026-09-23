import type {
  InitiatePaymentParams,
  InitiatePaymentResult,
  PaymentProvider,
  VerifyPaymentParams,
  VerifyPaymentResult,
} from "../interfaces/payment-provider";
import type { PayPayConfig } from "./config";
import { PayPayClient } from "./client";

// Adapter PayPay AO — implementa o contrato genérico PaymentProvider.
//
// Fonte oficial (única fonte de verdade): https://portal.paypayafrica.com/dist/guide/apidoc_pt.html
export class PayPayAdapter implements PaymentProvider {
  readonly name = "paypay" as const;
  private readonly client: PayPayClient;

  constructor(private readonly config: PayPayConfig) {
    this.client = new PayPayClient(config);
  }

  async initiatePayment(_params: InitiatePaymentParams): Promise<InitiatePaymentResult> {
    throw new Error("PayPayAdapter.initiatePayment: not yet implemented (Fase 9)");
  }

  async verifyPayment(_params: VerifyPaymentParams): Promise<VerifyPaymentResult> {
    throw new Error("PayPayAdapter.verifyPayment: not yet implemented (Fase 9)");
  }

  verifyWebhookSignature(_rawBody: string, _signatureHeader: string): boolean {
    throw new Error("PayPayAdapter.verifyWebhookSignature: not yet implemented (Fase 9)");
  }
}
