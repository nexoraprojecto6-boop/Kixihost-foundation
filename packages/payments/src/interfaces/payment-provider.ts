// Contrato único que todo adapter de meio de pagamento deve implementar.
//
// REGRA CRÍTICA (ver docs/billing/payment-verification.md):
// Nenhum saldo é creditado sem passar por `verifyPayment`, que por sua
// vez tem de confirmar a transacção junto da API/webhook OFICIAL do
// provider. Comprovativos manuais (screenshots, SMS, mensagens de
// suporte) NUNCA são uma fonte de verdade válida.

export interface InitiatePaymentParams {
  userId: string;
  amountKz: number;
  kixihostReference: string;
}

export interface InitiatePaymentResult {
  providerRef: string;
  redirectUrl?: string;
  raw?: unknown;
}

export interface VerifyPaymentParams {
  providerRef: string;
}

export type PaymentVerificationStatus = "PENDING" | "VERIFIED" | "FAILED";

export interface VerifyPaymentResult {
  status: PaymentVerificationStatus;
  amountKz: number;
  currency: string;
  providerRef: string;
  kixihostReference: string;
  verifiedAt?: Date;
}

export interface PaymentProvider {
  readonly name: "paypay" | "emis" | "multicaixa";

  initiatePayment(params: InitiatePaymentParams): Promise<InitiatePaymentResult>;
  verifyPayment(params: VerifyPaymentParams): Promise<VerifyPaymentResult>;
  /** Valida a assinatura/autenticidade de um webhook recebido deste provider. */
  verifyWebhookSignature(rawBody: string, signatureHeader: string): boolean;
}
