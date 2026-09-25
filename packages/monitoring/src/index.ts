export * from "./health-check";
export * from "./incident-engine";

// Métricas core que a plataforma deve expor (ver regra 41). A
// instrumentação real com OpenTelemetry/Prometheus fica para quando
// a infraestrutura de produção (Fase 13) estiver a correr — nomear
// as métricas aqui já serve de contrato para esse trabalho futuro.
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
