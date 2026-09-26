import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "@kixihost/database";
import { PrismaWalletService } from "@kixihost/billing";
import { AuditLogService } from "./audit-log.service";

@Injectable()
export class AdminUsersService {
  private readonly walletService: PrismaWalletService;

  constructor(
    private readonly prisma: PrismaService,
    private readonly auditLog: AuditLogService,
  ) {
    this.walletService = new PrismaWalletService(prisma);
  }

  async search(query: string) {
    return this.prisma.user.findMany({
      where: {
        OR: [
          { email: { contains: query, mode: "insensitive" } },
          { fullName: { contains: query, mode: "insensitive" } },
          { phone: { contains: query, mode: "insensitive" } },
        ],
      },
      take: 25,
      orderBy: { createdAt: "desc" },
    });
  }

  async getProfile(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        projects: true,
        wallet: true,
        subscriptions: { include: { plan: true } },
        payments: { orderBy: { createdAt: "desc" }, take: 20 },
        notifications: { orderBy: { createdAt: "desc" }, take: 20 },
      },
    });
    if (!user) throw new NotFoundException("Utilizador não encontrado.");
    return user;
  }

  async suspend(adminUserId: string, targetUserId: string, reason: string) {
    await this.prisma.user.update({ where: { id: targetUserId }, data: { status: "SUSPENDED" } });
    await this.auditLog.record(adminUserId, "user.suspend", "User", targetUserId, { reason });
  }

  async block(adminUserId: string, targetUserId: string, reason: string) {
    await this.prisma.user.update({ where: { id: targetUserId }, data: { status: "BLOCKED" } });
    await this.auditLog.record(adminUserId, "user.block", "User", targetUserId, { reason });
  }

  async reactivate(adminUserId: string, targetUserId: string) {
    await this.prisma.user.update({ where: { id: targetUserId }, data: { status: "ACTIVE" } });
    await this.auditLog.record(adminUserId, "user.reactivate", "User", targetUserId);
  }

  async changePlan(adminUserId: string, targetUserId: string, planId: string) {
    const subscription = await this.prisma.subscription.findFirst({
      where: { userId: targetUserId },
      orderBy: { createdAt: "desc" },
    });
    if (!subscription) throw new NotFoundException("Utilizador não tem subscrição activa.");

    await this.prisma.subscription.update({ where: { id: subscription.id }, data: { planId } });
    await this.auditLog.record(adminUserId, "user.change_plan", "Subscription", subscription.id, { planId });
  }

  async notify(adminUserId: string, targetUserId: string, title: string, message: string) {
    await this.prisma.notification.create({
      data: { userId: targetUserId, type: "admin.message", title, message },
    });
    await this.auditLog.record(adminUserId, "user.notify", "User", targetUserId, { title });
  }

  /** Crédito promocional — nunca confundido com um depósito de cliente (regra 30). */
  async grantPromotionalCredit(adminUserId: string, targetUserId: string, amountKz: number, reason: string) {
    await this.walletService.grantPromotionalCredit(targetUserId, amountKz, reason, adminUserId);
    await this.auditLog.record(adminUserId, "user.grant_credit", "Wallet", targetUserId, { amountKz, reason });
  }
}
