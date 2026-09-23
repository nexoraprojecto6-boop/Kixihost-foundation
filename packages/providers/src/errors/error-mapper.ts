import { KixiError } from "@kixihost/shared";

// Traduz um erro bruto devolvido por um provider (DigitalOcean, Hetzner,
// OVH) para um KixiError seguro e consistente para o utilizador.
//
// Ver regra 16 do documento de fundação: o utilizador NUNCA recebe a
// mensagem bruta do provider. Os detalhes ficam apenas em `internal`,
// para logs/observabilidade.

export interface ProviderErrorInput {
  provider: "digitalocean" | "hetzner" | "ovh";
  httpStatus?: number;
  providerErrorCode?: string;
  providerMessage?: string;
  requestId?: string;
}

export function mapProviderError(input: ProviderErrorInput): KixiError {
  const { provider, httpStatus, providerErrorCode, providerMessage, requestId } = input;

  // TODO: mapear códigos reais de erro à medida que cada provider for
  // implementado (Fase 6). Por agora, apenas os casos mais comuns e
  // um fallback genérico e seguro.
  if (httpStatus === 422 || providerErrorCode === "DropletLimitExceeded") {
    return new KixiError({
      code: "KIXI_SERVER_CAPACITY_LIMIT",
      title: "Limite de capacidade atingido",
      message:
        "Não foi possível criar o ambiente porque o limite de recursos disponíveis foi atingido.",
      action: "A nossa equipa foi notificada. Tente novamente em alguns minutos.",
      severity: "error",
      retryable: true,
      internal: { provider, providerError: providerMessage, httpStatus, requestId },
    });
  }

  if (httpStatus && httpStatus >= 500) {
    return new KixiError({
      code: "KIXI_SERVER_UNAVAILABLE",
      title: "Infraestrutura temporariamente indisponível",
      message: "O provedor de infraestrutura está temporariamente indisponível.",
      severity: "error",
      retryable: true,
      internal: { provider, providerError: providerMessage, httpStatus, requestId },
    });
  }

  return new KixiError({
    code: "KIXI_SERVER_NETWORK_ERROR",
    title: "Erro de infraestrutura",
    message: "Ocorreu um erro inesperado ao comunicar com a infraestrutura.",
    severity: "error",
    retryable: true,
    internal: { provider, providerError: providerMessage, httpStatus, requestId },
  });
}
