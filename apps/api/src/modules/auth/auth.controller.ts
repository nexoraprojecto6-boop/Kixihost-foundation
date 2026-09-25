import { Controller, Get, HttpStatus, Res } from "@nestjs/common";
import type { Response } from "express";
import { PrismaService } from "@kixihost/database";
import { PrismaHealthCheckService } from "@kixihost/monitoring";

@Controller("health")
export class HealthController {
  private readonly healthCheckService: PrismaHealthCheckService;

  constructor(private readonly prisma: PrismaService) {
    this.healthCheckService = new PrismaHealthCheckService(prisma, process.env.REDIS_URL ?? "redis://localhost:6379");
  }

  @Get()
  async check(@Res() res: Response) {
    const [database, redis, queue] = await Promise.all([
      this.healthCheckService.checkDatabase(),
      this.healthCheckService.checkRedis(),
      this.healthCheckService.checkQueue(),
    ]);

    const allHealthy = database.healthy && redis.healthy && queue.healthy;

    res.status(allHealthy ? HttpStatus.OK : HttpStatus.SERVICE_UNAVAILABLE).json({
      status: allHealthy ? "ok" : "degraded",
      checks: { database, redis, queue },
      timestamp: new Date().toISOString(),
    });
  }
}
