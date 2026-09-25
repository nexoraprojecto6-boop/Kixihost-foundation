import type { PrismaClient } from "@kixihost/database";
import { calculateTrialEndDate } from "./trial";

export interface SubscriptionService {
  startTrial(userId: string, planId: string): Promise<void>;
  activateAfterTrial(userId: string): Promise<void>;
  cancelSubscription(userId: string): Promise<void>;
}

const BILLING_CYCLE_DAYS = 30;

export class PrismaSubscriptionService implements SubscriptionService {
  constructor(private readonly prisma: PrismaClient) {}

  private async hasAnySubscription(userId: string): Promise<boolean> {
    return Boolean(await this.prisma.subscription.findFirst({ where: { userId } }));
  }

  /** Idempotente: se o utilizador já tem qualquer subscrição, não faz nada. */
  async startTrial(userId: string, planId: string): Promise<void> {
    if (await this.hasAnySubscription(userId)) return;

    const trialEndsAt = calculateTrialEndDate(new Date());
    await this.prisma.subscription.create({
      data: { userId, planId, status: "trialing", trialEndsAt, currentPeriodEnd: trialEndsAt },
    });
  }

  async activateAfterTrial(userId: string): Promise<void> {
    const subscription = await this.prisma.subscription.findFirst({
      where: { userId, status: "trialing" },
      orderBy: { createdAt: "desc" },
    });
    if (!subscription) return;

    const nextPeriodEnd = new Date();
    nextPeriodEnd.setDate(nextPeriodEnd.getDate() + BILLING_CYCLE_DAYS);

    await this.prisma.subscription.update({
      where: { id: subscription.id },
      data: { status: "active", currentPeriodEnd: nextPeriodEnd },
    });
  }

  async cancelSubscription(userId: string): Promise<void> {
    await this.prisma.subscription.updateMany({
      where: { userId, status: { in: ["trialing", "active", "past_due"] } },
      data: { status: "cancelled" },
    });
  }
}
