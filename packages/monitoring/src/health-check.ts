import type { PrismaClient } from "@kixihost/database";
import Redis from "ioredis";

export interface HealthCheckResult {
  service: string;
  healthy: boolean;
  latencyMs?: number;
  message?: string;
}

export interface HealthCheckService {
  checkDatabase(): Promise<HealthCheckResult>;
  checkRedis(): Promise<HealthCheckResult>;
  checkQueue(): Promise<HealthCheckResult>;
}

// Implementação real usada tanto pela API (endpoint /health) como
// potencialmente por scripts de diagnóstico. A verificação de "queue"
// reutiliza a mesma ligação Redis, já que o BullMQ vive sobre ela —
// uma falha de Redis já implica falha de queue.
export class PrismaHealthCheckService implements HealthCheckService {
  constructor(
    private readonly prisma: PrismaClient,
    private readonly redisUrl: string,
  ) {}

  async checkDatabase(): Promise<HealthCheckResult> {
    const start = Date.now();
    try {
      await this.prisma.$queryRaw`SELECT 1`;
      return { service: "database", healthy: true, latencyMs: Date.now() - start };
    } catch (error) {
      return {
        service: "database",
        healthy: false,
        latencyMs: Date.now() - start,
        message: error instanceof Error ? error.message : "erro desconhecido",
      };
    }
  }

  private async pingRedis(): Promise<HealthCheckResult> {
    const start = Date.now();
    const client = new Redis(this.redisUrl, { maxRetriesPerRequest: 1, connectTimeout: 3000, lazyConnect: true });
    try {
      await client.connect();
      await client.ping();
      return { service: "redis", healthy: true, latencyMs: Date.now() - start };
    } catch (error) {
      return {
        service: "redis",
        healthy: false,
        latencyMs: Date.now() - start,
        message: error instanceof Error ? error.message : "erro desconhecido",
      };
    } finally {
      client.disconnect();
    }
  }

  async checkRedis(): Promise<HealthCheckResult> {
    return this.pingRedis();
  }

  async checkQueue(): Promise<HealthCheckResult> {
    const result = await this.pingRedis();
    return { ...result, service: "queue" };
  }
}
