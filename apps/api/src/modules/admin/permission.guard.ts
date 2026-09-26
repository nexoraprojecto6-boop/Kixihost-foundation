import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { PrismaRbacService, type AdminPermission } from "@kixihost/auth";
import { PrismaService } from "@kixihost/database";
import { REQUIRE_PERMISSION_KEY } from "./require-permission.decorator";
import type { AdminAuthenticatedRequest } from "./admin-session.guard";

@Injectable()
export class PermissionGuard implements CanActivate {
  private readonly rbac: PrismaRbacService;

  constructor(
    private readonly reflector: Reflector,
    prisma: PrismaService,
  ) {
    this.rbac = new PrismaRbacService(prisma);
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const permission = this.reflector.get<AdminPermission | undefined>(
      REQUIRE_PERMISSION_KEY,
      context.getHandler(),
    );
    if (!permission) return true;

    const req = context.switchToHttp().getRequest<AdminAuthenticatedRequest>();
    const allowed = await this.rbac.hasPermission(req.userId, permission);
    if (!allowed) {
      throw new ForbiddenException(`Não tens a permissão "${permission}" para esta ação.`);
    }
    return true;
  }
}
