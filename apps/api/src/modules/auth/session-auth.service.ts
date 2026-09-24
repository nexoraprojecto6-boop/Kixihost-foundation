import { Injectable } from "@nestjs/common";
import { PrismaService } from "@kixihost/database";
import { JwtSessionService, type SessionPayload } from "@kixihost/auth";

// Wrapper injetável do JwtSessionService, ligado ao PrismaService do
// NestJS. Usado tanto pelo AuthService (criar sessão no login) como
// pelo SessionGuard (verificar sessão em qualquer endpoint protegido).
@Injectable()
export class SessionAuthService {
  private readonly sessionService: JwtSessionService;

  constructor(private readonly prisma: PrismaService) {
    this.sessionService = new JwtSessionService(
      process.env.SESSION_SECRET ?? "",
      async (userId, sessionId, expiresAt, ipAddress, userAgent) => {
        await this.prisma.session.create({
          data: { id: sessionId, userId, expiresAt, ipAddress, userAgent },
        });
      },
      async (sessionId) => {
        const session = await this.prisma.session.findUnique({ where: { id: sessionId } });
        return !session || session.expiresAt < new Date();
      },
      async (sessionId) => {
        await this.prisma.session.delete({ where: { id: sessionId } }).catch(() => undefined);
      },
    );
  }

  create(userId: string, ipAddress?: string, userAgent?: string): Promise<string> {
    return this.sessionService.create(userId, ipAddress, userAgent);
  }

  verify(sessionToken: string): Promise<SessionPayload | null> {
    return this.sessionService.verify(sessionToken);
  }

  revoke(sessionId: string): Promise<void> {
    return this.sessionService.revoke(sessionId);
  }
}
