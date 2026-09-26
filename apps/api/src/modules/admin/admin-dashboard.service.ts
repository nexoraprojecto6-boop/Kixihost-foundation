import { Injectable } from "@nestjs/common";
import { PrismaService } from "@kixihost/database";

@Injectable()
export class AdminDashboardService {
  constructor(private readonly prisma: PrismaService) {}

  async getOverview() {
    const [
      totalUsers,
      recentSessions,
      totalProjects,
      totalDeployments,
      activeIncidents,
      totalServers,
      unhealthyServers,
      walletTotals,
      pendingPayments,
      recentActivity,
    ] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.session.count({
        where: { createdAt: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } },
      }),
      this.prisma.project.count(),
      this.prisma.deployment.count(),
      this.prisma.incident.count({ where: { status: { not: "resolved" } } }),
      this.prisma.server.count(),
      this.prisma.server.count({ where: { status: "unhealthy" } }),
      this.prisma.wallet.aggregate({ _sum: { balanceKz: true } }),
      this.prisma.payment.count({ where: { status: "PENDING" } }),
      this.prisma.auditLog.findMany({ orderBy: { createdAt: "desc" }, take: 20 }),
    ]);

    return {
      totalUsers,
      activeSessionsLast30Days: recentSessions,
      totalProjects,
      totalDeployments,
      activeIncidents,
      totalServers,
      unhealthyServers,
      totalWalletBalanceKz: walletTotals._sum.balanceKz ?? 0,
      pendingPayments,
      recentActivity,
    };
  }
}
