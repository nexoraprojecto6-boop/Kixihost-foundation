import Redis from "ioredis";
import { KixiError } from "@kixihost/shared";

export interface RateLimitRule {
  key: string;
  windowSeconds: number;
  maxRequests: number;
}

export interface RateLimiter {
  consume(rule: RateLimitRule): Promise<{ allowed: boolean; remaining: number }>;
}

// Rate limiter real por janela fixa, usando Redis (INCR + EXPIRE
// atómico). Barato, suficiente para proteger login/MFA/webhooks contra
// brute force sem depender do Cloudflare WAF (que cobre a camada de
// rede, isto cobre a camada de aplicação).
export class RedisRateLimiter implements RateLimiter {
  private readonly redis: Redis;

  constructor(redisUrl: string) {
    this.redis = new Redis(redisUrl, { maxRetriesPerRequest: 2 });
  }

  async consume(rule: RateLimitRule): Promise<{ allowed: boolean; remaining: number }> {
    const redisKey = `ratelimit:${rule.key}`;
    const count = await this.redis.incr(redisKey);
    if (count === 1) {
      await this.redis.expire(redisKey, rule.windowSeconds);
    }
    const remaining = Math.max(0, rule.maxRequests - count);
    return { allowed: count <= rule.maxRequests, remaining };
  }

  async disconnect(): Promise<void> {
    this.redis.disconnect();
  }
}

/** Helper: consome e lança KixiError se o limite foi excedido. */
export async function enforceRateLimit(limiter: RateLimiter, rule: RateLimitRule): Promise<void> {
  const result = await limiter.consume(rule);
  if (!result.allowed) {
    throw new KixiError({
      code: "KIXI_RATE_LIMIT_EXCEEDED",
      title: "Demasiadas tentativas",
      message: "Foram feitas demasiadas tentativas em pouco tempo.",
      action: `Aguarda ${rule.windowSeconds} segundos e tenta novamente.`,
      severity: "warning",
      retryable: true,
    });
  }
}
