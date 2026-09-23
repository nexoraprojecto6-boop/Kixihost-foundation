import type {
  CreateServerParams,
  InfrastructureProvider,
  ProviderServer,
} from "../interfaces/infrastructure-provider";

// Implementação do InfrastructureProvider para DigitalOcean.
// Provider inicial da plataforma (ver regra 18).
//
// TODO (Fase 6): implementar chamadas reais à API do DigitalOcean
// (Droplets API) usando DIGITALOCEAN_API_TOKEN. Não inventar respostas —
// esta classe apenas define o contrato e assinatura dos métodos.
export class DigitalOceanProvider implements InfrastructureProvider {
  readonly name = "digitalocean" as const;

  constructor(private readonly apiToken: string) {}

  async createServer(_params: CreateServerParams): Promise<ProviderServer> {
    throw new Error("DigitalOceanProvider.createServer: not yet implemented (Fase 6)");
  }

  async destroyServer(_externalId: string): Promise<void> {
    throw new Error("DigitalOceanProvider.destroyServer: not yet implemented (Fase 6)");
  }

  async getServerStatus(_externalId: string): Promise<ProviderServer> {
    throw new Error("DigitalOceanProvider.getServerStatus: not yet implemented (Fase 6)");
  }

  async listRegions(): Promise<string[]> {
    throw new Error("DigitalOceanProvider.listRegions: not yet implemented (Fase 6)");
  }
}
