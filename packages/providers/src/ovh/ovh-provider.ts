import type {
  CreateServerParams,
  InfrastructureProvider,
  ProviderServer,
} from "../interfaces/infrastructure-provider";

// Implementação do InfrastructureProvider para OVHcloud.
// Provider planeado para adição futura (ver regra 18).
//
// TODO (pós-Fase 6): implementar chamadas reais à OVH API usando
// OVH_ENDPOINT / OVH_APPLICATION_KEY / OVH_APPLICATION_SECRET / OVH_CONSUMER_KEY.
export class OVHProvider implements InfrastructureProvider {
  readonly name = "ovh" as const;

  constructor(
    private readonly endpoint: string,
    private readonly applicationKey: string,
    private readonly applicationSecret: string,
    private readonly consumerKey: string,
  ) {}

  async createServer(_params: CreateServerParams): Promise<ProviderServer> {
    throw new Error("OVHProvider.createServer: not yet implemented");
  }

  async destroyServer(_externalId: string): Promise<void> {
    throw new Error("OVHProvider.destroyServer: not yet implemented");
  }

  async getServerStatus(_externalId: string): Promise<ProviderServer> {
    throw new Error("OVHProvider.getServerStatus: not yet implemented");
  }

  async listRegions(): Promise<string[]> {
    throw new Error("OVHProvider.listRegions: not yet implemented");
  }
}
