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
