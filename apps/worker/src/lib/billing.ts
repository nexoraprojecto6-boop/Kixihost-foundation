import { PrismaSubscriptionService } from "@kixihost/billing";
import { prisma } from "./prisma";

const subscriptionService = new PrismaSubscriptionService(prisma);

// Chamado quando um deployment fica ACTIVE (ver regra 21: o trial
// começa preferencialmente no primeiro deployment concluído com
// sucesso). Idempotente — se o utilizador já tiver qualquer
// subscrição, não faz nada.
export async function ensureTrialStarted(userId: string): Promise<void> {
  const starterPlan = await prisma.plan.findUnique({ where: { name: "Starter" } });
  if (!starterPlan) {
    // Seed ainda não correu neste ambiente — não bloqueia o deployment.
    return;
  }
  await subscriptionService.startTrial(userId, starterPlan.id);
}
