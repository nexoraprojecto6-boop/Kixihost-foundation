import { CanActivate, ExecutionContext, Injectable, SetMetadata } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import type { Request } from "express";
import { RedisRateLimiter, enforceRateLimit } from "@kixihost/security";

export const RATE_LIMIT_KEY = "rateLimit";
export interface RateLimitOptions {
  windowSeconds: number;
  maxRequests: number;
}
export const RateLimit = (options: RateLimitOptions) => SetMetadata(RATE_LIMIT_KEY, options);

// Limita por IP + rota. Usa o mesmo Redis do BullMQ/wallet, já
// disponível em REDIS_URL — nada de infraestrutura nova.
@Injectable()
export class RateLimitGuard implements CanActivate {
  private readonly limiter = new RedisRateLimiter(process.env.REDIS_URL ?? "redis://localhost:6379");

  constructor(private readonly reflector: Reflector) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const options = this.reflector.get<RateLimitOptions | undefined>(RATE_LIMIT_KEY, context.getHandler());
    if (!options) return true;

    const req = context.switchToHttp().getRequest<Request>();
    const ip = req.ip ?? "unknown";
    const routeKey = `${req.method}:${req.route?.path ?? req.path}:${ip}`;

    await enforceRateLimit(this.limiter, {
      key: routeKey,
      windowSeconds: options.windowSeconds,
      maxRequests: options.maxRequests,
    });

    return true;
  }
}
