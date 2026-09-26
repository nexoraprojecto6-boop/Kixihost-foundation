import { PrismaClient } from "@prisma/client";
import { DEFAULT_PLANS } from "@kixihost/config";

const prisma = new PrismaClient();

const ROLE_PERMISSIONS: Record<string, string[]> = {
  SuperAdmin: [
    "dashboard.view", "users.view", "users.suspend", "users.block", "users.reactivate",
    "users.change_plan", "users.notify", "users.grant_credit", "billing.view", "billing.manage",
    "payments.view", "infrastructure.view", "infrastructure.manage", "security.manage",
    "support.manage", "incidents.view", "incidents.manage",
  ],
  Support: ["dashboard.view", "users.view", "users.notify", "support.manage"],
  Operations: ["dashboard.view", "infrastructure.view", "infrastructure.manage", "incidents.view", "incidents.manage"],
  Billing: ["dashboard.view", "billing.view", "billing.manage", "payments.view", "users.grant_credit"],
  Security: ["dashboard.view", "security.manage", "users.view", "users.suspend", "users.block"],
};

async function main() {
  for (const plan of DEFAULT_PLANS) {
    await prisma.plan.upsert({
      where: { name: plan.name },
      create: { name: plan.name, priceKz: plan.priceKz, trialDays: plan.trialDays, resourceLimits: plan.resourceLimits },
      update: { priceKz: plan.priceKz, trialDays: plan.trialDays, resourceLimits: plan.resourceLimits },
    });
    console.log(`Plano "${plan.name}" garantido.`);
  }

  for (const [name, permissions] of Object.entries(ROLE_PERMISSIONS)) {
    await prisma.adminRole.upsert({
      where: { name },
      create: { name, permissions },
      update: { permissions },
    });
    console.log(`AdminRole "${name}" garantido com ${permissions.length} permissões.`);
  }

  const bootstrapEmail = process.env.ADMIN_BOOTSTRAP_EMAIL;
  if (bootstrapEmail) {
    const user = await prisma.user.findUnique({ where: { email: bootstrapEmail } });
    const superAdminRole = await prisma.adminRole.findUnique({ where: { name: "SuperAdmin" } });

    if (user && superAdminRole) {
      await prisma.adminRoleAssignment.upsert({
        where: { userId_roleId: { userId: user.id, roleId: superAdminRole.id } },
        create: { userId: user.id, roleId: superAdminRole.id },
        update: {},
      });
      console.log(`Utilizador ${bootstrapEmail} promovido a SuperAdmin.`);
    } else {
      console.log(
        `ADMIN_BOOTSTRAP_EMAIL definido mas o utilizador "${bootstrapEmail}" ainda não existe — faz login com o GitHub primeiro e corre o seed novamente.`,
      );
    }
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
