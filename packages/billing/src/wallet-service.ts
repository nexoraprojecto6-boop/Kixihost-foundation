// Contrato do serviço de wallet pré-pago (ver regra 22).
//
// Débitos de subscrição são automáticos. Créditos só entram através de
// `WalletTransaction` do tipo DEPOSIT (originado por um Payment
// VERIFIED — ver @kixihost/payments) ou PROMOTIONAL_CREDIT (concedido
// por um admin, sempre distinto de um depósito de cliente — regra 30).

export interface WalletBalance {
  balanceKz: number;
  nextDebitKz: number | null;
  nextDebitAt: Date | null;
  daysRemaining: number | null;
}

export interface WalletService {
  getBalance(userId: string): Promise<WalletBalance>;
  /** Chamado apenas a partir de um Payment com status VERIFIED. */
  creditFromVerifiedPayment(userId: string, paymentId: string, amountKz: number): Promise<void>;
  /** Chamado apenas por um admin autorizado, nunca a partir de um pagamento de cliente. */
  grantPromotionalCredit(
    userId: string,
    amountKz: number,
    reason: string,
    grantedByAdminId: string,
  ): Promise<void>;
  debitForSubscription(userId: string, invoiceId: string, amountKz: number): Promise<void>;
}
