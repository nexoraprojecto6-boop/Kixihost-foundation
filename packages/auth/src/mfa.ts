import { authenticator } from "otplib";
import type { PrismaClient } from "@kixihost/database";

export interface MFAService {
  enrollTotp(userId: string): Promise<{ secret: string; otpauthUrl: string }>;
  verifyTotp(userId: string, code: string): Promise<boolean>;
}

// Implementação real de TOTP (RFC 6238) via otplib. Obrigatório para
// acesso administrativo (regra 32) — ver AdminSessionGuard.
export class PrismaMfaService implements MFAService {
  constructor(private readonly prisma: PrismaClient) {}

  async enrollTotp(userId: string): Promise<{ secret: string; otpauthUrl: string }> {
    const secret = authenticator.generateSecret();
    const user = await this.prisma.user.findUniqueOrThrow({ where: { id: userId } });
    const otpauthUrl = authenticator.keyuri(user.email, "KixiHost Admin", secret);

    await this.prisma.mFAFactor.create({
      data: { userId, type: "TOTP", secret }, // TODO(Fase 12): encriptar secret em repouso via @kixihost/security
    });

    return { secret, otpauthUrl };
  }

  async verifyTotp(userId: string, code: string): Promise<boolean> {
    const factor = await this.prisma.mFAFactor.findFirst({
      where: { userId, type: "TOTP" },
      orderBy: { createdAt: "desc" },
    });
    if (!factor) return false;

    const valid = authenticator.check(code, factor.secret);
    if (valid && !factor.verifiedAt) {
      await this.prisma.mFAFactor.update({ where: { id: factor.id }, data: { verifiedAt: new Date() } });
    }
    return valid;
  }
}
