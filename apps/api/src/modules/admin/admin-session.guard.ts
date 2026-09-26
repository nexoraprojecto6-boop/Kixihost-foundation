import { CanActivate, ExecutionContext, ForbiddenException, Injectable, UnauthorizedException } from "@nestjs/common";
import type { Request } from "express";
import { PrismaService } from "@kixihost/database";
import { SessionAuthService } from "../auth/session-auth.service";

export interface AdminAuthenticatedRequest extends Request {
  userId: string;
  sessionId: string;
}

const SESSION_COOKIE = "kixi_session";

// Guard exclusivo do painel administrativo: exige sessão válida, MFA
// já verificado (mfaVerified:true no token) e pelo menos uma
// AdminRoleAssignment (regra 32). Nunca confundir com o SessionGuard
// normal usado pelos clientes.
@Injectable()
export class AdminSessionGuard implements CanActivate {
  constructor(
    private readonly sessionAuthService: SessionAuthService,
    private readonly prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest<Request>();
    const token = req.cookies?.[SESSION_COOKIE];

    if (!token) {
      throw new UnauthorizedException("Sessão não encontrada.");
    }

    const payload = await this.sessionAuthService.verify(token);
    if (!payload) {
      throw new UnauthorizedException("Sessão inválida ou expirada.");
    }

    if (!payload.mfaVerified) {
      throw new ForbiddenException("Autenticação multifator (MFA) obrigatória para acesso administrativo.");
    }

    const hasAnyAdminRole = await this.prisma.adminRoleAssignment.findFirst({
      where: { userId: payload.userId },
    });
    if (!hasAnyAdminRole) {
      throw new ForbiddenException("Este utilizador não tem nenhuma função administrativa atribuída.");
    }

    (req as AdminAuthenticatedRequest).userId = payload.userId;
    (req as AdminAuthenticatedRequest).sessionId = payload.sessionId;
    return true;
  }
}
