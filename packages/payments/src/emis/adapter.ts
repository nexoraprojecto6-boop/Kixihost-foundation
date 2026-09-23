import type {
  InitiatePaymentParams,
  InitiatePaymentResult,
  PaymentProvider,
  VerifyPaymentParams,
  VerifyPaymentResult,
} from "../interfaces/payment-provider";

// Adapter EMIS — placeholder estrutural.
//
// EMIS_API_URL / EMIS_CLIENT_ID / EMIS_CLIENT_SECRET ainda não foram
// confirmados contra documentação oficial. NÃO inventar endpoints.
// TODO: implementar quando a documentação oficial da EMIS for
// disponibilizada e confirmada.
export class EmisAdapter implements PaymentProvider {
  readonly name = "emis" as const;

  async initiatePayment(_params: InitiatePaymentParams): Promise<InitiatePaymentResult> {
    throw new Error("EmisAdapter.initiatePayment: not yet implemented — aguarda documentação oficial");
  }

  async verifyPayment(_params: VerifyPaymentParams): Promise<VerifyPaymentResult> {
    throw new Error("EmisAdapter.verifyPayment: not yet implemented — aguarda documentação oficial");
  }

  verifyWebhookSignature(_rawBody: string, _signatureHeader: string): boolean {
    throw new Error("EmisAdapter.verifyWebhookSignature: not yet implemented — aguarda documentação oficial");
  }
}
