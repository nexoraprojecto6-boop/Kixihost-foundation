// Contrato de métricas (OpenTelemetry/Prometheus). Implementação real
// (Fase 10) instrumenta api/worker/web/admin com OTEL_ENDPOINT.

export interface MetricsService {
  incrementCounter(name: string, labels?: Record<string, string>): void;
  observeHistogram(name: string, value: number, labels?: Record<string, string>): void;
  setGauge(name: string, value: number, labels?: Record<string, string>): void;
}

// Métricas core que a plataforma deve expor desde o início (regra 41).
export const CORE_METRICS = [
  "http_request_duration_ms",
  "http_requests_total",
  "deployment_duration_seconds",
  "deployment_status_total",
  "worker_job_duration_seconds",
  "worker_queue_depth",
  "payment_failures_total",
  "infrastructure_provider_errors_total",
] as const;
