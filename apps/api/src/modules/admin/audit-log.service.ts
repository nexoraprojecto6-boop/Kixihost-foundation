import { Injectable } from "@nestjs/common";
import { PrismaService } from "@kixihost/database";

// Toda alteração administrativa sensível gera um AuditLog (regra 30/31).
@Injectable()
export class AuditLogService {
  constructor(private readonly prisma: PrismaService) {}

  async record(
    actorId: string,
    action: string,
    targetType?: string,
    targetId?: string,
    metadata?: Record<string, unknown>,
  ) {
    await this.prisma.auditLog.create({
      data: { actorId, action, targetType, targetId, metadata },
    });
  }
}
