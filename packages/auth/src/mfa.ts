import { authenticator } from "otplib";
import type { PrismaClient } from "@kixihost/database";
import { getEncryptionService } from "@kixihost/security";

export interface MFAService {
  enrollTotp(userId: string): Promise<{ secret: string; otpauthUrl: string }>;
  verifyTotp(userId: string, code: string): Promise<boolean>;
}

// TOTP real (RFC 6238), obrigatório para acesso administrativo (regra
// 32). O secret é encriptado em repouso (AES-256-GCM) — só existe em
// texto plano na memória do processo durante enroll/verify.
export class PrismaMfaService implements MFAService {
  constructor(private readonly prisma: PrismaClient) {}

  async enrollTotp(userId: string): Promise<{ secret: string; otpauthUrl: string }> {
    const secret = authenticator.generateSecret();
    const user = await this.prisma.user.findUniqueOrThrow({ where: { id: userId } });
    const otpauthUrl = authenticator.keyuri(user.email, "KixiHost Admin", secret);

    const encryptionService = getEncryptionService();
    const encryptedSecret = await encryptionService.encrypt(secret);

    await this.prisma.mFAFactor.create({
      data: { userId, type: "TOTP", secret: encryptedSecret },
    });

    return { secret, otpauthUrl };
  }

  async verifyTotp(userId: string, code: string): Promise<boolean> {
    const factor = await this.prisma.mFAFactor.findFirst({
      where: { userId, type: "TOTP" },
      orderBy: { createdAt: "desc" },
    });
    if (!factor) return false;

    const encryptionService = getEncryptionService();
    const plainSecret = await encryptionService.decrypt(factor.secret);

    const valid = authenticator.check(code, plainSecret);
    if (valid && !factor.verifiedAt) {
      await this.prisma.mFAFactor.update({ where: { id: factor.id }, data: { verifiedAt: new Date() } });
    }
    return valid;
  }
}
