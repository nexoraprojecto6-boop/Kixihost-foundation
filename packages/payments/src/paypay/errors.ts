import { KixiError } from "@kixihost/shared";

// Mapeia erros da API PayPay para KixiError.
// TODO(Fase 9): mapear códigos de erro reais documentados oficialmente.
export function mapPayPayError(providerMessage: string, httpStatus?: number): KixiError {
  return new KixiError({
    code: "KIXI_PAYMENT_FAILED",
    title: "Pagamento não concluído",
    message: "Não foi possível concluir o pagamento através da PayPay.",
    action: "Verifique os dados e tente novamente, ou escolha outro método de pagamento.",
    severity: "error",
    retryable: true,
    internal: { provider: "paypay", providerError: providerMessage, httpStatus },
  });
}
