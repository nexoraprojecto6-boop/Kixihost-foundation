// Contrato para garantia de idempotência no processamento de webhooks
// de pagamento. Implementação real usa a tabela IdempotencyKey
// (ver packages/database) para garantir que o mesmo evento nunca é
// processado (e nunca credita saldo) duas vezes.

export interface IdempotencyGuard {
  /** Devolve true se esta chave já foi processada anteriormente. */
  hasBeenProcessed(scope: string, key: string): Promise<boolean>;
  /** Regista a chave como processada, dentro da mesma transacção do crédito. */
  markAsProcessed(scope: string, key: string, expiresAt: Date): Promise<void>;
}
