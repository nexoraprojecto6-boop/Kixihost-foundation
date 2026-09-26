import { Body, Controller, Post, Req, Res, UseGuards } from "@nestjs/common";
import type { Response } from "express";
import { PrismaService } from "@kixihost/database";
import { PrismaMfaService } from "@kixihost/auth";
import { SessionGuard, type AuthenticatedRequest } from "../auth/session.guard";
import { SessionAuthService } from "../auth/session-auth.service";

const SESSION_COOKIE = "kixi_session";

// Fluxo: login normal (SessionGuard, mfaVerified:false) → /admin/mfa/enroll
// (primeira vez) → utilizador configura o TOTP na app autenticadora →
// /admin/mfa/verify com o código → sessão é reemitida com
// mfaVerified:true → só então o AdminSessionGuard deixa passar.
@Controller("admin/mfa")
export class AdminMfaController {
  private readonly mfaService: PrismaMfaService;

  constructor(
    prisma: PrismaService,
    private readonly sessionAuthService: SessionAuthService,
  ) {
    this.mfaService = new PrismaMfaService(prisma);
  }

  @Post("enroll")
  @UseGuards(SessionGuard)
  async enroll(@Req() req: AuthenticatedRequest) {
    return this.mfaService.enrollTotp(req.userId);
  }

  @Post("verify")
  @UseGuards(SessionGuard)
  async verify(@Req() req: AuthenticatedRequest, @Res() res: Response, @Body("code") code: string) {
    const valid = await this.mfaService.verifyTotp(req.userId, code);
    if (!valid) {
      res.status(401).json({ verified: false, message: "Código inválido." });
      return;
    }

    const elevatedToken = await this.sessionAuthService.elevate(req.userId, req.sessionId);
    res.cookie(SESSION_COOKIE, elevatedToken, {
      httpOnly: true,
      secure: true,
      sameSite: "lax",
      maxAge: 30 * 24 * 60 * 60 * 1000,
    });
    res.json({ verified: true });
  }
}
