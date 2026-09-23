// Seed inicial — popula os Plans definidos em @kixihost/config.
// Corre via `pnpm db:seed`, nunca automaticamente em produção sem
// revisão manual.

import { PrismaClient } from "@prisma/client";
import { DEFAULT_PLANS } from "@kixihost/config";

const prisma = new PrismaClient();

async function main() {
  for (const plan of DEFAULT_PLANS) {
    await prisma.plan.upsert({
      where: { name: plan.name },
      create: {
        name: plan.name,
        priceKz: plan.priceKz,
        trialDays: plan.trialDays,
        resourceLimits: plan.resourceLimits,
      },
      update: {
        priceKz: plan.priceKz,
        trialDays: plan.trialDays,
        resourceLimits: plan.resourceLimits,
      },
    });
    console.log(`Plano "${plan.name}" garantido.`);
  }

  const roles = ["Support", "Operations", "Billing", "Security", "SuperAdmin"];
  for (const name of roles) {
    await prisma.adminRole.upsert({
      where: { name },
      create: { name, permissions: {} }, // TODO(Fase 11): preencher permissões reais por role
      update: {},
    });
    console.log(`AdminRole "${name}" garantido.`);
  }
}

main()
  .catch((error) => {
    console.error("Seed falhou:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
