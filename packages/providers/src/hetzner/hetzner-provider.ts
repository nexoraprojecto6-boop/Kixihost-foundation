import type {
  CreateServerParams,
  InfrastructureProvider,
  ProviderServer,
} from "../interfaces/infrastructure-provider";

// Implementação do InfrastructureProvider para Hetzner Cloud.
// Provider planeado para adição futura (ver regra 18), sem alterar a
// experiência do utilizador.
//
// TODO (pós-Fase 6): implementar chamadas reais à Hetzner Cloud API
// usando HETZNER_API_TOKEN.
export class HetznerProvider implements InfrastructureProvider {
  readonly name = "hetzner" as const;

  constructor(private readonly apiToken: string) {}

  async createServer(_params: CreateServerParams): Promise<ProviderServer> {
    throw new Error("HetznerProvider.createServer: not yet implemented");
  }

  async destroyServer(_externalId: string): Promise<void> {
    throw new Error("HetznerProvider.destroyServer: not yet implemented");
  }

  async getServerStatus(_externalId: string): Promise<ProviderServer> {
    throw new Error("HetznerProvider.getServerStatus: not yet implemented");
  }

  async listRegions(): Promise<string[]> {
    throw new Error("HetznerProvider.listRegions: not yet implemented");
  }
}
