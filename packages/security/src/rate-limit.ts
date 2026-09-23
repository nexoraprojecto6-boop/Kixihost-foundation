export interface RateLimitRule {
  key: string;
  windowSeconds: number;
  maxRequests: number;
}

export interface RateLimiter {
  consume(rule: RateLimitRule): Promise<{ allowed: boolean; remaining: number }>;
}
