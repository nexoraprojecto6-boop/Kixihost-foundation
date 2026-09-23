// Verificação de assinatura de respostas/webhooks PayPay usando a chave
// pública da PayPay.
// TODO(Fase 9): implementar conforme a documentação oficial PayPay.
export function verifyPayPaySignature(
  _payload: Record<string, unknown>,
  _signature: string,
  _publicKeyPem: string,
): boolean {
  throw new Error(
    "verifyPayPaySignature: not yet implemented — implementar segundo a doc oficial PayPay (Fase 9)",
  );
}
