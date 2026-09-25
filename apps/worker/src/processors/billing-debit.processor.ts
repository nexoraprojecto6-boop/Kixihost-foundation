import { PrismaSubscriptionService, PrismaWalletService, InsufficientBalanceError } from "@kixihost/billing";
import { Logger } from "@kixihost/logging";
import { prisma } from "../lib/prisma";

const walletService = new PrismaWalletService(prisma);
const subscriptionService = new PrismaSubscriptionService(prisma);
const logger = new Logger("billing-debit");

// Corre periodicamente (ver main.ts). Para cada subscrição em trial já
// expirado, activa-a; para cada subscrição activa cujo período
// expirou, tenta debitar o wallet. Nunca credita saldo aqui — apenas
// debita, e só quando há saldo suficiente. Sem saldo, a subscrição
// fica `past_due` em vez de falhar silenciosamente.
export async function processBillingDebitJob(): Promise<void> {
  const now = new Date();

  const trialsToActivate = await prisma.subscription.findMany({
    where: { status: "trialing", trialEndsAt: { lte: now } },
  });
  for (const subscription of trialsToActivate) {
    await subscriptionService.activateAfterTrial(subscription.userId);
    logger.info("Trial activado após expirar", { userId: subscription.userId, subscriptionId: subscription.id });
  }

  const dueSubscriptions = await prisma.subscription.findMany({
    where: { status: "active", currentPeriodEnd: { lte: now } },
    include: { plan: true },
  });

  for (const subscription of dueSubscriptions) {
    const invoice = await prisma.invoice.create({
      data: {
        subscriptionId: subscription.id,
        amountKz: subscription.plan.priceKz,
        status: "pending",
        dueAt: now,
      },
    });

    try {
      await walletService.debitForSubscription(subscription.userId, invoice.id, subscription.plan.priceKz);

      const nextPeriodEnd = new Date(now);
      nextPeriodEnd.setDate(nextPeriodEnd.getDate() + 30);

      await prisma.$transaction([
        prisma.invoice.update({ where: { id: invoice.id }, data: { status: "paid", paidAt: now } }),
        prisma.subscription.update({ where: { id: subscription.id }, data: { currentPeriodEnd: nextPeriodEnd } }),
      ]);

      logger.info("Subscrição debitada com sucesso", { subscriptionId: subscription.id });
    } catch (error) {
      await prisma.invoice.update({ where: { id: invoice.id }, data: { status: "failed" } });
      await prisma.subscription.update({ where: { id: subscription.id }, data: { status: "past_due" } });

      const reason = error instanceof InsufficientBalanceError ? "saldo insuficiente" : "erro ao debitar";
      logger.warn("Subscrição marcada como past_due", {
        subscriptionId: subscription.id,
        reason,
      });
      // TODO(Fase 10/notifications): notificar o utilizador do saldo insuficiente.
    }
  }
}
