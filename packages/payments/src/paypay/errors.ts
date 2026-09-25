import { KixiError } from "@kixihost/shared";

export function mapPayPayError(providerMessage: string, httpStatus?: number): KixiError {
  return new KixiError({
    code: "KIXI_PAYMENT_FAILED",
    title: "Pagamento não concluído",
    message: "Não foi possível concluir o pagamento através da PayPay.",
    action: "Verifica os dados e tenta novamente, ou escolhe outro método de pagamento.",
    severity: "error",
    retryable: true,
    internal: { provider: "paypay", providerError: providerMessage, httpStatus },
  });
}
