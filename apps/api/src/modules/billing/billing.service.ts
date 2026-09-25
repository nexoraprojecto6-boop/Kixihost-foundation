import { Injectable } from "@nestjs/common";
import { PrismaService } from "@kixihost/database";
import { PrismaWalletService, PrismaSubscriptionService } from "@kixihost/billing";

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
}
