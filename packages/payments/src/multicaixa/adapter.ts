import type {
  InitiatePaymentParams,
  InitiatePaymentResult,
  PaymentProvider,
  VerifyPaymentParams,
  VerifyPaymentResult,
} from "../interfaces/payment-provider";

// Adapter Multicaixa — placeholder estrutural.
//
// MULTICAIXA_API_URL / MULTICAIXA_CLIENT_ID / MULTICAIXA_CLIENT_SECRET
// ainda não foram confirmados contra documentação oficial. NÃO inventar
// endpoints. TODO: implementar quando a documentação oficial da
// Multicaixa for disponibilizada e confirmada.
export class MulticaixaAdapter implements PaymentProvider {
  readonly name = "multicaixa" as const;

  async initiatePayment(_params: InitiatePaymentParams): Promise<InitiatePaymentResult> {
    throw new Error("MulticaixaAdapter.initiatePayment: not yet implemented — aguarda documentação oficial");
  }

  async verifyPayment(_params: VerifyPaymentParams): Promise<VerifyPaymentResult> {
    throw new Error("MulticaixaAdapter.verifyPayment: not yet implemented — aguarda documentação oficial");
  }

  verifyWebhookSignature(_rawBody: string, _signatureHeader: string): boolean {
    throw new Error("MulticaixaAdapter.verifyWebhookSignature: not yet implemented — aguarda documentação oficial");
  }
}
