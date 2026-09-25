import { Injectable } from "@nestjs/common";
import { PrismaService } from "@kixihost/database";
import { PrismaWalletService, PrismaSubscriptionService } from "@kixihost/billing";
import { PayPayAdapter, loadPayPayConfigFromEnv } from "@kixihost/payments";
import { generateKixiReference } from "@kixihost/shared";

@Injectable()
export class BillingService {
  private readonly walletService: PrismaWalletService;
  private readonly subscriptionService: PrismaSubscriptionService;

  constructor(private readonly prisma: PrismaService) {
    this.walletService = new PrismaWalletService(prisma);
    this.subscriptionService = new PrismaSubscriptionService(prisma);
  }

  getWalletBalance(userId: string) {
    return this.walletService.getBalance(userId);
  }

  async getWalletHistory(userId: string) {
    const wallet = await this.prisma.wallet.findUnique({ where: { userId } });
    if (!wallet) return [];
    return this.prisma.walletTransaction.findMany({
      where: { walletId: wallet.id },
      orderBy: { createdAt: "desc" },
      take: 50,
    });
  }

  getSubscription(userId: string) {
    return this.prisma.subscription.findFirst({
      where: { userId },
      include: { plan: true },
      orderBy: { createdAt: "desc" },
    });
  }

  listPlans() {
    return this.prisma.plan.findMany({ orderBy: { priceKz: "asc" } });
  }

  cancelSubscription(userId: string) {
    return this.subscriptionService.cancelSubscription(userId);
  }

  /** Inicia um depósito na wallet via PayPay. Não credita nada aqui — o crédito só acontece no webhook verificado. */
  async initiateWalletDeposit(userId: string, amountKz: number, payerIp: string) {
    const kixihostRef = generateKixiReference("DEP");

    await this.prisma.payment.create({
      data: {
        userId,
        provider: "paypay",
        providerRef: kixihostRef, // actualizado para o trade_no real quando a resposta da PayPay chegar
        kixihostRef,
        amountKz,
        currency: "AOA",
        status: "PENDING",
      },
    });

    const config = loadPayPayConfigFromEnv(process.env);
    const adapter = new PayPayAdapter(config);

    const result = await adapter.initiatePayment({ userId, amountKz, kixihostReference: kixihostRef });

    await this.prisma.payment.update({
      where: { kixihostRef },
      data: { providerRef: result.providerRef },
    });

    return { kixihostRef, redirectUrl: result.redirectUrl };
  }
}
