export type KixiErrorSeverity = "info" | "warning" | "error" | "critical";

export interface KixiErrorParams {
  code: KixiErrorCode;
  title: string;
  message: string;
  action?: string;
  severity?: KixiErrorSeverity;
  retryable?: boolean;
  internal?: {
    provider?: string;
    providerError?: string;
    httpStatus?: number;
    requestId?: string;
    cause?: unknown;
  };
}

export class KixiError extends Error {
  readonly code: KixiErrorCode;
  readonly title: string;
  readonly action?: string;
  readonly severity: KixiErrorSeverity;
  readonly retryable: boolean;
  readonly internal?: KixiErrorParams["internal"];

  constructor(params: KixiErrorParams) {
    super(params.message);
    this.name = "KixiError";
    this.code = params.code;
    this.title = params.title;
    this.action = params.action;
    this.severity = params.severity ?? "error";
    this.retryable = params.retryable ?? false;
    this.internal = params.internal;
  }

  toPublicJSON() {
    return {
      code: this.code,
      title: this.title,
      message: this.message,
      action: this.action,
      severity: this.severity,
      retryable: this.retryable,
    };
  }
}

export const KIXI_ERROR_CODES = [
  "KIXI_DEPLOY_BUILD_FAILED",
  "KIXI_DEPLOY_CONTAINER_FAILED",
  "KIXI_DEPLOY_HEALTHCHECK_FAILED",
  "KIXI_SERVER_UNAVAILABLE",
  "KIXI_SERVER_CAPACITY_LIMIT",
  "KIXI_SERVER_DISK_FULL",
  "KIXI_SERVER_MEMORY_LIMIT",
  "KIXI_SERVER_NETWORK_ERROR",
  "KIXI_DOMAIN_DNS_ERROR",
  "KIXI_SSL_PROVISION_FAILED",
  "KIXI_GITHUB_ACCESS_ERROR",
  "KIXI_PAYMENT_FAILED",
  "KIXI_PAYMENT_DUPLICATE",
  "KIXI_WEBHOOK_INVALID_SIGNATURE",
  "KIXI_AUTH_UNAUTHORIZED",
  "KIXI_AUTH_MFA_REQUIRED",
  "KIXI_VALIDATION_ERROR",
  "KIXI_RATE_LIMIT_EXCEEDED",
  "KIXI_PATH_TRAVERSAL_BLOCKED",
  "KIXI_UNKNOWN_ERROR",
] as const;

export type KixiErrorCode = (typeof KIXI_ERROR_CODES)[number];
