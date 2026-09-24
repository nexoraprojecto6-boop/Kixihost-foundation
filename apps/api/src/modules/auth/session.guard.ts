import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from "@nestjs/common";
import type { Request } from "express";
import { SessionAuthService } from "./session-auth.service";

export interface AuthenticatedRequest extends Request {
  userId: string;
  sessionId: string;
}

const SESSION_COOKIE = "kixi_session";

// Guard que protege qualquer endpoint autenticado: lê o cookie
// kixi_session, verifica-o (assinatura + revogação em base de dados) e
// injeta req.userId / req.sessionId. Sem isto, nenhum controller deve
// confiar num userId vindo do pedido.
@Injectable()
export class SessionGuard implements CanActivate {
  constructor(private readonly sessionAuthService: SessionAuthService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest<Request>();
    const token = req.cookies?.[SESSION_COOKIE];

    if (!token) {
      throw new UnauthorizedException("Sessão não encontrada. Autentica-te com o GitHub.");
    }

    const payload = await this.sessionAuthService.verify(token);
    if (!payload) {
      throw new UnauthorizedException("Sessão inválida ou expirada.");
    }

    (req as AuthenticatedRequest).userId = payload.userId;
    (req as AuthenticatedRequest).sessionId = payload.sessionId;
    return true;
  }
}
