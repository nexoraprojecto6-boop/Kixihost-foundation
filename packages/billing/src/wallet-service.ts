import type { PrismaClient } from "@kixihost/database";

// Regras de wallet pré-pago (ver regra 22). Distinção obrigatória:
// DEPOSIT vem sempre de um Payment VERIFIED; PROMOTIONAL_CREDIT vem
// sempre de um admin explícito — nunca confundidos (regra 30).

export interface WalletBalance {
  balanceKz: number;
  nextDebitKz: number | null;
  nextDebitAt: Date | null;
  daysRemaining: number | null;
}

export interface WalletService {
  getBalance(userId: string): Promise<WalletBalance>;
  creditFromVerifiedPayment(userId: string, paymentId: string, amountKz: number): Promise<void>;
  grantPromotionalCredit(
    userId: string,
    amountKz: number,
    reason: string,
    grantedByAdminId: string,
  ): Promise<void>;
  debitForSubscription(userId: string, invoiceId: string, amountKz: number): Promise<void>;
}

export class InsufficientBalanceError extends Error {
  constructor() {
    super("INSUFFICIENT_BALANCE");
    this.name = "InsufficientBalanceError";
  }
}

export class PrismaWalletService implements WalletService {
  constructor(private readonly prisma: PrismaClient) {}

  private async ensureWallet(userId: string) {
    return this.prisma.wallet.upsert({
      where: { userId },
      create: { userId, balanceKz: 0 },
      update: {},
    });
  }

  async getBalance(userId: string): Promise<WalletBalance> {
    const wallet = await this.ensureWallet(userId);
    const subscription = await this.prisma.subscription.findFirst({
      where: { userId, status: { in: ["trialing", "active"] } },
      include: { plan: true },
      orderBy: { createdAt: "desc" },
    });

    if (!subscription) {
      return { balanceKz: wallet.balanceKz, nextDebitKz: null, nextDebitAt: null, daysRemaining: null };
    }

    const nextDebitAt =
      subscription.status === "trialing" ? subscription.trialEndsAt : subscription.currentPeriodEnd;
    const daysRemaining = nextDebitAt
      ? Math.max(0, Math.ceil((nextDebitAt.getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
      : null;

    return { balanceKz: wallet.balanceKz, nextDebitKz: subscription.plan.priceKz, nextDebitAt, daysRemaining };
  }

  async creditFromVerifiedPayment(userId: string, paymentId: string, amountKz: number): Promise<void> {
    const wallet = await this.ensureWallet(userId);
    await this.prisma.$transaction([
      this.prisma.wallet.update({ where: { id: wallet.id }, data: { balanceKz: { increment: amountKz } } }),
      this.prisma.walletTransaction.create({
        data: { walletId: wallet.id, type: "DEPOSIT", amountKz, reference: paymentId },
      }),
    ]);
  }

  async grantPromotionalCredit(
    userId: string,
    amountKz: number,
    reason: string,
    grantedByAdminId: string,
  ): Promise<void> {
    const wallet = await this.ensureWallet(userId);
    await this.prisma.$transaction([
      this.prisma.wallet.update({ where: { id: wallet.id }, data: { balanceKz: { increment: amountKz } } }),
      this.prisma.walletTransaction.create({
        data: { walletId: wallet.id, type: "PROMOTIONAL_CREDIT", amountKz },
      }),
      this.prisma.creditGrant.create({ data: { walletId: wallet.id, amountKz, reason, grantedByAdminId } }),
    ]);
  }

  async debitForSubscription(userId: string, invoiceId: string, amountKz: number): Promise<void> {
    const wallet = await this.ensureWallet(userId);
    if (wallet.balanceKz < amountKz) {
      throw new InsufficientBalanceError();
    }
    await this.prisma.$transaction([
      this.prisma.wallet.update({ where: { id: wallet.id }, data: { balanceKz: { decrement: amountKz } } }),
      this.prisma.walletTransaction.create({
        data: { walletId: wallet.id, type: "SUBSCRIPTION_DEBIT", amountKz: -amountKz, reference: invoiceId },
      }),
    ]);
  }
}
